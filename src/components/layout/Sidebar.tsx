import React from 'react';
import { 
  Guitar, 
  Music, 
  Search, 
  Grid3X3, 
  GraduationCap, 
  PlayCircle,
  Settings,
  Menu,
  X,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export type ViewId = 'practice' | 'workbench' | 'caged' | 'transition';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  className?: string;
}

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ElementType;
  description: string;
  isPlanned?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { 
    id: 'practice', 
    label: 'Chord Trainer', 
    icon: Guitar, 
    description: 'Practice your chord shapes' 
  },
  {
    id: 'transition',
    label: 'Transition Trainer',
    icon: RotateCcw,
    description: 'Practice chord switches'
  },
  { 
    id: 'workbench', 
    label: 'Theory Workbench', 
    icon: Music, 
    description: 'Explore scales and modes' 
  },
  { 
    id: 'caged', 
    label: 'CAGED Explorer', 
    icon: Grid3X3, 
    description: 'Master the CAGED system'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, className }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <div className={cn(
        "flex flex-col h-screen bg-slate-900 text-slate-300 transition-all duration-300 border-r border-slate-800",
        isOpen ? "w-64" : "w-20",
        "fixed md:relative z-40",
        !isOpen && "hidden md:flex",
        className
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <Guitar className="w-5 h-5" />
          </div>
          {isOpen && <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">Fretboard Pro</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                  isActive 
                    ? "bg-indigo-600 text-white" 
                    : "hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                {isOpen && (
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    {item.isPlanned && (
                      <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded leading-none mt-0.5 uppercase tracking-tighter">
                        Planned
                      </span>
                    )}
                  </div>
                )}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label} {item.isPlanned ? '(Planned)' : ''}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-200">
            <Settings className="w-5 h-5" />
            {isOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
