import Link from 'next/link';
import StudentDashboard from '@/components/StudentDashboard';
import { promises as fs } from 'fs';
import path from 'path';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const studentId = params.id || 'STU001';

  // Fetch student data from database
  let student: any = null;
  let hotCareers: any[] = [];
  let currentRoadmap: any = null;
  let currentCareerId: string | null = null;

  try {
    // Fetch student with populated skills/courses
    const studentRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/students?id=${studentId}`, {
      cache: 'no-store'
    });
    const studentData = await studentRes.json();

    if (studentData.student) {
      const dbStudent = studentData.student;

      // Transform database student to dashboard format
      student = {
        id: dbStudent.studentCode,
        name: dbStudent.fullName,
        actualCareer: dbStudent.currentCareer || 'Backend Developer',
        gpa: dbStudent.gpa,
        personality: {
          mbti: dbStudent.personality?.mbti || 'ISTJ',
          traits: dbStudent.personality?.traits || {
            analytical: 5,
            creative: 5,
            teamwork: 5,
            leadership: 5,
            technical: 5,
          }
        },
        skills: {} as Record<string, number>,
        interests: dbStudent.interests || [],
      };

      // Convert studentSkills array to skills object for chart
      if (dbStudent.studentSkills && dbStudent.studentSkills.length > 0) {
        dbStudent.studentSkills.forEach((skill: any) => {
          const skillName = skill.skillId?.name?.toLowerCase().replace(/\s+/g, '') || 'unknown';
          student.skills[skillName] = skill.proficiencyLevel;
        });
      } else {
        // Fallback skills
        student.skills = {
          programming: 7,
          problemSolving: 7,
          communication: 6,
          systemDesign: 8,
          dataAnalysis: 5,
        };
      }
    }

    // Fetch hot careers
    const careersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/careers`, {
      cache: 'no-store'
    });
    const careersData = await careersRes.json();
    hotCareers = careersData.careers?.slice(0, 6) || [];

    // Find career by title match
    const currentCareer = careersData.careers?.find((c: any) =>
      c.title.toLowerCase() === student?.actualCareer?.toLowerCase()
    );

    // Fetch roadmap for current career
    if (currentCareer) {
      currentCareerId = currentCareer._id;
      try {
        const roadmapRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/roadmaps?careerId=${currentCareer._id}`, {
          cache: 'no-store'
        });
        const roadmapData = await roadmapRes.json();
        currentRoadmap = roadmapData.roadmap;
      } catch (err) {
        console.error('Roadmap not found:', err);
      }
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Fallback to hardcoded data
    student = {
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
      interests: ["data-science", "coding", "automation", "cloud"]
    };
  }

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

  // Get hot careers (just top 6 for display) if not already fetched
  if (hotCareers.length === 0) {
    hotCareers = careersData.careers.slice(0, 6);
  }

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
