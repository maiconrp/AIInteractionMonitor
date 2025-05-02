import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { ConversationMessage } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  PauseCircle, 
  UserCheck, 
  MessageSquare, 
  FileText, 
  Send, 
  Paperclip, 
  CircleHelp,
  Bot
} from "lucide-react";
import ConversationMessageComponent from "./ConversationMessage";

interface ConversationChatProps {
  conversationId: string | null;
}

export default function ConversationChat({ conversationId }: ConversationChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { sendMessage } = useWebSocket();
  
  // Fetch conversation details
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: [`/api/conversations/${conversationId}`],
    enabled: !!conversationId,
  });
  
  // Fetch conversation messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
  });

  // Handle message submission
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      return apiRequest("POST", `/api/conversations/${conversationId}/messages`, { 
        sender: "user", 
        content
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle AI pause
  const pauseAIMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/conversations/${conversationId}/pause`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}`] });
      toast({
        title: "AI Paused",
        description: "The AI has been paused for this conversation.",
      });
      // Notify via WebSocket for real-time update
      sendMessage({
        type: "conversation_updated",
        conversationId,
        action: "pause"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to pause AI",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle take over
  const takeOverMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/conversations/${conversationId}/takeover`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}`] });
      toast({
        title: "Conversation Taken Over",
        description: "You are now in control of this conversation.",
      });
      // Notify via WebSocket for real-time update
      sendMessage({
        type: "conversation_updated",
        conversationId,
        action: "takeover"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to take over conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium mb-2">No conversation selected</h2>
        <p className="text-sm">Select a conversation from the list to view the chat.</p>
      </div>
    );
  }
  
  if (isLoadingConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
        <CircleHelp className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-medium mb-2">Conversation not found</h2>
        <p className="text-sm">The requested conversation could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full bg-${conversation.avatarColor}-100 flex items-center justify-center text-${conversation.avatarColor}-700 mr-3`}>
            {conversation.avatarText}
          </div>
          <div>
            <h3 className="font-medium line-clamp-1">{conversation.userName || 'Anonymous User'}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`
                text-xs
                ${conversation.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  conversation.status === 'paused' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  conversation.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  conversation.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  conversation.status === 'taken_over' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }
              `}>
                {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="bg-primary-500/10 text-primary-500 border-primary-500/20 text-xs">
                {conversation.model || 'GPT-4'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => pauseAIMutation.mutate()}
            disabled={conversation.status === 'paused' || pauseAIMutation.isPending}
            className="bg-slate-700 hover:bg-slate-600"
          >
            <PauseCircle className="h-4 w-4 mr-2" />
            {pauseAIMutation.isPending ? "Pausing..." : "Pause AI"}
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => takeOverMutation.mutate()}
            disabled={conversation.status === 'taken_over' || takeOverMutation.isPending}
            className="bg-slate-700 hover:bg-slate-600"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {takeOverMutation.isPending ? "Taking Over..." : "Take Over"}
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="messages" className="flex-none" onValueChange={setActiveTab}>
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-transparent p-0 h-10">
            <TabsTrigger 
              value="messages" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="customer-dashboard" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Customer Dashboard
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
      
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        ) : messages.length > 0 ? (
          <>
            {messages.map((message: ConversationMessage) => (
              <ConversationMessageComponent 
                key={message.id} 
                message={message} 
              />
            ))}
            {/* Typing indicator if needed */}
            {conversation.status === 'active' && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="ml-3 bg-slate-700 p-3 rounded-lg rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message.</p>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      
      {/* Input Area */}
      <div className="flex-none p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full h-20 bg-slate-700 border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={sendMessageMutation.isPending || conversation?.status === 'completed'}
            ></textarea>
            <button 
              type="button" 
              className="absolute bottom-3 left-3 text-slate-400 hover:text-white"
              disabled={sendMessageMutation.isPending || conversation?.status === 'completed'}
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
          
          <Button
            type="submit"
            disabled={sendMessageMutation.isPending || !messageInput.trim() || conversation?.status === 'completed'}
            className="h-10 bg-primary-500 hover:bg-primary-600"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <div>
            Shift + Enter for new line
          </div>
          <div className="flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            Canned Response
          </div>
        </div>
      </div>
    </div>
  );
}