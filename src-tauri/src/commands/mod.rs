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
    let mut args = vec!["add", "--"];
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
    let mut args = vec!["reset", "HEAD", "--"];
    let file_refs: Vec<&str> = files.iter().map(|s| s.as_str()).collect();
    args.extend(file_refs);
    execute_and_emit(&app, &repo_path, "Unstage Files", &args)
}

#[tauri::command]
pub fn git_checkout(app: AppHandle, repo_path: String, branch: String) -> Result<GitResult, String> {
    if branch.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    if branch.starts_with("origin/") {
        let local_name = branch.strip_prefix("origin/").unwrap();
        execute_and_emit(&app, &repo_path, "Checkout Remote Branch", &["checkout", "-b", local_name, &branch])
    } else {
        execute_and_emit(&app, &repo_path, "Checkout Branch", &["checkout", &branch])
    }
}

#[tauri::command]
pub fn git_merge(app: AppHandle, repo_path: String, branch: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Merge", &["merge", &branch])
}

#[tauri::command]
pub fn git_checkout_all_remotes(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    // 1. Fetch to be sure
    let _ = execute_git_command(&repo_path, &["fetch", "--all"]);
    
    // 2. Get all remote branches
    let output = execute_git_command(&repo_path, &["branch", "-r"])?;
    
    // 3. Track each one locally
    for line in output.lines() {
        let branch = line.trim();
        if branch.contains("->") || branch.is_empty() {
            continue; // Skip HEAD aliases
        }
        
        let parts: Vec<&str> = branch.splitn(2, '/').collect();
        if parts.len() == 2 {
            let local_name = parts[1];
            // Ignore errors here if branch already exists
            let _ = execute_git_command(&repo_path, &["branch", "--track", local_name, branch]);
        }
    }
    
    Ok(GitResult {
        success: true,
        stdout: "All remotes checked out locally".to_string(),
        stderr: "".to_string(),
    })
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
    args.push("--");
    args.push(&file);
    execute_and_emit(&app, &repo_path, "Remove File", &args)
}

#[tauri::command]
pub fn git_mv(app: AppHandle, repo_path: String, source: String, destination: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Move/Rename", &["mv", &source, &destination])
}

#[tauri::command]
pub fn git_branch(app: AppHandle, repo_path: String, branch_name: String) -> Result<GitResult, String> {
    if branch_name.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    execute_and_emit(&app, &repo_path, "Create Branch", &["branch", &branch_name])
}

#[tauri::command]
pub fn git_switch(app: AppHandle, repo_path: String, branch_name: String, create: bool, base_branch: Option<String>) -> Result<GitResult, String> {
    if branch_name.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    let mut args = vec!["switch"];
    if create {
        args.push("-c");
    }
    args.push(&branch_name);
    
    // Convert String to &str before passing to args.push
    let base_ref = base_branch.as_deref();
    if let Some(base) = base_ref {
        args.push(base);
    }
    
    execute_and_emit(&app, &repo_path, "Switch Branch", &args)
}

#[tauri::command]
pub fn git_rebase(app: AppHandle, repo_path: String, branch: String) -> Result<GitResult, String> {
    if branch.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    execute_and_emit(&app, &repo_path, "Rebase", &["rebase", &branch])
}

#[tauri::command]
pub fn git_cherry_pick(app: AppHandle, repo_path: String, commit_hash: String) -> Result<GitResult, String> {
    if commit_hash.starts_with("-") {
        return Err("Invalid commit hash".to_string());
    }
    execute_and_emit(&app, &repo_path, "Cherry-Pick", &["cherry-pick", &commit_hash])
}

#[tauri::command]
pub fn git_tag(app: AppHandle, repo_path: String, tag_name: String) -> Result<GitResult, String> {
    if tag_name.starts_with("-") {
        return Err("Invalid tag name".to_string());
    }
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
pub fn git_branch_delete(app: AppHandle, repo_path: String, branch_name: String) -> Result<GitResult, String> {
    if branch_name.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    execute_and_emit(&app, &repo_path, "Delete Branch", &["branch", "-D", &branch_name])
}

#[tauri::command]
pub fn git_tag_create(app: AppHandle, repo_path: String, tag_name: String, message: Option<String>) -> Result<GitResult, String> {
    if tag_name.starts_with("-") {
        return Err("Invalid tag name".to_string());
    }
    let mut args = vec!["tag", &tag_name];
    let msg_ref = if let Some(ref m) = message { m } else { "" };
    if message.is_some() {
        args.push("-m");
        args.push(msg_ref);
    }
    execute_and_emit(&app, &repo_path, "Create Tag", &args)
}

#[tauri::command]
pub fn git_reflog(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Reflog", &["reflog", "-n", "10", "--oneline"])
}

#[tauri::command]
pub fn git_ls_tree(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "List Files", &["ls-tree", "-r", "HEAD", "--name-only"])
}

