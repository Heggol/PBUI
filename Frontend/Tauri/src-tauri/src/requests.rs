use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct PBState {
    song_states: serde_json::Value,
    current_flow_step: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct SuccessResponse {
    success: bool,
}

#[command]
pub async fn update_state(song_states: serde_json::Value, current_flow_step: u32) -> Result<bool, String> {
    let client = Client::new();
    let url = "https://api.pbui.net/api/update";

    let body = serde_json::json!({
        "songStates": song_states,
        "currentFlowStep": current_flow_step
    });

    let resp = client
        .post(url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    let response_json: SuccessResponse = resp
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    Ok(response_json.success)
}

#[command]
pub async fn reset_state() -> Result<bool, String> {
    let client = Client::new();
    let url = "https://api.pbui.net/api/reset";

    let resp = client
        .post(url)
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    let response_json: SuccessResponse = resp
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    Ok(response_json.success)
}

#[command]
pub async fn get_current_state() -> Result<PBState, String> {
    let client = Client::new();
    let url = "https://api.pbui.net/api/state";

    let resp = client
        .get(url)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    let state: PBState = resp
        .json()
        .await
        .map_err(|e| format!("JSON parse error: {}", e))?;

    Ok(state)
}
