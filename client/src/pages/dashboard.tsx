import StatusOverview from "@/components/dashboard/StatusOverview";
import ServiceStatus from "@/components/dashboard/ServiceStatus";
import ConversationChart from "@/components/dashboard/ConversationChart";
import TokenUsageBreakdown from "@/components/dashboard/TokenUsageBreakdown";
import ConversationsTable from "@/components/conversation/ConversationsTable";
import ConversationView from "@/components/conversation/ConversationView";
import { useState, useEffect } from "react";
import { Conversation } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const { isConnected, status } = useWebSocket();
  const { toast } = useToast();

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id.toString());
  };

  // Show connection status notification
  useEffect(() => {
    // Only show toast after an initial delay to avoid toast on first render
    const timer = setTimeout(() => {
      if (!isConnected && status !== 'connecting') {
        setShowConnectionAlert(true);
        toast({
          title: "WebSocket disconnected",
          description: "Real-time updates are not available",
          variant: "destructive"
        });
      } else if (isConnected && showConnectionAlert) {
        setShowConnectionAlert(false);
        toast({
          title: "WebSocket connected",
          description: "Real-time updates are now available",
          variant: "default"
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isConnected, status, toast, showConnectionAlert]);

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <StatusOverview />

      {/* Service Status */}
      <ServiceStatus />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversation Chart */}
        <ConversationChart className="lg:col-span-2" />

        {/* Token Usage Breakdown */}
        <TokenUsageBreakdown />
      </div>

      {/* Conversations Table */}
      <ConversationsTable onViewConversation={handleViewConversation} />

      {/* Websocket connection status */}
      {!isConnected && showConnectionAlert && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          <p className="text-sm font-medium">Disconnected from server</p>
          <p className="text-xs">Real-time updates are not available</p>
        </div>
      )}

      {/* Conversation Detail View */}
      {selectedConversation && (
        <ConversationView
          conversationId={selectedConversation}
          isOpen={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}
