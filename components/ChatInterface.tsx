"use client";

import { useState, useRef, useEffect } from "react";
import { ClovaMessage } from "@/lib/types";

interface ChatInterfaceProps {
  onSendMessage: (messages: ClovaMessage[]) => Promise<{
    messages: ClovaMessage[];
    error?: string;
  }>;
  initialSystemMessage?: string;
}

export default function ChatInterface({
  onSendMessage,
  initialSystemMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ClovaMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ClovaMessage = {
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const result = await onSendMessage(newMessages);

      console.log("Server response:", result);

      if (result.error) {
        setError(result.error);
      } else {
        console.log("Setting messages to:", result.messages);
        setMessages(result.messages);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error in handleSubmit:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Filter out system and tool response messages for display
  // Keep user messages, assistant messages with content, and tool call messages
  const displayMessages = messages.filter(
    (msg) => msg.role === "user" || msg.role === "assistant"
  );

  console.log("Total messages:", messages.length, "Display messages:", displayMessages.length);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Career Advisor</h2>
            <p className="text-xs text-muted-foreground font-medium">Powered by ClovaX</p>
          </div>
        </div>
        {displayMessages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs font-bold text-muted-foreground hover:text-primary px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/30">
        {displayMessages.length === 0 && (
          <div className="text-center mt-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-xl font-bold text-foreground mb-2">Start a conversation</p>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Ask me about career paths, skill requirements, or get advice on your learning journey.
            </p>
            {initialSystemMessage && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600 max-w-md mx-auto">
                <span className="font-semibold block mb-1">System Context:</span>
                {initialSystemMessage}
              </div>
            )}
          </div>
        )}

        {displayMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-tr-none"
                  : "bg-white text-foreground border border-border rounded-tl-none"
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
