import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Info, 
  Music,
  MousePointer2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);

  const steps = [
    {
      title: 'Welcome to Fretboard Pro!',
      description: 'The ultimate toolkit for mastering guitar theory and practice. Lets take a quick 1-minute tour.',
      icon: <Music className="w-12 h-12 text-indigo-600" />
    },
    {
      title: 'Reading Chord Diagrams',
      description: 'Vertical lines are strings (Low E on left), horizontal lines are frets. The thick top line is the nut. Dots show your fingers!',
      icon: (
        <div className="relative w-24 h-24 border-2 border-slate-200 rounded flex flex-col justify-between p-2">
          <div className="h-1 bg-slate-800 w-full" />
          <div className="flex justify-around h-full">
            <div className="w-px bg-slate-300 h-full" />
            <div className="w-px bg-slate-300 h-full" />
            <div className="w-px bg-slate-300 h-full" />
          </div>
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-indigo-600 rounded-full" />
        </div>
      )
    },
    {
      title: 'Fretboard Orientation',
      description: 'Standard tuning is E A D G B E (thickest to thinnest). Numbers under the neck tell you which fret you are on.',
      icon: (
        <div className="flex gap-1">
          {['E','A','D','G','B','E'].map(n => <Badge key={n} variant="outline">{n}</Badge>)}
        </div>
      )
    },
    {
      title: 'Quick Check!',
      description: 'On a standard chord diagram, what does an "X" above a string mean?',
      icon: <Info className="w-12 h-12 text-amber-500" />,
      quiz: true
    },
    {
      title: 'Youre Ready!',
      description: 'Use the sidebar to explore the Theory Workbench, Transition Trainer, CAGED Explorer, and more. Happy playing!',
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />
    }
  ];

  const handleQuiz = (answer: string) => {
    setQuizAnswer(answer);
    if (answer === 'mute') {
      setIsWrong(false);
      setTimeout(() => setStep(4), 1000);
    } else {
      setIsWrong(true);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="max-w-md w-full shadow-2xl border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="flex justify-center">{steps[step].icon}</div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black">{steps[step].title}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              {steps[step].description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0 space-y-6">
          {steps[step].quiz && (
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant={quizAnswer === 'open' ? 'default' : 'outline'} 
                onClick={() => handleQuiz('open')}
                className={cn(quizAnswer === 'open' && "bg-red-500 hover:bg-red-500")}
              >
                Play string open
              </Button>
              <Button 
                variant={quizAnswer === 'mute' ? 'default' : 'outline'} 
                onClick={() => handleQuiz('mute')}
                className={cn(quizAnswer === 'mute' && "bg-green-500 hover:bg-green-500")}
              >
                Mute the string
              </Button>
              <Button 
                variant={quizAnswer === 'root' ? 'default' : 'outline'} 
                onClick={() => handleQuiz('root')}
                className={cn(quizAnswer === 'root' && "bg-red-500 hover:bg-red-500")}
              >
                It is the root note
              </Button>
              {isWrong && (
                <p className="text-xs text-red-500 text-center font-bold animate-bounce mt-2">
                  Not quite! Try again.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} disabled={step === 0} className="text-slate-400">
              <ChevronLeft className="mr-1 w-4 h-4" /> Back
            </Button>
            
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === step ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800")} />
              ))}
            </div>

            {!steps[step].quiz && (
              <Button onClick={handleNext} className="bg-indigo-600 px-6 font-bold">
                {step === steps.length - 1 ? 'Finish' : 'Next'} 
                {step < steps.length - 1 && <ChevronRight className="ml-1 w-4 h-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTutorial;

// Small Badge helper since ui/badge might not be enough
const Badge = ({ children, variant }: { children: React.ReactNode, variant?: string }) => (
  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700 uppercase">
    {children}
  </span>
);
