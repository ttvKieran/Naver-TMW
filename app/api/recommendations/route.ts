import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Recommendation, Student } from '@/lib/mongodb/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId parameter required' },
        { status: 400 }
      );
    }
    
    // Find student by studentCode
    const student = await Student.findOne({ studentCode: studentId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Get latest recommendation with populated data
    const recommendation = await Recommendation.findOne({ studentId: student._id })
      .populate('recommendedCareers.careerId')
      .populate('recommendedCareers.skillGaps.skillId')
      .populate('recommendedCareers.recommendedCourses.courseId')
      .populate('recommendedCareers.recommendedRoadmap')
      .sort({ createdAt: -1 })
      .lean();
    
    if (!recommendation) {
      return NextResponse.json(
        { error: 'No recommendation found for this student' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId, sessionId, recommendedCareers, studentSnapshot, aiAnalysis } = body;
    
    // Find student by studentCode
    const student = await Student.findOne({ studentCode: studentId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Create new recommendation
    const recommendation = await Recommendation.create({
      studentId: student._id,
      sessionId,
      recommendedCareers,
      studentSnapshot,
      aiAnalysis,
      engagement: { viewed: false },
    });
    
    return NextResponse.json({ 
      success: true,
      recommendationId: recommendation._id 
    });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    );
  }
}
