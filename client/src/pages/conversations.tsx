import { useState } from "react";
import { Conversation } from "@shared/schema";
import { useWebSocket } from "@/hooks/use-websocket";
import ConversationsSidebar from "@/components/conversation/ConversationsSidebar";
import ConversationChat from "@/components/conversation/ConversationChat";
import ContactProfile from "@/components/conversation/ContactProfile";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [view, setView] = useState<string>("all");
  const { isConnected } = useWebSocket();

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id.toString());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-900">
      {/* Header with tabs */}
      <div className="flex items-center justify-between p-2 px-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold mr-4">Conversations</h2>
          <Tabs value={view} onValueChange={setView} className="h-9">
            <TabsList className="bg-slate-700 h-9">
              <TabsTrigger value="all" className="h-8 px-4 data-[state=active]:bg-primary-500">
                All
              </TabsTrigger>
              <TabsTrigger value="mine" className="h-8 px-4 data-[state=active]:bg-primary-500">
                Mine
              </TabsTrigger>
              <TabsTrigger value="unassigned" className="h-8 px-4 data-[state=active]:bg-primary-500">
                Unassigned
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button 
          className="bg-primary-500 hover:bg-primary-600"
          size="sm"
        >
          CONTACT
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Conversation List */}
        <ConversationsSidebar 
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation}
          viewFilter={view}
        />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-800 border-l border-r border-slate-700">
          <ConversationChat conversationId={selectedConversation} />
        </div>
        
        {/* Right Sidebar - Contact Info */}
        <ContactProfile conversationId={selectedConversation} />
      </div>
      
      {/* WebSocket connection status */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <div>
              <p className="text-sm font-medium">Disconnected from server</p>
              <p className="text-xs">Real-time updates are not available</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
