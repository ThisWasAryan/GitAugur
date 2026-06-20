use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GitAuthor {
    pub name: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GitCommit {
    pub hash: String,
    pub message: String,
    pub author: GitAuthor,
    pub timestamp: String,
    #[serde(rename = "parentHashes")]
    pub parent_hashes: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GitBranch {
    pub name: String,
    #[serde(rename = "commitHash")]
    pub commit_hash: String,
    #[serde(rename = "isRemote")]
    pub is_remote: bool,
    #[serde(rename = "isCurrent")]
    pub is_current: bool,
    pub upstream: Option<String>,
    pub ahead: u32,
    pub behind: u32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GitTag {
    pub name: String,
    #[serde(rename = "commitHash")]
    pub commit_hash: String,
    pub message: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FileStatus {
    pub path: String,
    pub status: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GitHistoryData {
    pub head: String,
    pub commits: Vec<GitCommit>,
    pub branches: Vec<GitBranch>,
    pub tags: Vec<GitTag>,
    #[serde(rename = "stagedFiles")]
    pub staged_files: Vec<FileStatus>,
    #[serde(rename = "unstagedFiles")]
    pub unstaged_files: Vec<FileStatus>,
    #[serde(rename = "repositoryState")]
    pub repository_state: String,
}
