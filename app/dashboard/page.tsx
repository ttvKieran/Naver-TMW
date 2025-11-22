import Link from 'next/link';
import StudentDashboard from '@/components/StudentDashboard';

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
  let allRoadmaps: any[] = [];

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

    // Fetch careers (which serve as roadmaps source in this context)
    const careersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/careers`, {
      cache: 'no-store'
    });
    const careersData = await careersRes.json();
    
    if (careersData.careers) {
        hotCareers = careersData.careers.slice(0, 6);
        allRoadmaps = careersData.careers;
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
          analytical: 8,
          creative: 4,
          teamwork: 6,
          leadership: 5,
          technical: 9,
        }
      },
      skills: {
        programming: 8,
        problemSolving: 7,
        communication: 6,
        systemDesign: 5,
        dataAnalysis: 7,
      },
      interests: ["coding", "backend", "databases"],
    };
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">Career Platform</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Dashboard</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-muted-foreground">System Online</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
              {student?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

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
