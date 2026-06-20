pub mod commands;
pub mod git;
pub mod storage;
pub mod github;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(storage::AppState::default())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::git_status,
            commands::git_log,
            commands::get_repo_state,
            commands::git_clone,
            commands::git_add,
            commands::git_commit,
            commands::git_reset,
            commands::git_checkout,
            commands::git_merge,
            commands::git_diff,
            commands::git_init,
            commands::git_rm,
            commands::git_mv,
            commands::git_branch,
            commands::git_switch,
            commands::git_rebase,
            commands::git_cherry_pick,
            commands::git_tag,
            commands::git_fetch,
            commands::git_pull,
            commands::git_push,
            commands::git_remote,
            commands::git_stash,
            commands::git_clean,
            commands::git_reflog,
            commands::git_show,
            commands::git_commit_details,
            commands::git_exec,
            commands::git_branch_delete,
            commands::git_tag_create,
            commands::git_ls_tree,
            commands::gh_exec,
            commands::git_reflog,
            commands::git_stash_list,
            commands::git_stash_push,
            commands::git_stash_pop,
            commands::git_stash_drop,
            commands::git_show_file,
            commands::read_file_content,
            commands::write_file_content,
            commands::git_merge_tree,
            commands::git_apply_cached,
            commands::git_rebase_interactive,
            github::gh_auth_status,
            github::gh_pr_list
        ])
        .setup(|app| {
            // Initialize database here if needed
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
