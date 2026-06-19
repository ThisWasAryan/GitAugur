# Git Operations

Every Git operation in GitAugur is represented as a structured operation object. This approach standardizes how operations are previewed, executed, and analyzed for risk.

## Supported Operations
* Commit
* Push
* Pull
* Merge
* Rebase
* Cherry Pick
* Reset
* Force Push

## Operation Lifecycle
1. **Initiation**: The user triggers an operation via the UI.
2. **Analysis**: The system determines the necessary Git commands.
3. **Preview**: The UI presents a preview of the operation:
   * Expected repository state
   * Commit graph changes
   * Files affected
4. **Risk Assessment**:
   * Warnings about destructive changes.
   * Recovery recommendations (e.g., creating a backup branch or safety tag before a force push).
5. **Execution**: The system executes the Git commands sequentially.
6. **Confirmation/Recovery**: Success message or a rollback/recovery option upon failure.
