import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface ChartProps {
  className?: string;
}

export default function ConversationChart({ className }: ChartProps) {
  const [timeRange, setTimeRange] = useState("7d");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/conversations/stats', timeRange],
  });

  useEffect(() => {
    if (!chartRef.current) return;

    // Load Chart.js dynamically to avoid SSR issues
    const loadChart = async () => {
      if (typeof window !== 'undefined') {
        const Chart = (await import('chart.js/auto')).default;
        
        // If chart already exists, destroy it before creating a new one
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Format data based on time range
        const labels = data?.labels || getDefaultLabels(timeRange);
        const values = data?.values || Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 100) + 20);
        
        // Create the chart
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Conversations',
                  data: values,
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  backgroundColor: '#1E293B',
                  titleColor: '#F8FAFC',
                  bodyColor: '#94A3B8',
                  borderColor: '#334155',
                  borderWidth: 1,
                  padding: 10,
                  displayColors: false
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawBorder: false
                  },
                  ticks: {
                    color: '#94A3B8'
                  }
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false
                  },
                  ticks: {
                    color: '#94A3B8'
                  }
                }
              }
            }
          });
        }
      }
    };

    loadChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, timeRange]);

  const getDefaultLabels = (range: string) => {
    switch (range) {
      case '7d':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '30d':
        return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      case '90d':
        return Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
      default:
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
  };

  return (
    <Card className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Conversations Over Time</h2>
        <div className="text-sm text-slate-400">
          <Select 
            defaultValue={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="bg-slate-700 border border-slate-600 rounded-md w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-64 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <canvas ref={chartRef}></canvas>
        )}
      </div>
    </Card>
  );
}
