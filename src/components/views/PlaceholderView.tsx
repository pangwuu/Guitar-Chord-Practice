import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <Card className="max-w-md w-full text-center border-dashed border-2">
        <CardHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-lg">Coming Soon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400">
            {description}. This feature is currently in the development pipeline 
            as part of the Fretboard Theory Workbench roadmap.
          </p>
          <Button variant="outline" disabled>
            Notify Me When Available
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderView;
