#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::command;
use include_dir::{include_dir, Dir};

mod requests;

static STATIC_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/static");

#[derive(Debug, Serialize, Deserialize)]
struct Difficulty {
    name: String,
    characteristic: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Song {
    hash: String,
    bsr: String,
    song_name: String,
    song_artist: String,
    song_mapper: String,
    date_uploaded: String,
    difficulties: Vec<Difficulty>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Playlist {
    playlist_title: String,
    songs: Vec<Song>,
}

#[command]
fn get_playlists() -> Result<Vec<Playlist>, String> {
    let mut playlists = Vec::new();

    for file in STATIC_DIR.files() {
        if file.path().extension().and_then(|ext| ext.to_str()) == Some("json") {
            let content = file.contents_utf8().ok_or_else(|| {
                format!("Failed to read file: {}", file.path().display())
            })?;
            let playlist: Playlist = serde_json::from_str(content)
                .map_err(|e| format!("Failed to parse JSON from {}: {}", file.path().display(), e))?;
            playlists.push(playlist);
        }
    }

    Ok(playlists)
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_playlists,
            requests::update_state,
            requests::reset_state,
            requests::get_current_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
