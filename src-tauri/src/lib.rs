use pulldown_cmark::{Event, HeadingLevel, Options, Parser, Tag, TagEnd};
use serde::Serialize;

#[derive(Serialize, Clone, Debug)]
struct INode {
    content: String,
    children: Vec<INode>,
    depth: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    payload: Option<INodePayload>,
}

#[derive(Serialize, Clone, Debug)]
struct INodePayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    fold: Option<i32>,
}

fn heading_level_to_depth(level: HeadingLevel) -> i32 {
    match level {
        HeadingLevel::H1 => 1,
        HeadingLevel::H2 => 2,
        HeadingLevel::H3 => 3,
        HeadingLevel::H4 => 4,
        HeadingLevel::H5 => 5,
        HeadingLevel::H6 => 6,
    }
}

fn events_to_html(events: &[Event<'_>]) -> String {
    let mut html = String::new();
    pulldown_cmark::html::push_html(&mut html, events.iter().cloned());
    // Trim wrapping <p> tags for inline content
    let trimmed = html.trim();
    let trimmed = if trimmed.starts_with("<p>") && trimmed.ends_with("</p>") {
        &trimmed[3..trimmed.len() - 4]
    } else {
        trimmed
    };
    trimmed.to_string()
}

#[tauri::command]
fn parse_markdown(md: &str) -> INode {
    let options = Options::all();
    let parser = Parser::new_ext(md, options);
    let events: Vec<Event<'_>> = parser.collect();

    // Root node
    let mut root = INode {
        content: String::new(),
        children: Vec::new(),
        depth: 0,
        payload: None,
    };

    // Stack of heading nodes: (depth, node)
    // We'll build up heading nodes and attach list items as children
    let mut heading_stack: Vec<INode> = Vec::new();
    let mut i = 0;

    while i < events.len() {
        match &events[i] {
            Event::Start(Tag::Heading { level, .. }) => {
                let depth = heading_level_to_depth(*level);
                // Collect inline events until end of heading
                i += 1;
                let mut inline_events = Vec::new();
                while i < events.len() {
                    if matches!(&events[i], Event::End(TagEnd::Heading(..))) {
                        break;
                    }
                    inline_events.push(events[i].clone());
                    i += 1;
                }
                let content = events_to_html(&inline_events);

                let node = INode {
                    content,
                    children: Vec::new(),
                    depth,
                    payload: None,
                };

                // Pop headings from stack that are at same or deeper level
                while let Some(top) = heading_stack.last() {
                    if top.depth >= depth {
                        let child = heading_stack.pop().unwrap();
                        if let Some(parent) = heading_stack.last_mut() {
                            parent.children.push(child);
                        } else {
                            root.children.push(child);
                        }
                    } else {
                        break;
                    }
                }

                heading_stack.push(node);
            }
            Event::Start(Tag::List(_)) => {
                // Parse list items and attach to current heading
                let list_children = parse_list(&events, &mut i);
                if let Some(heading) = heading_stack.last_mut() {
                    heading.children.extend(list_children);
                } else {
                    root.children.extend(list_children);
                }
            }
            _ => {}
        }
        i += 1;
    }

    // Flush remaining headings
    while let Some(child) = heading_stack.pop() {
        if let Some(parent) = heading_stack.last_mut() {
            parent.children.push(child);
        } else {
            root.children.push(child);
        }
    }

    // If there's only one top-level child, promote it to root
    if root.children.len() == 1 && root.content.is_empty() {
        root = root.children.remove(0);
        root.depth = 0;
    }

    // Reassign depths based on tree structure
    fix_depths(&mut root, 0);

    root
}

fn parse_list(events: &[Event<'_>], i: &mut usize) -> Vec<INode> {
    let mut items: Vec<INode> = Vec::new();
    let mut list_depth = 1;

    *i += 1; // skip Start(List(..))

    while *i < events.len() && list_depth > 0 {
        match &events[*i] {
            Event::Start(Tag::List(_)) => {
                list_depth += 1;
                // Nested list: parse recursively and attach to last item
                let nested = parse_list(events, i);
                if let Some(last) = items.last_mut() {
                    last.children.extend(nested);
                }
                // parse_list leaves i at End(List), outer loop will increment
            }
            Event::End(TagEnd::List(_)) => {
                list_depth -= 1;
                if list_depth == 0 {
                    // Don't increment i here; the outer loop does it
                    return items;
                }
            }
            Event::Start(Tag::Item) => {
                // Collect inline content of this list item
                *i += 1;
                let mut inline_events = Vec::new();
                let mut item_depth = 1;
                while *i < events.len() {
                    match &events[*i] {
                        Event::Start(Tag::Item) => item_depth += 1,
                        Event::End(TagEnd::Item) => {
                            item_depth -= 1;
                            if item_depth == 0 {
                                break;
                            }
                        }
                        Event::Start(Tag::List(_)) => {
                            // Nested list inside item
                            let nested = parse_list(events, i);
                            let content = events_to_html(&inline_events);
                            let mut node = INode {
                                content,
                                children: nested,
                                depth: 0,
                                payload: None,
                            };
                            // Continue collecting after nested list
                            // But we already created the node, so push and reset
                            // Actually, collect remaining inline events after the nested list
                            *i += 1; // move past End(List)
                            // Keep collecting
                            let mut more_inline = Vec::new();
                            while *i < events.len() {
                                match &events[*i] {
                                    Event::End(TagEnd::Item) => break,
                                    Event::Start(Tag::List(_)) => {
                                        let more_nested = parse_list(events, i);
                                        node.children.extend(more_nested);
                                    }
                                    other => {
                                        more_inline.push(other.clone());
                                    }
                                }
                                *i += 1;
                            }
                            if !more_inline.is_empty() {
                                let more_html = events_to_html(&more_inline);
                                if !more_html.is_empty() {
                                    node.content.push(' ');
                                    node.content.push_str(&more_html);
                                }
                            }
                            items.push(node);
                            // Skip to after End(Item)
                            // i is at End(Item), outer loop will handle
                            inline_events.clear();
                            break;
                        }
                        other => {
                            inline_events.push(other.clone());
                        }
                    }
                    *i += 1;
                }
                if !inline_events.is_empty() {
                    let content = events_to_html(&inline_events);
                    items.push(INode {
                        content,
                        children: Vec::new(),
                        depth: 0,
                        payload: None,
                    });
                }
            }
            _ => {}
        }
        *i += 1;
    }

    items
}

fn fix_depths(node: &mut INode, depth: i32) {
    node.depth = depth;
    for child in &mut node.children {
        fix_depths(child, depth + 1);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![parse_markdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
