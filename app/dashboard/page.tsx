import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StudentDashboard from '@/components/StudentDashboard';
import Navbar from '@/components/Navbar';
import connectDB from '@/lib/mongodb/connection';
import { Student, Career, PersonalizedRoadmap } from '@/lib/mongodb/models';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const { studentId } = session.user;

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Student profile not found
            </h1>
            <Link href="/register" className="text-blue-600 hover:underline">
              Complete your registration →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch student data
  let student: any = null;
  let dbStudent: any = null;
  let hotCareers: any[] = [];
  let currentRoadmap: any = null;
  let currentCareerId: string | null = null;

  try {
    await connectDB();

    // 1. Fetch Student
    dbStudent = await Student.findById(studentId).lean();

    if (dbStudent) {
      student = {
        id: dbStudent.studentCode,
        studentDbId: dbStudent._id.toString(),
        name: dbStudent.fullName,
        university: dbStudent.university || 'Unknown University',
        major: dbStudent.major || 'Computer Science',
        actualCareer:
          dbStudent.career?.actualCareer ||
          dbStudent.career?.targetCareerID ||
          'Backend Developer',
        predictedCareer: dbStudent.career?.targetCareerID,
        targetConfidence: dbStudent.career?.targetConfidence,
        aiCareerRecommendation: dbStudent.aiCareerRecommendation,
        gpa: dbStudent.academic?.gpa || 3.0,
        currentSemester: dbStudent.academic?.currentSemester,
        personality: {
          mbti: dbStudent.personality?.mbti || 'ISTJ',
          traits: dbStudent.personality?.traits || {
            analytical: 5,
            creative: 5,
            teamwork: 5,
            leadership: 5,
            technical: 5,
          },
        },
        skills: {} as Record<string, number>,
        interests: dbStudent.interests || [],
        itSkill: dbStudent.itSkill || [],
        softSkill: dbStudent.softSkill || [],
      };

      // Process skills
      if (dbStudent.skills?.technical) {
        if (dbStudent.skills.technical instanceof Map) {
          dbStudent.skills.technical.forEach((level: number, skillName: string) => {
            student.skills[skillName.toLowerCase().replace(/\s+/g, '')] = level;
          });
        } else {
          Object.entries(dbStudent.skills.technical).forEach(([skillName, level]) => {
            student.skills[skillName.toLowerCase().replace(/\s+/g, '')] = level as number;
          });
        }
      }

      if (dbStudent.skills?.general) {
        if (dbStudent.skills.general instanceof Map) {
          dbStudent.skills.general.forEach((level: number, skillName: string) => {
            student.skills[skillName.toLowerCase().replace(/\s+/g, '')] = level;
          });
        } else {
          Object.entries(dbStudent.skills.general).forEach(([skillName, level]) => {
            student.skills[skillName.toLowerCase().replace(/\s+/g, '')] = level as number;
          });
        }
      }

      if (Object.keys(student.skills).length === 0) {
        student.skills = {
          programming: 7,
          problemSolving: 7,
          communication: 6,
          systemDesign: 8,
          dataAnalysis: 5,
        };
      }
    }

    // 2. Fetch Careers (Limit to top 6 trending)
    const careersData = await Career.find({ isActive: true })
      .select('careerId title category description overview popularity')
      .sort({ popularity: -1 })
      .lean();
    
    hotCareers = careersData.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      id: c.careerId
    })) || [];

    const currentCareer = hotCareers.find(
      (c: any) => c.title.toLowerCase() === student?.actualCareer?.toLowerCase()
    );

    if (currentCareer) {
      currentCareerId = currentCareer._id;
    }

    // 3. Fetch Personalized Roadmap
    if (dbStudent) {
      try {
        const roadmapData = await PersonalizedRoadmap.aggregate([
          { $match: { studentId: dbStudent._id, isActive: true } },
          { $sort: { generatedAt: -1 } },
          { $limit: 1 },
          { 
            $project: { 
              careerName: 1, 
              description: 1, 
              generatedAt: 1, 
              stagesCount: { $size: { $ifNull: ["$stages", []] } } 
            } 
          }
        ]);

        const roadmap = roadmapData[0];

        if (roadmap) {
          currentRoadmap = {
            _id: roadmap._id.toString(),
            careerName: roadmap.careerName,
            description: roadmap.description,
            generatedAt: roadmap.generatedAt,
            stagesCount: roadmap.stagesCount || 0,
          };
        }
      } catch (err) {
        console.error('Error fetching roadmap:', err);
      }
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to load student data
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <StudentDashboard
          student={student}
          hotCareers={hotCareers}
          currentRoadmap={currentRoadmap}
          currentCareerId={currentCareerId}
        />
      </main>
    </div>
  );
}
