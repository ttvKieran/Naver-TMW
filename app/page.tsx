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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2 text-black">Career Advisor AI</h1>
          <p className="text-lg text-black">
            Hệ thống tư vấn nghề nghiệp thông minh với ClovaX API
          </p>
          
          {/* Student Selector */}
          {students.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Chọn sinh viên:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.map((student: any) => (
                  <a
                    key={student.studentCode}
                    href={`/dashboard?id=${student.studentCode}`}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="font-medium text-gray-900">{student.fullName}</div>
                    <div className="text-sm text-gray-600">{student.studentCode}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      GPA: {student.gpa?.toFixed(1)} | {student.personality?.mbti}
                    </div>
                    {student.currentCareer && (
                      <div className="text-xs text-blue-600 mt-1">{student.currentCareer}</div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* About Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-black">About This Cookbook</h2>
          <p className="text-black mb-4">
            This cookbook provides hands-on examples of working with Naver Cloud
            Platform's ClovaX API. Each example demonstrates different
            capabilities and use cases with working code you can explore and
            modify.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You'll need to configure your API keys in{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>{" "}
              before running these examples.
            </p>
          </div>
        </section>

        {/* Examples Grid */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-black">Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ExampleCard
              title="Dashboard NEW"
              description="Tổng quan về kỹ năng, điểm số, tính cách của sinh viên. Xem biểu đồ radar, kỹ năng, danh sách nghề nghiệp hot và roadmap đang theo đuổi."
              href="/dashboard"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
            
            <ExampleCard
              title="Career Advisor"
              description="AI-powered career counseling system. Input your profile (GPA, personality, skills) and get personalized career recommendations with detailed roadmaps powered by ClovaX."
              href="/career-advisor"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            
            <ExampleCard
              title="News Researcher"
              description="Demonstrates tool calling (function calling) with ClovaX. The AI uses NewsAPI to search for and summarize recent news articles based on user queries."
              href="/examples/news-researcher"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              }
            />

            <ExampleCard
              title="Receipt Analyzer"
              description="Demonstrates ClovaX Vision (HCX-005) for image analysis. Upload receipt images and extract information like items, prices, and totals using multimodal AI."
              href="/examples/receipt-analyzer"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />

            <ExampleCard
              title="Lesson Plan"
              description="A comprehensive 90-minute workshop guide for teaching ClovaX API. Includes detailed timeline, teaching tips, and hands-on activities for both examples."
              href="/lesson-plan"
              icon={
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
            />

            {/* Placeholder for future examples */}
            <div className="border rounded-lg p-6 bg-gray-100 border-dashed border-gray-300">
              <div className="text-black">
                <h3 className="text-xl font-semibold mb-2">More Examples Coming Soon</h3>
                <p>Additional examples will be added to showcase more ClovaX capabilities.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="mt-12 border-t pt-12">
          <h2 className="text-2xl font-semibold mb-4 text-black">Resources</h2>
          <ul className="space-y-2 text-blue-600">
            <li>
              <a
                href="https://api.ncloud-docs.com/docs/en/clovastudio-chatcompletionsv3"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                ClovaX Chat Completions V3 API Documentation →
              </a>
            </li>
            <li>
              <a
                href="https://www.ncloud.com/product/aiService/clovaStudio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Naver Cloud Platform - Clova Studio →
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
