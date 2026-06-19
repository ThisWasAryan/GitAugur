use crate::git::{execute_git_command, GitResult};
use crate::storage::AppState;
use tauri::State;

#[tauri::command]
pub fn git_status(repo_path: String) -> Result<GitResult, String> {
    execute_git_command(&repo_path, &["status", "--porcelain", "--branch"])
}

#[tauri::command]
pub fn git_log(repo_path: String, max_count: Option<u32>) -> Result<GitResult, String> {
    let mut args = vec!["log", "--oneline", "--decorate", "--color=never"];
    let count_str;
    if let Some(count) = max_count {
        count_str = format!("-n{}", count);
        args.push(&count_str);
    }
    execute_git_command(&repo_path, &args)
}
