use crate::git::{execute_git_command, GitResult};
use crate::git::models::GitHistoryData;
use crate::git::parse::parse_history;
use crate::storage::AppState;
use tauri::{State, AppHandle, Emitter};
use std::process::Command;
use std::time::Instant;
use serde::Serialize;

#[derive(Clone, Serialize)]
struct GitOperationEvent {
    action: String,
    command: String,
    status: String,
    duration_ms: u128,
    stdout: String,
    stderr: String,
}

fn execute_and_emit(app: &AppHandle, repo_path: &str, action: &str, args: &[&str]) -> Result<GitResult, String> {
    let start = Instant::now();
    let result = execute_git_command(repo_path, args);
    let duration = start.elapsed().as_millis();
    
    let command_str = format!("git {}", args.join(" "));
    
    match &result {
        Ok(res) => {
            let status = if res.success { "Completed" } else { "Failed" };
            let _ = app.emit("git-operation", GitOperationEvent {
                action: action.to_string(),
                command: command_str,
                status: status.to_string(),
                duration_ms: duration,
                stdout: res.stdout.clone(),
                stderr: res.stderr.clone(),
            });
        },
        Err(e) => {
            let _ = app.emit("git-operation", GitOperationEvent {
                action: action.to_string(),
                command: command_str,
                status: "Failed".to_string(),
                duration_ms: duration,
                stdout: "".to_string(),
                stderr: e.clone(),
            });
        }
    }
    
    result
}

#[tauri::command]
pub fn git_status(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Status", &["status", "--porcelain", "--branch"])
}

#[tauri::command]
pub fn git_log(app: AppHandle, repo_path: String, max_count: Option<u32>) -> Result<GitResult, String> {
    let mut args = vec!["log", "--oneline", "--decorate", "--color=never"];
    let count_str;
    if let Some(count) = max_count {
        count_str = format!("-n{}", count);
        args.push(&count_str);
    }
    execute_and_emit(&app, &repo_path, "Log", &args)
}

#[tauri::command]
pub fn get_repo_state(repo_path: String) -> Result<GitHistoryData, String> {
    parse_history(&repo_path)
}

#[tauri::command]
pub fn git_clone(app: AppHandle, url: String, path: String) -> Result<GitResult, String> {
    let start = Instant::now();
    let output = Command::new("git")
        .args(&["clone", &url, &path])
        .output()
        .map_err(|e| format!("Failed to execute git process: {}", e))?;

    let duration = start.elapsed().as_millis();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    let success = output.status.success();
    let status_str = if success { "Completed" } else { "Failed" };
    
    let _ = app.emit("git-operation", GitOperationEvent {
        action: "Clone Repository".to_string(),
        command: format!("git clone {} {}", url, path),
        status: status_str.to_string(),
        duration_ms: duration,
        stdout: stdout.clone(),
        stderr: stderr.clone(),
    });

    Ok(GitResult {
        stdout,
        stderr,
        success,
        exit_code: output.status.code().unwrap_or(-1),
    })
}

#[tauri::command]
pub fn git_add(app: AppHandle, repo_path: String, files: Vec<String>) -> Result<GitResult, String> {
    let mut args = vec!["add"];
    let file_refs: Vec<&str> = files.iter().map(|s| s.as_str()).collect();
    args.extend(file_refs);
    execute_and_emit(&app, &repo_path, "Stage Files", &args)
}

#[tauri::command]
pub fn git_commit(app: AppHandle, repo_path: String, message: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Commit", &["commit", "-m", &message])
}

#[tauri::command]
pub fn git_reset(app: AppHandle, repo_path: String, files: Vec<String>) -> Result<GitResult, String> {
    let mut args = vec!["reset", "HEAD"];
    let file_refs: Vec<&str> = files.iter().map(|s| s.as_str()).collect();
    args.extend(file_refs);
    execute_and_emit(&app, &repo_path, "Unstage Files", &args)
}

