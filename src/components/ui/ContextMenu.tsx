import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label?: string;
  icon?: ReactNode;
  onClick: () => void;
  divider?: boolean;
  danger?: boolean;
}

interface ContextMenuContextType {
  showMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const showMenu = (x: number, y: number, newItems: ContextMenuItem[]) => {
    setPosition({ x, y });
    setItems(newItems);
    setIsOpen(true);
  };

  const hideMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClick = () => {
      if (isOpen) hideMenu();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <ContextMenuContext.Provider value={{ showMenu, hideMenu }}>
      {children}
      {isOpen && createPortal(
        <div 
          className="fixed z-[100] w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden py-1"
          style={{ top: position.y, left: position.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} className="h-px bg-slate-800 my-1"></div>;
            }
            return (
              <button
                key={idx}
                className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                  item.danger 
                    ? 'text-rose-400 hover:bg-rose-950/50' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
                onClick={() => {
                  item.onClick();
                  hideMenu();
                }}
              >
                {item.icon && <span className="opacity-80">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </ContextMenuContext.Provider>
  );
}

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
