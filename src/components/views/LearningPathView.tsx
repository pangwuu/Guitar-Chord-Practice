import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  CheckCircle2, 
  Play, 
  Clock,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { INITIAL_LEARNING_PATH } from '../../constants/learningPath';
import { LearningModule } from '../../types/theory';

const LearningPathView: React.FC = () => {
  const [modules, setModules] = useState<LearningModule[]>(INITIAL_LEARNING_PATH);
  
  const completedCount = modules.filter(m => m.status === 'completed').length;
  const progressPercent = (completedCount / modules.length) * 100;

  const handleComplete = (id: string) => {
    setModules(prev => {
      const next = prev.map(m => m.id === id ? { ...m, status: 'completed' as const } : m);
      
      // Unlock next modules
      return next.map(m => {
        if (m.status !== 'locked') return m;
        const allPrereqsMet = m.prerequisites.every(preId => 
          next.find(mod => mod.id === preId)?.status === 'completed'
        );
        return allPrereqsMet ? { ...m, status: 'available' as const } : m;
      });
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Learning Path</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">A structured journey from guitar basics to advanced music theory.</p>
        </div>

        <Card className="w-full md:w-72 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200 dark:shadow-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Overall Progress</span>
              <span className="text-2xl font-black">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
            <p className="text-[10px] mt-3 opacity-70 font-medium">
              {completedCount} of {modules.length} modules mastered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modules.map((module, idx) => {
          const isLocked = module.status === 'locked';
          const isCompleted = module.status === 'completed';
          const isAvailable = module.status === 'available';

          return (
            <Card 
              key={module.id} 
              className={cn(
                "transition-all duration-300 overflow-hidden group",
                isLocked ? "opacity-60 grayscale" : "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800",
                isCompleted && "bg-slate-50/50 dark:bg-slate-900/20 border-green-100 dark:border-green-900/30"
              )}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className={cn(
                    "w-2 sm:w-3 shrink-0",
                    isLocked ? "bg-slate-300 dark:bg-slate-800" : 
                    isCompleted ? "bg-green-500" : "bg-indigo-500"
                  )} />
                  
                  <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter py-0">
                          {module.category}
                        </Badge>
                        <Badge className={cn(
                          "text-[10px] uppercase font-bold py-0",
                          module.difficulty === 'beginner' ? "bg-emerald-500 hover:bg-emerald-500" : "bg-amber-500 hover:bg-amber-500"
                        )}>
                          {module.difficulty}
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none flex items-center gap-1 py-0">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {module.title}
                          {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{module.description}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {module.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          Curriculum
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isAvailable && (
                        <Button 
                          onClick={() => handleComplete(module.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-200 dark:shadow-none group-hover:translate-x-1 transition-transform"
                        >
                          Start Module
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                      {isCompleted && (
                        <Button 
                          variant="outline" 
                          className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950/20"
                        >
                          Review
                        </Button>
                      )}
                      {isLocked && (
                        <Button disabled variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-400">
                          <Lock className="mr-2 w-3 h-3" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-8 bg-slate-900 rounded-3xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-bold text-white">More Modules Coming Soon</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            We're building advanced modules covering Blues, Jazz, Modal Theory, and Speed Development. 
            Keep practicing!
          </p>
          <Button variant="link" className="text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest text-xs">
            Suggest a Topic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearningPathView;
