import { invoke } from '@tauri-apps/api/core';
import { useRepositoryStore } from '../stores/useRepositoryStore';

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  author: { login: string };
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  headRefName: string;
  author: { login: string };
}

class GitHubClient {
  private async exec(args: string[]): Promise<any> {
    const repoPath = useRepositoryStore.getState().repoPath;
    if (!repoPath) throw new Error("No repository selected");
    
    try {
      const res: any = await invoke('gh_exec', { repoPath, args });
      if (res.success && res.stdout) {
        return JSON.parse(res.stdout);
      }
      return null;
    } catch (err) {
      console.error(`gh command failed: gh ${args.join(' ')}`, err);
      throw err;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const res: any = await invoke('gh_exec', { 
        repoPath: useRepositoryStore.getState().repoPath, 
        args: ['auth', 'status'] 
      });
      return res.success;
    } catch {
      return false;
    }
  }

  async getIssues(): Promise<GitHubIssue[]> {
    try {
      return await this.exec(['issue', 'list', '--json', 'number,title,state,author', '--limit', '20']);
    } catch {
      return [];
    }
  }

  async getPullRequests(): Promise<GitHubPR[]> {
    try {
      return await this.exec(['pr', 'list', '--json', 'number,title,state,headRefName,author', '--limit', '20']);
    } catch {
      return [];
    }
  }
}

export const ghClient = new GitHubClient();
