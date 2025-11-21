import ExampleCard from "@/components/ExampleCard";

export default async function Home() {
  // Fetch students from database for selection
  let students = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/students`, {
      cache: 'no-store'
    });
    const data = await response.json();
    students = data.students || [];
  } catch (error) {
    console.error('Error loading students:', error);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Career Platform</h1>
            <p className="text-sm text-indigo-600 font-medium">Powered by Naver ClovaX</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Build Your Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Guidance</span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover your perfect career path, get personalized learning roadmaps, and track your progress with our AI-powered student platform.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <a href="/dashboard" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
            Go to Dashboard
          </a>
          <a href="/career-advisor" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
            Start Career Advisor
          </a>
        </div>
      </section>

      {/* Student Selector (Dev Mode) */}
      {students.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mb-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-6">Select a Student Profile (Dev Mode)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student: any) => (
                <a
                  key={student.studentCode}
                  href={`/dashboard?id=${student.studentCode}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group bg-white"
                >
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-indigo-700">{student.fullName}</div>
                    <div className="text-xs text-gray-500">{student.studentCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-900">{student.gpa?.toFixed(1)} GPA</div>
                    <div className="text-xs text-gray-500">{student.personality?.mbti}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Features */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Core Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <ExampleCard
            title="Smart Dashboard"
            description="Your personal command center. View real-time career matches, analyze your skill gaps, and interact with your personalized learning roadmap."
            href="/dashboard"
            icon={
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          />

          <ExampleCard
            title="AI Career Advisor"
            description="Not sure what to do? Chat with our AI counselor to discover careers that match your personality and skills, powered by Naver ClovaX."
            href="/career-advisor"
            icon={
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        </div>

        {/* Tech Demos */}
        <div className="border-t border-indigo-100 pt-16">
          <h3 className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-wider">Technical Demos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
            <ExampleCard
              title="News Researcher"
              description="Tool calling demo with NewsAPI."
              href="/examples/news-researcher"
              icon={<span className="text-2xl">📰</span>}
            />
            <ExampleCard
              title="Receipt Analyzer"
              description="Vision AI demo for receipts."
              href="/examples/receipt-analyzer"
              icon={<span className="text-2xl">🧾</span>}
            />
            <ExampleCard
              title="Lesson Plan"
              description="Workshop guide."
              href="/lesson-plan"
              icon={<span className="text-2xl">📚</span>}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
