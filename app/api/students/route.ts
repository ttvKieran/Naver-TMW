import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Student } from '@/lib/mongodb/models';

export async function GET(request: NextRequest) {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected');
    
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('id');
    
    if (studentId) {
      console.log('Fetching student:', studentId);
      // Get single student with populated data
      const student = await Student.findOne({ studentCode: studentId })
        .populate('userId', 'email name')
        .populate('studentSkills.skillId')
        .populate('studentCourses.courseId')
        .lean();
      
      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ student });
    }
    
    // Get all students (for selection UI)
    console.log('Fetching all students...');
    const students = await Student.find({})
      .select('studentCode fullName gpa personality.mbti currentCareer')
      .lean();
    
    console.log('Found students:', students.length);
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
