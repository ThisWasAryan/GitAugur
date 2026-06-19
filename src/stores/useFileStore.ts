import { create } from 'zustand';

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

const mockFileSystem: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'src/features',
        name: 'features',
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: 'src/features/CommitGraph.tsx',
            name: 'CommitGraph.tsx',
            type: 'file',
            status: 'modified',
            oldContent: `import { useMemo } from "react";\nimport { ReactFlow } from "@xyflow/react";\n\nexport function CommitGraph() {\n  return (\n    <div className="absolute inset-0">\n      <ReactFlow />\n    </div>\n  );\n}`,
            newContent: `import { useMemo } from "react";\nimport { ReactFlow, Background } from "@xyflow/react";\nimport { useGitEngineStore } from "../../engine/GitEngineStore";\n\nexport function CommitGraph() {\n  const engine = useGitEngineStore();\n  return (\n    <div className="absolute inset-0 bg-slate-950">\n      <ReactFlow>\n        <Background color="#334155" />\n      </ReactFlow>\n    </div>\n  );\n}`,
          },
          {
            id: 'src/features/CommitNode.tsx',
            name: 'CommitNode.tsx',
            type: 'file',
            status: 'unmodified',
            content: `export function CommitNode() {\n  return <div className="p-2 border rounded">Commit</div>;\n}`
          }
        ]
      },
      {
        id: 'src/App.tsx',
        name: 'App.tsx',
        type: 'file',
        status: 'unmodified',
        content: `export default function App() {\n  return <main>App</main>;\n}`
      }
    ]
  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    content: `{
  "name": "git-augur",
  "version": "1.0.0"
}`
  },
  {
    id: '.env.local',
    name: '.env.local',
    type: 'file',
    isIgnored: true,
    content: `VITE_API_KEY=secret123`
  }
];

interface FileStore {
  files: FileNode[];
  activeFileId: string | null;
  setActiveFile: (id: string) => void;
  toggleFolder: (id: string) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: mockFileSystem,
  activeFileId: 'src/features/CommitGraph.tsx',
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
}));
