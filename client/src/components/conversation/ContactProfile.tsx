import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Conversation } from "@shared/schema";
import { Copy, ExternalLink, Mail, Phone, MapPin, AlertCircle, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ContactProfileProps {
  conversationId: string | null;
}

export default function ContactProfile({ conversationId }: ContactProfileProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  
  const { data: conversation, isLoading } = useQuery({
    queryKey: [`/api/conversations/${conversationId}`],
    enabled: !!conversationId,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      description: text,
    });
  };

  if (!conversationId) return null;
  
  if (isLoading) {
    return (
      <div className="h-full w-64 border-l border-slate-700 bg-slate-900 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!conversation) {
    return (
      <div className="h-full w-64 border-l border-slate-700 bg-slate-900 p-4 flex flex-col items-center justify-center text-slate-400">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Contact information not available</p>
      </div>
    );
  }

  return (
    <div className="h-full w-64 border-l border-slate-700 bg-slate-900 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-slate-400 mb-4">Contact</h3>
        
        <div className="flex flex-col items-center mb-4">
          <div className={`h-16 w-16 rounded-full bg-${conversation.avatarColor}-100 flex items-center justify-center text-${conversation.avatarColor}-700 text-2xl mb-2`}>
            {conversation.avatarText}
          </div>
          <div className="text-center">
            <h2 className="font-medium">{conversation.userName || 'Anonymous User'}</h2>
            <p className="text-sm text-slate-400">
              {conversation.userTitle || 'User'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details" className="data-[state=active]:bg-primary-500">
              Details
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-primary-500">
              Actions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            {conversation.userContact && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="truncate">{conversation.userContact}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(conversation.userContact, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <Separator className="bg-slate-800" />
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400">Conversation Info</h4>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Status</div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`
                      ${conversation.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        conversation.status === 'paused' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        conversation.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        conversation.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        conversation.status === 'taken_over' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }
                    `}
                  >
                    {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="text-slate-400">Started</div>
                <div className="text-right">{conversation.startedTimeAgo}</div>
                
                <div className="text-slate-400">Duration</div>
                <div className="text-right">{conversation.duration || 'Ongoing'}</div>
                
                <div className="text-slate-400">Tokens</div>
                <div className="text-right">{conversation.tokenCount || '0'}</div>
                
                <div className="text-slate-400">ID</div>
                <div className="text-right font-mono text-xs">#{conversation.displayId}</div>
              </div>
            </div>
            
            <Separator className="bg-slate-800" />
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {conversation.tags && conversation.tags.length > 0 ? (
                  conversation.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-slate-800">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic">No tags</div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Button variant="secondary" className="justify-start" size="sm">
                <Mail className="h-4 w-4 mr-2" /> Send Email
              </Button>
              <Button variant="secondary" className="justify-start" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" /> View Profile
              </Button>
              <Button variant="secondary" className="justify-start" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" /> Flag Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}