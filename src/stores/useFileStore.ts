import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  oldContent?: string;
  newContent?: string;
  status?: 'modified' | 'added' | 'deleted' | 'unmodified';
  children?: FileNode[];
  isIgnored?: boolean;
  isOpen?: boolean;
}

interface FileStore {
  files: FileNode[];
  activeFileId: string | null;
  setActiveFile: (id: string) => void;
  toggleFolder: (id: string) => void;
  fetchFiles: (repoPath: string) => Promise<void>;
  fetchFileContent: (repoPath: string, filePath: string) => Promise<void>;
  setFiles: (files: FileNode[]) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  activeFileId: null,
  setActiveFile: (id) => set({ activeFileId: id }),
  toggleFolder: (id) => set((state) => {
    // Deep clone and toggle logic
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) };
        }
        return node;
      });
    };
    return { files: toggleNode(state.files) };
  }),
  setFiles: (files) => set({ files }),
  fetchFiles: async (repoPath: string) => {
    if (!repoPath) return;

    try {
      const res: any = await invoke('git_ls_tree', { repoPath });
      if (res.success && res.stdout) {
        const paths = res.stdout.split('\n').filter(Boolean);
        
        // Build a tree from flat paths
        const root: FileNode[] = [];
        
        for (const path of paths) {
          const parts = path.split('/');
          let currentLevel = root;
          let currentPath = '';
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isFile = i === parts.length - 1;
            
            let existing = currentLevel.find(n => n.name === part);
            if (!existing) {
              existing = {
                id: currentPath,
                name: part,
                type: isFile ? 'file' : 'folder',
                isOpen: false,
                children: isFile ? undefined : []
              };
              currentLevel.push(existing);
            }
            if (!isFile) {
              currentLevel = existing.children!;
            }
          }
        }
        
        set({ files: root });
      }
    } catch (err) {
      console.error('Failed to fetch files tree:', err);
    }
  },
  fetchFileContent: async (repoPath: string, filePath: string) => {
    try {
      const res: any = await invoke('git_show_file', { repoPath, filePath });
      if (res.success) {
        set(state => {
          // Find the node and update its content
          const updateNode = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
              if (node.id === filePath) {
                return { ...node, content: res.stdout, status: 'unmodified' };
              }
              if (node.children) {
                return { ...node, children: updateNode(node.children) };
              }
              return node;
            });
          };
          return { files: updateNode(state.files) };
        });
      }
    } catch (err) {
      console.error('Failed to fetch file content:', err);
    }
  }
}));
