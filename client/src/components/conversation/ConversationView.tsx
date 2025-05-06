import { useState, useRef, useEffect } from "react";
import { History, PauseCircle, StickyNote, UserCheck, UserCog, X } from "lucide-react";
import { ConversationMessage} from "@shared/schema";
import { useQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ConversationMessageComponent from "./ConversationMessage";
import { Separator } from "@/components/ui/separator";import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { Toggle } from "@/components/ui/toggle";
import { Conversation, ConversationMessages } from "@/types/types";
interface ConversationViewProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationView({ conversationId, isOpen, onClose }: ConversationViewProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();  
  const [pauseDuration, setPauseDuration] = useState<string | null>(null); // Duration for pausing AI
  const [isPauseUntilReactivate, setIsPauseUntilReactivate] = useState(false); // Toggle for "until I reactivate"
  const [notes, setNotes] = useState<string>("");
  
  const { toast } = useToast();
  const { sendMessage } = useWebSocket();
  
  // Fetch conversation details
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<Conversation>({
    queryKey: [`/api/conversations/${conversationId}`],
    enabled: isOpen && !!conversationId,
  });

  // Fetch conversation messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<ConversationMessages>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: isOpen && !!conversationId,
  });

  // Handle message submission
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => {
      return apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
    },    
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}`] });
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
  const getPausePayload = () => {
    if (isPauseUntilReactivate) return { duration: "until_reactivate" };
    if (pauseDuration) return { duration: pauseDuration };
    return {};
};
  const pauseAIMutation = useMutation({
    mutationFn: (payload: { duration?: string }) => {
      return apiRequest(
        "POST",
        `/api/conversations/${conversationId}/pause`,
        payload
      );
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

  if (!isOpen) return null;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 rounded-full text-xs bg-green-200 text-green-800">Active</span>;
      case "paused":
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-200 text-yellow-800">Paused</span>;
      case "completed":
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-200 text-blue-800">Completed</span>;
      case "failed":
        return <span className="px-2 py-1 rounded-full text-xs bg-red-200 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-slate-200 text-slate-800">Unknown</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/75" onClick={onClose}></div>
      <div className="absolute inset-0 overflow-hidden">
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-4xl">
            <div className="h-full flex flex-col bg-slate-800 shadow-xl">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-start justify-between pb-3 border-b border-slate-700">
                  <h2 className="text-lg font-medium">Conversation Details</h2>
                  <button 
                    onClick={onClose}
                    className="rounded-md text-slate-400 hover:text-white"
                  >
                    <span className="sr-only">Close panel</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {isLoadingConversation ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-slate-400">Loading conversation details...</p>
                  </div>
                ) : conversation ? (
                  <>
                    {/* Conversation Info */}
                    <div className="py-4 border-b border-slate-700">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full bg-${conversation.avatarColor}-100 flex items-center justify-center text-${conversation.avatarColor}-700`}>                             
                            {conversation?.avatarText}
                          </div>                           
                          <div className="ml-3">
                            <div className="text-base font-medium">{conversation.userName}</div>
                            <div className="text-sm text-slate-400">{conversation.userContact}</div>
                          </div>                           
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getStatusDisplay(conversation.status)}
                            <span className="px-2 py-1 rounded-full text-xs bg-slate-200 text-slate-800">
                            ID: {conversation.displayId}                            
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-primary-200 text-primary-800">
                            {conversation.model || 'GPT-4'}
                          </span>
                        </div>
                      </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Started:</span>
                            <span className="ml-1">{conversation?.startedAt}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Duration:</span>
                            <span className="ml-1">{conversation?.duration}</span>
                            </div>
                          <div>
                            <span className="text-slate-400">Token Count:</span>
                            <span className="ml-1">{conversation?.tokenCount}</span>
                            </div>
                      </div>
                    </div>
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <StickyNote className="h-4 w-4 text-slate-400" />
                                        <h4 className="text-sm font-medium text-slate-400">Notes</h4>
                                    </div>
                                    <Textarea
                                    className="w-full bg-slate-700 border-0 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 resize-none"
                                    placeholder="Add notes about this lead..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="actions">
                            <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-700">
                                <div className="flex items-center gap-2">
                                   <Button
                                     variant="default"
                                     size="sm"
                                     className="bg-accent-500 hover:bg-accent-600 text-white flex items-center gap-1"
                                     onClick={() => {
                                        const payload = getPausePayload();
                                        if (Object.keys(payload).length > 0 && (pauseDuration || isPauseUntilReactivate) ) {
                                          pauseAIMutation.mutate(payload);
                                        }
                                        setPauseDuration(null);
                                    }}
                                     disabled={conversation.status === "paused" || pauseAIMutation.isPending}
                                   >

                                    <PauseCircle className="h-4 w-4" />
                                    {pauseAIMutation.isPending ? "Pausing..." : "Pause AI"}
                                   </Button>
                                    <select
                                    className="bg-slate-700 text-white px-2 py-1 rounded"
                                    onChange={(e) => setPauseDuration(e.target.value)}
                                    >
                                     <option value="">Select duration</option>
                                     <option value="15min">15 min</option>
                                     <option value="30min">30 min</option>
                                     <option value="1h">1h</option>
                                    </select>
                                   <Toggle pressed={isPauseUntilReactivate} onPressedChange={setIsPauseUntilReactivate}>Until I reactivate</Toggle>
                                </div>
                                <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1"
                                   onClick={() => takeOverMutation.mutate()}
                                   disabled={conversation.status === 'taken_over' || takeOverMutation.isPending}>
                                   <UserCheck className="h-4 w-4" />{takeOverMutation.isPending ? "Taking Over..." : "Take Over"} 
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1"><UserCog className="h-4 w-4" />Transfer</Button>
                                <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1"><History className="h-4 w-4" />View History</Button>
                            </div>
                            </TabsContent>
                        </Tabs>

                    {/* Conversation Transcript */}
                    <div className="py-4 space-y-4">
                      <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400">
                        Conversation Transcript
                      </h3>
                      
                      <div className="space-y-4">
                        {isLoadingMessages ? (
                          <div className="py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                            <p className="mt-2 text-sm text-slate-400">Loading messages...</p>
                          </div>
                        ) : messages && messages.length > 0 ? (
                          <>{messages.map((message : ConversationMessage) => {
                             return(<ConversationMessageComponent key={message.id} message={message} />)
                             })}
                            {conversation.status === 'active' && (
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700">
                                  U
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
                          <p className="text-center text-slate-400">No messages in this conversation.</p>
                        )}
                        <div ref={messagesEndRef}></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-slate-400">Conversation not found or error loading details.</p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <Separator className="border-slate-700" />
              <div className="p-4">
                <form onSubmit={handleSubmit} className="relative">
                  <textarea
                    className="w-full bg-slate-700 border-0 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={sendMessageMutation.isPending || conversation?.status === 'completed'}
                  ></textarea>
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button type="button" className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                      </svg>
                    </button>
                    <button
                      type="submit"
                      className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600"
                      disabled={sendMessageMutation.isPending || !messageInput.trim() || conversation?.status === 'completed'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
