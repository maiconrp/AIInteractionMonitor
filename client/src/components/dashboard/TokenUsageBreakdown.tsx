import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

interface TokenUsageModel {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

export default function TokenUsageBreakdown() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/tokens/usage'],
  });

  const tokenUsage = data?.models || [
    {
      id: '1',
      name: 'GPT-4',
      percentage: 43,
      color: 'bg-primary-500',
    },
    {
      id: '2',
      name: 'GPT-3.5',
      percentage: 32,
      color: 'bg-secondary-500',
    },
    {
      id: '3',
      name: 'Claude',
      percentage: 18,
      color: 'bg-accent-500',
    },
    {
      id: '4',
      name: 'Other Models',
      percentage: 7,
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card className="bg-slate-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Token Usage Breakdown</h2>
        <button className="text-sm text-primary-400 hover:text-primary-300">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
            </div>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
            </div>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
            </div>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
            </div>
          </>
        ) : (
          tokenUsage.map((model) => (
            <div key={model.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{model.name}</span>
                <span>{model.percentage}%</span>
              </div>
              <Progress 
                value={model.percentage} 
                className="h-2 w-full bg-slate-700"
                indicatorClassName={model.color}
              />
            </div>
          ))
        )}
        
        <div className="pt-2 text-center">
          <button className="text-sm text-primary-400 hover:text-primary-300">
            View detailed report
          </button>
        </div>
      </div>
    </Card>
  );
}
