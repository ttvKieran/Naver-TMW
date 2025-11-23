import Link from 'next/link';
import StudentDashboard from '@/components/StudentDashboard';
import connectDB from '@/lib/mongodb/connection';
import { Student } from '@/lib/mongodb/models/Student';
import { Career } from '@/lib/mongodb/models/Career';

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
    await connectDB();
    
    // Fetch student data
    const dbStudent = await Student.findOne({ studentCode: studentId }).lean();

    if (dbStudent) {
      // Transform database student to dashboard format
      // We can pass the dbStudent mostly as is, but need to handle serialization of ObjectIds
      student = JSON.parse(JSON.stringify(dbStudent));
    } else {
      console.warn(`Student ${studentId} not found`);
    }

    // Fetch careers (which serve as roadmaps source in this context)
    const dbCareers = await Career.find({}).lean();
    
    if (dbCareers) {
        // Serialize ObjectIds to strings
        const serializedCareers = JSON.parse(JSON.stringify(dbCareers));
        hotCareers = serializedCareers.slice(0, 6);
        allRoadmaps = serializedCareers;
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Fallback to hardcoded data if DB fails
    student = {
      studentCode: "STU001",
      fullName: "Vũ Thu Hiếu",
      academic: {
        currentSemester: 5,
        gpa: 3.19,
        courses: []
      },
      career: {
        actualCareer: "Backend Developer"
      },
      availability: {
        timePerWeekHours: 8
      },
      skills: {
        technical: { python: 4, javascript: 4 },
        general: { communication: 8 }
      },
      interests: ["web_dev"],
      projects: []
    };
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/leopath.png" alt="Leopath Logo" className="w-10 h-10"/>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">Leopath</h1>
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
