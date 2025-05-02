import { useState } from "react";
import ConversationsTable from "@/components/conversation/ConversationsTable";
import ConversationView from "@/components/conversation/ConversationView";
import { Conversation } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected } = useWebSocket();

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id.toString());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic implemented in the table component
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold">Conversations</h1>
            <div className="flex flex-wrap gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-8 pr-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-sm w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <Select
                value={filter}
                onValueChange={setFilter}
              >
                <SelectTrigger className="bg-slate-700 border border-slate-600 rounded-md h-9 w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">
                <Filter className="h-4 w-4 mr-1" /> Advanced Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-750 border-slate-700">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-primary-500">1,247</div>
                <div className="text-sm text-slate-400">Active Conversations</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-750 border-slate-700">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-accent-500">7,892</div>
                <div className="text-sm text-slate-400">Completed Conversations</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-750 border-slate-700">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-secondary-500">1.4M</div>
                <div className="text-sm text-slate-400">Total Tokens Used</div>
              </CardContent>
            </Card>
          </div>

          <ConversationsTable onViewConversation={handleViewConversation} />
        </CardContent>
      </Card>

      {/* WebSocket connection status */}
      {!isConnected && (
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
