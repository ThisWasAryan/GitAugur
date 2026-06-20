use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GhResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
    pub exit_code: i32,
}

pub fn execute_gh_command(repo_path: &str, args: &[&str]) -> Result<GhResult, String> {
    let output = Command::new("gh")
        .current_dir(repo_path)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute gh: {}", e))?;

    Ok(GhResult {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        success: output.status.success(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

#[tauri::command]
pub fn gh_auth_status(repo_path: String) -> Result<GhResult, String> {
    execute_gh_command(&repo_path, &["auth", "status"])
}

#[tauri::command]
pub fn gh_pr_list(repo_path: String) -> Result<GhResult, String> {
    execute_gh_command(&repo_path, &["pr", "list", "--json", "number,title,state,url,author"])
}
