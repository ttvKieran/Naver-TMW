"use client";

import Link from "next/link";

export default function LessonPlanPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary font-medium mb-4 inline-flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-foreground tracking-tight">
            ClovaX API Workshop: <span className="text-primary">90-Minute Lesson Plan</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive guide to teaching ClovaX Chat Completions API with hands-on examples
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {/* Overview Section */}
        <section className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">📚</span>
            Workshop Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">Learning Objectives</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Understand ClovaX Chat Completions API</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Implement tool calling (function calling)</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Master multimodal AI with ClovaX Vision</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Build two complete working applications</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Apply best practices for API integration</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">Prerequisites</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">•</span>Basic JavaScript/TypeScript knowledge</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">•</span>Familiarity with React and Next.js</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">•</span>Understanding of REST APIs</li>
                <li className="flex items-start gap-2"><span className="text-secondary mt-1">•</span>Node.js installed locally</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">Required Setup</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span>Naver Cloud Platform account</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span>NewsAPI.org API key (free tier)</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span>VS Code (recommended)</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span>Repository cloned & dependencies installed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-foreground flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">⏱️</span>
            90-Minute Timeline
          </h2>

          <div className="relative border-l-2 border-border/50 ml-8 space-y-12">
            {/* Part 1 */}
            <div className="relative pl-12">
              <div className="absolute -left-[25px] top-0 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/20">
                0-15
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">Part 1: Introduction & Setup</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">15 minutes</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-foreground mb-2 text-sm">5 min: Welcome (Lecture)</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Intro to ClovaX & Naver's LLM platform</li>
                    <li>• HCX-005 (multimodal) vs HCX-007 (thinking)</li>
                    <li>• Chat Completions API architecture</li>
                    <li>• Real-world use cases discussion</li>
                  </ul>
                </div>
                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-foreground mb-2 text-sm">5 min: Setup (Hands-on)</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Clone repo & install dependencies</li>
                    <li>• Configure .env.local with keys</li>
                    <li>• Start dev server: <code className="bg-muted px-1 py-0.5 rounded text-foreground">npm run dev</code></li>
                    <li>• Verify homepage loads</li>
                  </ul>
                </div>
                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-foreground mb-2 text-sm">5 min: Code Tour (Lecture)</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Next.js App Router structure</li>
                    <li>• ClovaXClient class review</li>
                    <li>• Server Actions vs Client Components</li>
                    <li>• Type definitions overview</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Part 2 */}
            <div className="relative pl-12">
              <div className="absolute -left-[25px] top-0 bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-600/20">
                15-50
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">Part 2: News Researcher - Tool Calling</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">35 minutes</p>
              </div>
              <div className="space-y-4">
                <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-foreground mb-4">Key Concepts & Activities</h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-sm font-bold text-primary mb-2">Lecture (10 min)</h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• What is tool calling and why it matters</li>
                        <li>• Tool definition schema and parameters</li>
                        <li>• Request/response flow with tool execution</li>
                        <li>• Demo: <code className="text-xs bg-muted px-1 rounded">lib/tools.ts</code> definition</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-primary mb-2">Hands-on (25 min)</h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Review <code className="text-xs bg-muted px-1 rounded">actions.ts</code>: executeNewsSearch & orchestration</li>
                        <li>• Review <code className="text-xs bg-muted px-1 rounded">page.tsx</code>: UI & Server Action connection</li>
                        <li>• Test queries: "Latest AI news", "Climate change"</li>
                        <li>• Debugging: Watch Server Action logs in terminal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 3 */}
            <div className="relative pl-12">
              <div className="absolute -left-[25px] top-0 bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-600/20">
                50-80
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">Part 3: Receipt Analyzer - Vision AI</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">30 minutes</p>
              </div>
              <div className="space-y-4">
                <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-foreground mb-4">Multimodal AI Deep Dive</h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-sm font-bold text-secondary mb-2">Lecture (8 min)</h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Vision-language models intro</li>
                        <li>• HCX-005 (multimodal) capabilities</li>
                        <li>• Image input formats: URLs vs base64</li>
                        <li>• Message content structure for multimodal</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-secondary mb-2">Hands-on (22 min)</h5>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Review <code className="text-xs bg-muted px-1 rounded">actions.ts</code>: analyzeReceipt logic</li>
                        <li>• Review <code className="text-xs bg-muted px-1 rounded">page.tsx</code>: File upload & base64 conversion</li>
                        <li>• Test with default receipt & student uploads</li>
                        <li>• Experiment with different document types</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 4 */}
            <div className="relative pl-12">
              <div className="absolute -left-[25px] top-0 bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg shadow-orange-600/20">
                80-90
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">Part 4: Wrap-up & Next Steps</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">10 minutes</p>
              </div>
              <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-foreground mb-2 text-sm">Review & Discussion</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Tool calling vs Single-call vision comparison</li>
                      <li>• Model selection strategy (HCX-005 vs 007)</li>
                      <li>• Production best practices (Security, Rate limits)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2 text-sm">Challenge Ideas</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Add more tools (Weather, Stocks)</li>
                      <li>• Build document comparison tool</li>
                      <li>• Implement streaming responses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Teaching Tips Section */}
        <section className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-3">
            <span className="text-2xl">💡</span> Teaching Tips
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Pacing</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keep lectures concise (5-10 min)</li>
                <li>• Pre-load code to avoid delays</li>
                <li>• Adjust Q&A time as needed</li>
                <li>• Have extra challenges ready</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">FAQ Prep</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Why Server Actions?</strong> Security & SSR</li>
                <li>• <strong>Production ready?</strong> Yes, with limits</li>
                <li>• <strong>Tool call fails?</strong> Check error handling</li>
                <li>• <strong>Cost?</strong> Check NCP pricing</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Engagement</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Ask for predictions</li>
                <li>• Code-along moments</li>
                <li>• Pair programming</li>
                <li>• Student demos</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Code Reference Section */}
        <section className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
            <span className="text-2xl">💻</span> Key Code References
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-4">Core Files</h3>
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm font-mono text-muted-foreground border border-border/50">
                <div className="flex items-center gap-2"><span className="text-primary">app/api/clovax/client.ts</span> <span className="text-xs opacity-50">- API client</span></div>
                <div className="flex items-center gap-2"><span className="text-primary">lib/types.ts</span> <span className="text-xs opacity-50">- Type defs</span></div>
                <div className="flex items-center gap-2"><span className="text-primary">lib/tools.ts</span> <span className="text-xs opacity-50">- Tool defs</span></div>
                <div className="flex items-center gap-2"><span className="text-primary">actions.ts</span> <span className="text-xs opacity-50">- Server Actions</span></div>
                <div className="flex items-center gap-2"><span className="text-primary">ChatInterface.tsx</span> <span className="text-xs opacity-50">- UI Component</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-4">Critical Patterns</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Tool Calling Flow</p>
                  <div className="bg-muted/50 rounded-xl p-3 text-xs font-mono text-muted-foreground border border-border/50">
                    1. Define schema<br/>
                    2. Send msg + tools<br/>
                    3. Check finishReason<br/>
                    4. Execute tool<br/>
                    5. Add result to history<br/>
                    6. Get final response
                  </div>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Vision API Flow</p>
                  <div className="bg-muted/50 rounded-xl p-3 text-xs font-mono text-muted-foreground border border-border/50">
                    1. Image to base64<br/>
                    2. Content array (text + image)<br/>
                    3. Call HCX-005<br/>
                    4. Parse response
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
            <span className="text-2xl">🔧</span> Troubleshooting
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="font-bold text-red-600 text-sm">Error: "NEWSAPI_KEY not set"</p>
              <p className="text-xs text-muted-foreground mt-1">Check .env.local file exists and has correct format. Restart dev server.</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="font-bold text-red-600 text-sm">Error: 401 Unauthorized</p>
              <p className="text-xs text-muted-foreground mt-1">Verify CLOVAX_API_KEY, CLIENT_ID, SECRET in .env.local. Check NCP console.</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="font-bold text-red-600 text-sm">Empty Receipt Response</p>
              <p className="text-xs text-muted-foreground mt-1">Ensure image &lt; 4MB. Check data URI prefix. Verify HCX-005 access.</p>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
              <p className="font-bold text-yellow-600 text-sm">Slow Responses</p>
              <p className="text-xs text-muted-foreground mt-1">Vision models are slower. Expect 5-10s latency.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
