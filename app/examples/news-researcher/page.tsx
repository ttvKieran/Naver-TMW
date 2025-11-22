"use client";

import ChatInterface from "@/components/ChatInterface";
import { chatWithNewsResearcher } from "./actions";
import Link from "next/link";

export default function NewsResearcherPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary font-medium inline-flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Examples
            </Link>
            <h1 className="text-2xl font-bold text-foreground">News Researcher</h1>
          </div>
        </div>
      </header>

      {/* Description */}
      <div className="bg-card/50 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">📰</span>
            ClovaX Tool Calling with NewsAPI
          </h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            This example demonstrates how ClovaX can use tool calling (function
            calling) to search for real-time news articles. Ask about any topic,
            and the AI will automatically search for relevant news using the
            NewsAPI.
          </p>
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <p className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
              Try asking:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-background/50 p-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer">
                "What's the latest news about artificial intelligence?"
              </div>
              <div className="bg-background/50 p-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer">
                "Find me news about climate change from this week"
              </div>
              <div className="bg-background/50 p-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer">
                "What's happening in technology today?"
              </div>
              <div className="bg-background/50 p-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors cursor-pointer">
                "Show me recent sports news"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-background">
        <div className="h-full max-w-6xl mx-auto p-4">
          <div className="h-[600px] bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden">
            <ChatInterface
              onSendMessage={chatWithNewsResearcher}
              initialSystemMessage="Ask me about any news topic and I'll search for relevant articles!"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