#[tauri::command]
pub fn git_stash_list(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "List Stashes", &["stash", "list", "--pretty=format:%gd%x00%s"])
}

#[tauri::command]
pub fn git_stash_push(app: AppHandle, repo_path: String, message: Option<String>) -> Result<GitResult, String> {
    let mut args = vec!["stash", "push"];
    let msg_ref = if let Some(ref m) = message { m } else { "" };
    if message.is_some() {
        args.push("-m");
        args.push(msg_ref);
    }
    execute_and_emit(&app, &repo_path, "Stash Push", &args)
}

#[tauri::command]
pub fn git_stash_pop(app: AppHandle, repo_path: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Stash Pop", &["stash", "pop"])
}

#[tauri::command]
pub fn git_stash_drop(app: AppHandle, repo_path: String, stash_ref: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Stash Drop", &["stash", "drop", &stash_ref])
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
pub fn git_show(app: AppHandle, repo_path: String, commit_hash: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Show Commit", &["show", &commit_hash])
}

#[tauri::command]
pub fn git_commit_details(app: AppHandle, repo_path: String, commit_hash: String) -> Result<GitResult, String> {
    execute_and_emit(&app, &repo_path, "Commit Details", &["show", &commit_hash, "--name-status", "--pretty=format:%B"])
}

#[tauri::command]
pub fn git_exec(app: AppHandle, repo_path: String, args: Vec<String>) -> Result<GitResult, String> {
    let allowed_subcommands = [
        "show", "diff", "stash", "log", "status", "branch", "checkout", "commit", 
        "add", "reset", "revert", "cherry-pick", "rebase", "merge", "fetch", "pull", "push", "tag", "clean", "rm", "mv"
    ];
    
    let mut safe_args = Vec::new();
    let mut has_subcommand = false;

    for arg in args.iter() {
        if !has_subcommand {
            if arg.starts_with("-") {
                if arg == "-c" || arg.starts_with("--exec-path") || arg.starts_with("--core.") || arg.starts_with("--pager") || arg.starts_with("--upload-pack") || arg.starts_with("--receive-pack") {
                    return Err(format!("Dangerous global flag rejected: {}", arg));
                }
                safe_args.push(arg.clone());
            } else {
                if !allowed_subcommands.contains(&arg.as_str()) {
                    return Err(format!("Subcommand not allowed or recognized: {}", arg));
                }
                has_subcommand = true;
                safe_args.push(arg.clone());
            }
        } else {
            if arg.starts_with("--upload-pack") || arg.starts_with("--receive-pack") {
                return Err(format!("Dangerous flag rejected: {}", arg));
            }
            safe_args.push(arg.clone());
        }
    }

    if !has_subcommand {
        return Err("No valid git subcommand provided.".to_string());
    }

    let str_args: Vec<&str> = safe_args.iter().map(|s| s.as_str()).collect();
    execute_and_emit(&app, &repo_path, "Terminal Execution", &str_args)
}

#[tauri::command]
pub fn git_show_file(app: AppHandle, repo_path: String, file_path: String) -> Result<GitResult, String> {
    let target = format!("HEAD:{}", file_path);
    let result = execute_and_emit(&app, &repo_path, "Show File Content", &["show", &target])?;
    
    // If we fail to get from HEAD (e.g. untracked file or new repo), try reading from disk
    if !result.success {
        let full_path = std::path::Path::new(&repo_path).join(&file_path);
        if let Ok(content) = std::fs::read_to_string(full_path) {
            return Ok(GitResult {
                success: true,
                stdout: content,
                stderr: String::new(),
                exit_code: 0,
            });
        }
    }
    
    Ok(result)
}

#[tauri::command]
pub fn read_file_content(app: AppHandle, repo_path: String, file_path: String) -> Result<String, String> {
    let full_path = std::path::Path::new(&repo_path).join(&file_path);
    std::fs::read_to_string(full_path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub fn write_file_content(app: AppHandle, repo_path: String, file_path: String, content: String) -> Result<String, String> {
    let full_path = std::path::Path::new(&repo_path).join(&file_path);
    std::fs::write(full_path, content).map_err(|e| format!("Failed to write file: {}", e))?;
    Ok("Success".to_string())
}

#[tauri::command]
pub fn git_merge_tree(app: AppHandle, repo_path: String, target_branch: String) -> Result<GitResult, String> {
    if target_branch.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    execute_and_emit(&app, &repo_path, "Merge Tree Preview", &["merge-tree", "HEAD", &target_branch])
}

#[tauri::command]
pub fn git_apply_cached(app: AppHandle, repo_path: String, patch: String, reverse: bool) -> Result<GitResult, String> {
    use std::io::Write;
    let start = Instant::now();
    
    let mut cmd_args = vec!["apply", "--cached"];
    if reverse {
        cmd_args.push("-R");
    }
    cmd_args.push("-");

    let mut child = Command::new("git")
        .current_dir(&repo_path)
        .args(&cmd_args)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn git apply: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(patch.as_bytes()).map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().map_err(|e| e.to_string())?;
    let duration = start.elapsed().as_millis();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    let success = output.status.success();
    let status_str = if success { "Completed" } else { "Failed" };
    
    let _ = app.emit("git-operation", GitOperationEvent {
        action: "Apply Patch".to_string(),
        command: "git apply --cached -".to_string(),
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
pub fn gh_exec(app: AppHandle, repo_path: String, args: Vec<String>) -> Result<GitResult, String> {
    let start = Instant::now();
    let output = Command::new("gh")
        .current_dir(&repo_path)
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute gh process: {}", e))?;

    let duration = start.elapsed().as_millis();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    let success = output.status.success();
    let status_str = if success { "Completed" } else { "Failed" };
    
    let _ = app.emit("git-operation", GitOperationEvent {
        action: "GitHub CLI".to_string(),
        command: format!("gh {}", args.join(" ")),
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
pub fn git_rebase_interactive(app: AppHandle, repo_path: String, branch: String, instructions: String) -> Result<GitResult, String> {
    if branch.starts_with("-") {
        return Err("Invalid branch name".to_string());
    }
    use std::io::Write;
    let start = Instant::now();
    
    let mut temp_script = std::env::temp_dir();
    temp_script.push(format!("git_seq_editor_{}.sh", std::process::id()));
    
    let instructions_file = temp_script.with_extension("txt");
    std::fs::write(&instructions_file, instructions).map_err(|e| e.to_string())?;
    
    #[cfg(unix)]
    let script_content = format!("#!/bin/sh\ncp \"{}\" \"$1\"\n", instructions_file.to_string_lossy());
    
    #[cfg(windows)]
    let script_content = format!("@echo off\ncopy /y \"{}\" %1\n", instructions_file.to_string_lossy());
    
    std::fs::write(&temp_script, script_content).map_err(|e| e.to_string())?;
    
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = std::fs::metadata(&temp_script).map_err(|e| e.to_string())?.permissions();
        perms.set_mode(0o755);
        std::fs::set_permissions(&temp_script, perms).map_err(|e| e.to_string())?;
    }
    
    let script_path = temp_script.to_string_lossy().to_string();

    let output = Command::new("git")
        .current_dir(&repo_path)
        .env("GIT_SEQUENCE_EDITOR", &script_path)
        .args(&["rebase", "-i", &branch])
        .output()
        .map_err(|e| format!("Failed to spawn git rebase: {}", e))?;

    let _ = std::fs::remove_file(&temp_script);
    let _ = std::fs::remove_file(&instructions_file);

    let duration = start.elapsed().as_millis();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    let success = output.status.success();
    let status_str = if success { "Completed" } else { "Failed" };
    
    let _ = app.emit("git-operation", GitOperationEvent {
        action: "Interactive Rebase".to_string(),
        command: format!("git rebase -i {}", branch),
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
