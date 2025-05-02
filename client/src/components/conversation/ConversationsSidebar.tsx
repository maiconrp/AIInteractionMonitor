import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Conversation } from "@shared/schema";
import { Search, Clock, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  totalPages: number;
}

interface ConversationsSidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId: string | null;
  viewFilter?: string;
}

export default function ConversationsSidebar({ 
  onSelectConversation, 
  selectedConversationId,
  viewFilter = "all" 
}: ConversationsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data, isLoading } = useQuery<ConversationListResponse>({
    queryKey: ['/api/conversations', { page: 1, status: statusFilter, search: searchQuery }],
  });
  
  const conversations = data?.conversations || [];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'taken_over':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getTimeLabel = (timeAgo: string | undefined) => {
    return timeAgo || 'Unknown';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically update with the search term
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-700 w-80">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-primary-500/20 text-primary-500 border border-primary-500/20 rounded px-2 py-1 text-xs font-semibold">
            {viewFilter === "all" ? "All Conversations" : 
             viewFilter === "mine" ? "My Conversations" : 
             "Unassigned Conversations"}
          </div>
          <Badge variant="outline" className="bg-slate-800 text-white border-slate-700">
            Open
          </Badge>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-8 bg-slate-800 border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {conversations.map((conversation: Conversation) => (
              <div 
                key={conversation.id}
                className={`p-4 hover:bg-slate-800 cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id.toString() ? 'bg-slate-800 border-l-4 border-primary-500' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white mr-3">
                      {conversation.avatarText || '?'}
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">
                        {conversation.userName || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {conversation.userContact || `ID: ${conversation.displayId}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-slate-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeLabel(conversation.startedTimeAgo)}
                    </div>
                    <div className={`h-2 w-2 rounded-full mt-1 ${getStatusColor(conversation.status)}`}></div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-slate-300 line-clamp-2">
                  {conversation.lastMessagePreview || 'No messages yet'}
                </div>
                
                {/* Tags would be displayed here if available */}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <Info className="h-8 w-8 mb-2" />
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}