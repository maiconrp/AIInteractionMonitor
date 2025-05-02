import { ConversationMessage } from "@shared/schema";

interface ConversationMessageProps {
  message: ConversationMessage;
}

export default function ConversationMessageComponent({ message }: ConversationMessageProps) {
  if (message.sender === "user") {
    return (
      <div className="flex items-start">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700">
          {message.senderInitials || "U"}
        </div>
        <div className="ml-3 bg-slate-700 p-3 rounded-lg rounded-tl-none max-w-[80%]">
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className="mt-1 text-xs text-slate-400">{message.timestamp}</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-start justify-end">
        <div className="mr-3 bg-primary-900/50 p-3 rounded-lg rounded-tr-none max-w-[80%]">
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium text-primary-400">{message.senderName || "AI Assistant"}</span>
            {message.model && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-primary-200 text-primary-800">
                {message.model}
              </span>
            )}
          </div>
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className="mt-1 text-xs text-slate-400">{message.timestamp}</div>
        </div>
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
            <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path>
            <path d="M19 11h2m-1 -1v2"></path>
          </svg>
        </div>
      </div>
    );
  }
}
