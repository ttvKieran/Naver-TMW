import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb/connection';
import { User } from '@/lib/mongodb/models/User';
import { Student } from '@/lib/mongodb/models/Student';
import RoadmapViewer from '@/components/RoadmapViewer';

async function getStudentData(email: string) {
  await connectDB();
  
  const user = await User.findOne({ email }).lean();
  if (!user) return null;

  const dbStudent = await Student.findOne({ userId: user._id }).lean();
  if (!dbStudent) return null;

  // Fetch personalized roadmap
  const roadmapResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/personalized-roadmap?studentId=${dbStudent._id}`,
    { cache: 'no-store' }
  );

  let roadmap = null;
  if (roadmapResponse.ok) {
    roadmap = await roadmapResponse.json();
  }

  return {
    student: {
      _id: dbStudent._id.toString(),
      fullName: dbStudent.fullName,
      studentCode: dbStudent.studentCode,
      email: user.email,
      careerGoals: dbStudent.careerGoals,
      aiCareerRecommendation: dbStudent.aiCareerRecommendation,
    },
    roadmap,
  };
}

export default async function RoadmapPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('userEmail')?.value;

  if (!userEmail) {
    redirect('/login');
  }

  const data = await getStudentData(userEmail);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
          <p className="text-gray-600">Unable to load student profile.</p>
        </div>
      </div>
    );
  }

  if (!data.roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Roadmap Available</h1>
          <p className="text-gray-600 mb-4">
            Your personalized learning roadmap has not been generated yet.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoadmapViewer student={data.student} roadmap={data.roadmap} />
    </div>
  );
}
