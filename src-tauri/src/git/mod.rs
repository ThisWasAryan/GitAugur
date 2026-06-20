pub mod models;
pub mod parse;

use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct GitResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
    pub exit_code: i32,
}

pub fn execute_git_command(repo_path: &str, args: &[&str]) -> Result<GitResult, String> {
    let output = Command::new("git")
        .current_dir(repo_path)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute git process: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    Ok(GitResult {
        stdout,
        stderr,
        success: output.status.success(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}
