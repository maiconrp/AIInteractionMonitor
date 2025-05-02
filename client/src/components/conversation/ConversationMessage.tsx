import { ConversationMessage } from "@shared/schema";
import { Check, Bot, User, Clock } from "lucide-react";

interface ConversationMessageProps {
  message: ConversationMessage;
}

export default function ConversationMessageComponent({ message }: ConversationMessageProps) {
  if (message.sender === "user") {
    return (
      <div className="flex items-start">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-800">
          {message.senderInitials || <User className="h-4 w-4" />}
        </div>
        <div className="ml-3 max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{message.senderName || "User"}</span>
            <span className="text-xs text-slate-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {message.timestamp}
            </span>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg rounded-tl-none text-sm whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-start">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500">
          <Bot className="h-4 w-4" />
        </div>
        <div className="ml-3 max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary-400">{message.senderName || "AI Assistant"}</span>
            {message.model && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-primary-500/10 text-primary-500 border border-primary-500/20">
                {message.model}
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {message.timestamp}
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg rounded-tl-none text-sm whitespace-pre-wrap">
            {message.content}
          </div>
          <div className="flex justify-end mt-1 text-xs text-slate-400">
            <div className="flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Seen
            </div>
          </div>
        </div>
      </div>
    );
  }
}
