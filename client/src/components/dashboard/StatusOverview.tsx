import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, MessageSquare, MessagesSquare, Coins, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: {
    value: string;
    isIncrease: boolean;
    text: string;
  };
  borderColor: string;
}

const StatusCard = ({ title, value, icon, change, borderColor }: StatusCardProps) => (
  <Card className={cn("bg-slate-800 rounded-lg p-4 border-l-4", borderColor)}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className="p-2 bg-slate-700/50 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-2 flex items-center text-xs">
      <span className={cn("flex items-center", change.isIncrease ? "text-green-400" : "text-red-400")}>
        {change.isIncrease ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />} {change.value}
      </span>
      <span className="text-slate-400 ml-1">{change.text}</span>
    </div>
  </Card>
);

export default function StatusOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    staleTime: 60000, // 1 minute
  });
  
  const metrics = data || {
    conversations: {
      total: 8291,
      change: { value: "12.5%", isIncrease: true, text: "from last month" }
    },
    activeConversations: {
      total: 43,
      change: { value: "3.2%", isIncrease: false, text: "from yesterday" }
    },
    tokenUsage: {
      total: "1.24M",
      change: { value: "8.1%", isIncrease: true, text: "of monthly budget" }
    },
    conversationLength: {
      total: "8.5 min",
      change: { value: "1.2 min", isIncrease: true, text: "from last week" }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Conversations */}
      <StatusCard
        title="Total Conversations"
        value={isLoading ? "Loading..." : metrics.conversations.total.toLocaleString()}
        icon={<MessageSquare className="text-primary-400 h-5 w-5" />}
        change={metrics.conversations.change}
        borderColor="border-primary-500"
      />

      {/* Active Conversations */}
      <StatusCard
        title="Active Conversations"
        value={isLoading ? "Loading..." : metrics.activeConversations.total.toString()}
        icon={<MessagesSquare className="text-accent-400 h-5 w-5" />}
        change={metrics.activeConversations.change}
        borderColor="border-accent-500"
      />

      {/* Token Usage */}
      <StatusCard
        title="Token Usage (MTD)"
        value={isLoading ? "Loading..." : metrics.tokenUsage.total}
        icon={<Coins className="text-secondary-400 h-5 w-5" />}
        change={metrics.tokenUsage.change}
        borderColor="border-secondary-500"
      />

      {/* Avg. Conversation Length */}
      <StatusCard
        title="Avg. Conversation Length"
        value={isLoading ? "Loading..." : metrics.conversationLength.total}
        icon={<Clock className="text-purple-400 h-5 w-5" />}
        change={metrics.conversationLength.change}
        borderColor="border-purple-500"
      />
    </div>
  );
}
