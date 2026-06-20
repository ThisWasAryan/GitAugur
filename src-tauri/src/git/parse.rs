use crate::git::execute_git_command;
use crate::git::models::{GitCommit, GitBranch, GitHistoryData, GitTag, GitAuthor};
use std::path::Path;

pub fn parse_history(repo_path: &str) -> Result<GitHistoryData, String> {
    // 1. Fetch Commits
    // Format: Hash, ParentHashes, AuthorName, AuthorEmail, IsoDate, Subject
    let log_result = execute_git_command(
        repo_path,
        &["log", "--branches", "--tags", "--remotes", "HEAD", "--pretty=format:%H%x00%P%x00%an%x00%ae%x00%aI%x00%s", "-n", "1000"]
    )?;

    let mut commits = Vec::new();
    if log_result.success && !log_result.stdout.trim().is_empty() {
        for line in log_result.stdout.lines() {
            let parts: Vec<&str> = line.split('\x00').collect();
            if parts.len() >= 6 {
                let parent_hashes: Vec<String> = parts[1]
                    .split_whitespace()
                    .filter(|s| !s.is_empty())
                    .map(|s| s.to_string())
                    .collect();

                commits.push(GitCommit {
                    hash: parts[0].to_string(),
                    parent_hashes,
                    author: GitAuthor {
                        name: parts[2].to_string(),
                        email: parts[3].to_string(),
                    },
                    timestamp: parts[4].to_string(),
                    message: parts[5].to_string(),
                });
            }
        }
    }

    // Determine HEAD explicit state
    let head_hash_res = execute_git_command(repo_path, &["rev-parse", "HEAD"])?;
    let head_hash = if head_hash_res.success { head_hash_res.stdout.trim().to_string() } else { String::new() };

    let symbolic_ref_res = execute_git_command(repo_path, &["symbolic-ref", "--short", "HEAD"])?;
    let current_branch = if symbolic_ref_res.success {
        symbolic_ref_res.stdout.trim().to_string()
    } else {
        String::new()
    };
    
    let head = if !current_branch.is_empty() {
        current_branch.clone()
    } else {
        head_hash.clone()
    };

    // 2. Fetch Branches
    let mut branches = Vec::new();
    let branch_result = execute_git_command(
        repo_path,
        &["for-each-ref", "--format=%(refname:short)%00%(objectname)%00%(upstream:short)%00%(upstream:track)", "refs/heads/", "refs/remotes/"]
    )?;

    if branch_result.success && !branch_result.stdout.trim().is_empty() {
        for line in branch_result.stdout.lines() {
            let parts: Vec<&str> = line.split('\x00').collect();
            if parts.len() >= 2 {
                let name = parts[0].to_string();
                let commit_hash = parts[1].to_string();
                let is_current = name == current_branch;
                
                // Exclude HEAD from remotes if it shows up like origin/HEAD
                if name.ends_with("/HEAD") {
                    continue;
                }

                let is_remote = name.contains('/');
                let upstream = if parts.len() >= 3 && !parts[2].is_empty() { Some(parts[2].to_string()) } else { None };
                
                let mut ahead = 0;
                let mut behind = 0;
                
                if parts.len() >= 4 && !parts[3].is_empty() {
                    let track = parts[3];
                    if let Some(idx) = track.find("ahead ") {
                        let sub = &track[idx+6..];
                        let end_idx = sub.find(|c: char| !c.is_ascii_digit()).unwrap_or(sub.len());
                        if let Ok(num) = sub[..end_idx].parse::<u32>() {
                            ahead = num;
                        }
                    }
                    if let Some(idx) = track.find("behind ") {
                        let sub = &track[idx+7..];
                        let end_idx = sub.find(|c: char| !c.is_ascii_digit()).unwrap_or(sub.len());
                        if let Ok(num) = sub[..end_idx].parse::<u32>() {
                            behind = num;
                        }
                    }
                }

                branches.push(GitBranch {
                    name,
                    commit_hash,
                    is_remote,
                    is_current,
                    upstream,
                    ahead,
                    behind,
                });
            }
        }
    }

    // 3. Fetch Status
    let mut staged_files = Vec::new();
    let mut unstaged_files = Vec::new();
    let status_result = execute_git_command(repo_path, &["-c", "core.quotePath=false", "status", "--porcelain"])?;

    if status_result.success && !status_result.stdout.trim().is_empty() {
        for line in status_result.stdout.lines() {
            if line.len() > 3 {
                let status_chars: Vec<char> = line.chars().take(2).collect();
                let mut path = line[3..].to_string();
                if path.starts_with('"') && path.ends_with('"') {
                    path = path[1..path.len()-1].to_string();
                }

                let staged_char = status_chars[0];
                let unstaged_char = status_chars[1];

                let map_status = |c: char| -> String {
                    match c {
                        'A' => "added".to_string(),
                        'M' => "modified".to_string(),
                        'D' => "deleted".to_string(),
                        'U' => "conflicted".to_string(),
                        '?' => "untracked".to_string(),
                        _ => "modified".to_string(),
                    }
                };

                if staged_char != ' ' && staged_char != '?' && staged_char != 'U' {
                    staged_files.push(crate::git::models::FileStatus {
                        path: path.clone(),
                        status: map_status(staged_char),
                    });
                }

                if unstaged_char != ' ' {
                    // UU means unmerged (both modified)
                    let status_to_use = if staged_char == 'U' || unstaged_char == 'U' {
                        "conflicted".to_string()
                    } else {
                        map_status(unstaged_char)
                    };
                    
                    unstaged_files.push(crate::git::models::FileStatus {
                        path,
                        status: status_to_use,
                    });
                }
            }
        }
    }

    // 4. Fetch Tags
    let mut tags = Vec::new();
    let tag_result = execute_git_command(
        repo_path,
        &["for-each-ref", "--format=%(refname:short)%00%(objectname)", "refs/tags/"]
    )?;

    if tag_result.success && !tag_result.stdout.trim().is_empty() {
        for line in tag_result.stdout.lines() {
            let parts: Vec<&str> = line.split('\x00').collect();
            if parts.len() == 2 {
                tags.push(GitTag {
                    name: parts[0].to_string(),
                    commit_hash: parts[1].to_string(),
                    message: None, // Can fetch tag message if needed
                });
            }
        }
    }

    // 5. Determine Repository State
    let git_dir = Path::new(repo_path).join(".git");
    let repository_state = if git_dir.join("REBASE_HEAD").exists() || git_dir.join("rebase-merge").exists() || git_dir.join("rebase-apply").exists() {
        "REBASING".to_string()
    } else if git_dir.join("MERGE_HEAD").exists() {
        "MERGING".to_string()
    } else if git_dir.join("CHERRY_PICK_HEAD").exists() {
        "CHERRY_PICKING".to_string()
    } else if git_dir.join("REVERT_HEAD").exists() {
        "REVERTING".to_string()
    } else {
        "NORMAL".to_string()
    };

    Ok(GitHistoryData {
        head,
        commits,
        branches,
        tags,
        staged_files,
        unstaged_files,
        repository_state,
    })
}
