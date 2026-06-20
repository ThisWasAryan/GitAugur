use crate::git::execute_git_command;
use crate::git::models::{GitCommit, GitBranch, GitHistoryData, GitTag, GitAuthor};

pub fn parse_history(repo_path: &str) -> Result<GitHistoryData, String> {
    // 1. Fetch Commits
    // Format: Hash, ParentHashes, AuthorName, AuthorEmail, IsoDate, Subject
    let log_result = execute_git_command(
        repo_path,
        &["log", "--pretty=format:%H%x00%P%x00%an%x00%ae%x00%aI%x00%s", "-n", "100"]
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

    // Determine current branch
    let head_result = execute_git_command(repo_path, &["rev-parse", "--abbrev-ref", "HEAD"])?;
    let current_branch = if head_result.success {
        head_result.stdout.trim().to_string()
    } else {
        String::new()
    };

    // 2. Fetch Branches
    let mut branches = Vec::new();
    let branch_result = execute_git_command(
        repo_path,
        &["for-each-ref", "--format=%(refname:short)%x00%(objectname)", "refs/heads/"]
    )?;

    if branch_result.success && !branch_result.stdout.trim().is_empty() {
        for line in branch_result.stdout.lines() {
            let parts: Vec<&str> = line.split('\x00').collect();
            if parts.len() == 2 {
                let name = parts[0].to_string();
                let is_current = name == current_branch;
                branches.push(GitBranch {
                    name,
                    commit_hash: parts[1].to_string(),
                    is_remote: false,
                    is_current,
                    upstream: None,
                    ahead: 0,
                    behind: 0,
                });
            }
        }
    }

    // 3. Fetch Status
    let mut staged_files = Vec::new();
    let mut unstaged_files = Vec::new();
    let status_result = execute_git_command(repo_path, &["status", "--porcelain"])?;

    if status_result.success && !status_result.stdout.trim().is_empty() {
        for line in status_result.stdout.lines() {
            if line.len() > 3 {
                let status_chars: Vec<char> = line.chars().take(2).collect();
                let path = line[3..].to_string();

                let staged_char = status_chars[0];
                let unstaged_char = status_chars[1];

                let map_status = |c: char| -> String {
                    match c {
                        'A' => "added".to_string(),
                        'M' => "modified".to_string(),
                        'D' => "deleted".to_string(),
                        '?' => "untracked".to_string(),
                        _ => "modified".to_string(),
                    }
                };

                if staged_char != ' ' && staged_char != '?' {
                    staged_files.push(crate::git::models::FileStatus {
                        path: path.clone(),
                        status: map_status(staged_char),
                    });
                }

                if unstaged_char != ' ' {
                    unstaged_files.push(crate::git::models::FileStatus {
                        path,
                        status: map_status(unstaged_char),
                    });
                }
            }
        }
    }

    // 4. Fetch Tags
    let mut tags = Vec::new();
    let tag_result = execute_git_command(
        repo_path,
        &["for-each-ref", "--format=%(refname:short)%x00%(objectname)", "refs/tags/"]
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

    Ok(GitHistoryData {
        commits,
        branches,
        tags,
        staged_files,
        unstaged_files,
    })
}
