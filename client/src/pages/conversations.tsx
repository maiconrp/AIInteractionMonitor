import { useState } from "react";
import { Conversation } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import ConversationsSidebar from "@/components/conversation/ConversationsSidebar";
import ConversationChat from "@/components/conversation/ConversationChat";
import ContactProfile from "@/components/conversation/ContactProfile";

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { isConnected } = useWebSocket();

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id.toString());
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Left Sidebar - Conversation List */}
      <ConversationsSidebar 
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversation}
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-800">
        <ConversationChat conversationId={selectedConversation} />
      </div>
      
      {/* Right Sidebar - Contact Info */}
      <ContactProfile conversationId={selectedConversation} />
      
      {/* WebSocket connection status */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          <p className="text-sm font-medium">Disconnected from server</p>
          <p className="text-xs">Real-time updates are not available</p>
        </div>
      )}
    </div>
  );
}
