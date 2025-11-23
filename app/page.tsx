import ExampleCard from "@/components/ExampleCard";
import connectDB from '@/lib/mongodb/connection';
import { Student } from '@/lib/mongodb/models';
import LandingNavbar from '@/components/LandingNavbar';

export default async function Home() {
  // Fetch students from database for selection
  // let students = [];
  // try {
  //   await connectDB();
  //   const studentsData = await Student.find({})
  //     .select('studentCode fullName gpa personality.mbti currentCareer')
  //     .lean();
  //   students = JSON.parse(JSON.stringify(studentsData));
  // } catch (error) {
  //   console.error('Error loading students:', error);
  // }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background selection:bg-primary/20">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.6]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Header */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text */}
          <div className="text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold text-primary tracking-wide uppercase">AI-Powered Career Guidance</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter leading-[0.9]">
              Design Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-800 to-primary bg-[length:200%_auto] animate-gradient">Future Career</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed border-l-4 border-primary/20 pl-6">
              Discover your perfect career path, get personalized learning roadmaps, and track your progress with our intelligent student platform.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="/register" className="px-8 py-4 bg-foreground text-background rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                Start the Journey
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="/dashboard" className="px-8 py-4 bg-card text-foreground border border-border rounded-2xl font-bold hover:bg-muted/50 transition-all flex items-center gap-2">
                Go to Dashboard
              </a>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-8">
              <div className="flex -space-x-2">
                {[12,5,15,19].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64+i)}
                  </div>
                ))}
              </div>
              <p>Join <span className="font-bold text-foreground">1,000+</span> students planning their future</p>
            </div>
          </div>

          {/* Right Column: 3D Visual */}
          <div className="relative perspective-1000 h-[600px] hidden lg:block">
            <div className="relative w-full h-full rotate-3d">
              {/* Main Dashboard Card */}
              <div className="absolute inset-0 bg-card/80 backdrop-blur-xl rounded-3xl border border-border/40 shadow-2xl shadow-primary/10 p-6 flex flex-col gap-4 overflow-hidden">
                {/* Mock Header */}
                <div className="flex justify-between items-center border-b border-border/50 pb-4">
                   <div className="w-32 h-4 bg-muted rounded-full"></div>
                   <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted"></div>
                      <div className="w-8 h-8 rounded-full bg-primary/10"></div>
                   </div>
                </div>
                {/* Mock Content Grid */}
                <div className="grid grid-cols-3 gap-4 h-full">
                   <div className="col-span-1 bg-muted/50 rounded-2xl p-4 space-y-3">
                      <div className="w-full h-20 bg-card rounded-xl shadow-sm"></div>
                      <div className="w-full h-20 bg-card rounded-xl shadow-sm"></div>
                      <div className="w-full h-20 bg-card rounded-xl shadow-sm"></div>
                   </div>
                   <div className="col-span-2 space-y-4">
                      <div className="w-full h-40 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/10 p-4">
                         <div className="w-1/2 h-6 bg-primary/10 rounded-lg mb-2"></div>
                         <div className="w-full h-24 bg-card/50 rounded-xl"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-32 bg-muted/50 rounded-2xl"></div>
                         <div className="h-32 bg-muted/50 rounded-2xl"></div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-12 top-20 bg-card p-4 rounded-2xl shadow-xl border border-border floating-card w-48">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                    <div className="text-lg font-bold text-foreground">98%</div>
                  </div>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[98%]"></div>
                </div>
              </div>

              <div className="absolute -left-8 bottom-32 bg-card p-4 rounded-2xl shadow-xl border border-border floating-card-delayed w-56">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">AI</div>
                  <div>
                    <div className="text-xs text-muted-foreground">Career Advisor</div>
                    <div className="text-sm font-bold text-foreground">"Try Software Engineer"</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Student Selector (Dev Mode) */}
      {/* {students.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-24 relative z-10">
          <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-border/60 p-8 md:p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Select Profile (Dev Mode)</h3>
              <span className="px-2 py-1 bg-card rounded text-xs font-mono text-muted-foreground border border-border">{students.length} Students</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student: any) => (
                <a
                  key={student.studentCode}
                  href={`/dashboard?id=${student.studentCode}`}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{student.fullName}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{student.studentCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">{student.gpa?.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">GPA</span></div>
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground mt-1 inline-block group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {student.personality?.mbti}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {/* Main Features - Bento Grid Style */}
      <main id="features" className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h3 className="text-4xl font-bold text-foreground tracking-tight mb-4">Everything you need to <br/>master your future</h3>
          <p className="text-muted-foreground text-lg">Our platform combines AI analysis with proven educational frameworks to guide you.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Large Card */}
          <div className="md:col-span-2 row-span-1 relative group overflow-hidden rounded-3xl border border-border bg-card p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 012-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Smart Dashboard</h3>
                <p className="text-muted-foreground max-w-md">Your personal command center. View real-time career matches, analyze your skill gaps, and interact with your personalized learning roadmap.</p>
              </div>
              <a href="/dashboard" className="inline-flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                Explore Dashboard <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
            {/* Decorative UI Element */}
            <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-muted/50 rounded-tl-3xl border-t border-l border-border p-4 transform translate-y-4 translate-x-4 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform duration-500">
               <div className="w-full h-full bg-card rounded-xl shadow-sm p-4">
                  <div className="flex gap-2 mb-4">
                     <div className="w-8 h-8 rounded-full bg-muted"></div>
                     <div className="space-y-1">
                        <div className="w-20 h-2 bg-muted rounded"></div>
                        <div className="w-12 h-2 bg-muted/50 rounded"></div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="w-full h-2 bg-muted/50 rounded"></div>
                     <div className="w-full h-2 bg-muted/50 rounded"></div>
                     <div className="w-2/3 h-2 bg-muted/50 rounded"></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Tall Card */}
          <div className="md:col-span-1 row-span-1 relative group overflow-hidden rounded-3xl border border-border bg-card p-8 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-500/5 to-transparent opacity-50"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-secondary/10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Career Advisor</h3>
              <p className="text-muted-foreground text-sm mb-6">Take a survey with our AI counselor to discover careers that match your skills set.</p>
              <a href="/register" className="w-full py-3 rounded-xl bg-background border border-border text-center block font-semibold hover:bg-muted transition-colors text-foreground">Start Survey</a>
            </div>
          </div>
        </div>
      </main>

      {/* Examples Section */}
      {/* <section className="py-24 px-6 bg-card/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Explore Capabilities</h2>
              <p className="text-muted-foreground">See what our AI models can do for you</p>
            </div>
            <a href="/examples" className="text-primary font-bold hover:underline">View all examples →</a>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <ExampleCard
              title="News Researcher"
              description="AI agent that researches latest tech news and summarizes key trends for your career."
              href="/examples/news-researcher"
              icon="📰"
              tags={["ClovaX", "Search", "Summary"]}
            />
            <ExampleCard
              title="Receipt Analyzer"
              description="Extract expense data from receipts to help manage your learning budget."
              href="/examples/receipt-analyzer"
              icon="🧾"
              tags={["Vision", "OCR", "Finance"]}
            />
          </div>
        </div>
      </section> */}

      {/* About Section */}
      <section id="about" className="py-24 px-6 relative z-10 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs font-bold text-primary tracking-wide uppercase">About Us</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground tracking-tight">A Reliable Companion with Students</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Leopath is an intelligent career guidance platform designed to help students navigate their academic and professional journey. By leveraging the power of Naver ClovaX, we provide personalized career recommendations, learning roadmaps, and real-time skill analysis.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Powered by Naver ClovaX</h4>
                    <p className="text-sm text-muted-foreground">Utilizing advanced large language models to understand student profiles and generate tailored advice.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Personalized Roadmaps</h4>
                    <p className="text-sm text-muted-foreground">Dynamic learning paths that adapt to your current skills and career goals.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl transform rotate-3"></div>
              <div className="relative bg-card border border-border rounded-3xl p-6 shadow-2xl">
                <img src="8.png" alt="About Leopath" className="w-full h-auto rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4">Get in Touch</h2>
          <p className="text-muted-foreground text-lg">Have questions about Leopath? We'd love to hear from you.</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-2">For general inquiries</p>
              <a href="mailto:contact@leopath.edu" className="text-primary font-medium hover:underline">contact@leopath.edu</a>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">Visit Us</h3>
              <p className="text-sm text-muted-foreground mb-2">PTIT Campus</p>
              <span className="text-foreground text-sm">Hanoi, Vietnam</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <form className="p-8 rounded-3xl bg-card border border-border shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                  <input type="text" id="name" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <input type="email" id="email" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="leopath.png" alt="Leopath Logo" className="w-8 h-8"/>
            <span className="font-bold text-foreground">Leopath</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Leopath. Powered by Naver ClovaX.</p>
        </div>
      </footer>
    </div>
  );
}
