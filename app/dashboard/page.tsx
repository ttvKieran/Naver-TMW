import Link from 'next/link';
import StudentDashboard from '@/components/StudentDashboard';
import { promises as fs } from 'fs';
import path from 'path';

export default async function DashboardPage() {
  const student = {
    id: "STU001",
    name: "Phan Lan",
    actualCareer: "Backend Developer",
    gpa: 3.6,
    personality: {
      mbti: "ISTJ",
      traits: {
        analytical: 9,
        creative: 4,
        teamwork: 5,
        leadership: 6,
        technical: 9
      }
    },
    skills: {
      programming: 7,
      problemSolving: 7,
      communication: 6,
      systemDesign: 8,
      dataAnalysis: 5
    },
    interests: [
      "data-science",
      "coding",
      "automation",
      "cloud"
    ]
  };

  let careersFile = await fs.readFile(
    path.join(process.cwd(), 'data', 'career-roadmaps.json'),
    'utf8'
  );

  if (careersFile.charCodeAt(0) === 0xFEFF) {
    careersFile = careersFile.slice(1);
  }

  const careersData = JSON.parse(careersFile);

  // Get all roadmaps (careers)
  const allRoadmaps = careersData.careers;

  // Get hot careers (just top 6 for display)
  const hotCareers = careersData.careers.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Sinh Viên
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Tổng quan về kỹ năng, điểm số và lộ trình nghề nghiệp
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StudentDashboard
          initialStudent={student}
          hotCareers={hotCareers}
          allRoadmaps={allRoadmaps}
        />
      </main>
    </div>
  );
}