#[tauri::command]
pub fn git_checkout(app: AppHandle, repo_path: String, branch: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Checkout Branch", &["checkout", &branch])
}

#[tauri::command]
pub fn git_merge(app: AppHandle, repo_path: String, branch: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Merge", &["merge", &branch])
}

#[tauri::command]
pub fn git_diff(app: AppHandle, repo_path: String, file: String, cached: bool) -> Result<GitResult, String> {
    let mut args = vec!["diff"];
    if cached {
        args.push("--cached");
    }
    args.push("--");
    args.push(&file);
    execute_and_emit(&app, &repo_path, "Diff", &args)
}

#[tauri::command]
pub fn git_init(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Initialize Repository", &["init"])
}

#[tauri::command]
pub fn git_rm(app: AppHandle, repo_path: String, file: String, cached: bool) -> Result<GitResult, String> {
    let mut args = vec!["rm"];
    if cached {
        args.push("--cached");
    }
    args.push(&file);
    execute_and_emit(&app, &repo_path, "Remove File", &args)
}

#[tauri::command]
pub fn git_mv(app: AppHandle, repo_path: String, source: String, destination: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Move/Rename", &["mv", &source, &destination])
}

#[tauri::command]
pub fn git_branch(app: AppHandle, repo_path: String, branch_name: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Create Branch", &["branch", &branch_name])
}

#[tauri::command]
pub fn git_switch(app: AppHandle, repo_path: String, branch_name: String, create: bool) -> Result<GitResult, String> {
    let mut args = vec!["switch"];
    if create {
        args.push("-c");
    }
    args.push(&branch_name);
    execute_and_emit(&app, &repo_path, "Switch Branch", &args)
}

#[tauri::command]
pub fn git_rebase(app: AppHandle, repo_path: String, branch: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Rebase", &["rebase", &branch])
}

#[tauri::command]
pub fn git_cherry_pick(app: AppHandle, repo_path: String, commit_hash: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Cherry-Pick", &["cherry-pick", &commit_hash])
}

#[tauri::command]
pub fn git_tag(app: AppHandle, repo_path: String, tag_name: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Create Tag", &["tag", &tag_name])
}

#[tauri::command]
pub fn git_fetch(app: AppHandle, repo_path: String, remote: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Fetch", &["fetch", &remote])
}

#[tauri::command]
pub fn git_pull(app: AppHandle, repo_path: String, remote: String, branch: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Pull", &["pull", &remote, &branch])
}

#[tauri::command]
pub fn git_push(app: AppHandle, repo_path: String, remote: String, branch: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Push", &["push", &remote, &branch])
}

#[tauri::command]
pub fn git_remote(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "List Remotes", &["remote", "-v"])
}

#[tauri::command]
pub fn git_stash(app: AppHandle, repo_path: String, action: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Stash", &["stash", &action])
}

#[tauri::command]
pub fn git_clean(app: AppHandle, repo_path: String, force: bool) -> Result<GitResult, String> {
    let mut args = vec!["clean"];
    if force {
        args.push("-f");
    } else {
        args.push("-n"); // dry run if not forced
    }
    execute_and_emit(&app, &repo_path, "Clean", &args)
}

#[tauri::command]
pub fn git_reflog(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Reflog", &["reflog"])
}

#[tauri::command]
pub fn git_show(app: AppHandle, repo_path: String, commit_hash: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Show Commit", &["show", &commit_hash])
}

#[tauri::command]
pub fn git_commit_details(app: AppHandle, repo_path: String, commit_hash: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Commit Details", &["show", &commit_hash, "--name-status", "--pretty=format:%B"])
}

#[tauri::command]
pub fn git_exec(app: AppHandle, repo_path: String, args: Vec<String>) -> Result<GitResult, String> {
    let str_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    execute_and_emit(&app, &repo_path, "Terminal Execution", &str_args)
}
