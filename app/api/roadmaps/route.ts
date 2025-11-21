import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Roadmap } from '@/lib/mongodb/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const careerId = searchParams.get('careerId');
    
    if (!careerId) {
      return NextResponse.json(
        { error: 'careerId parameter required' },
        { status: 400 }
      );
    }
    
    // Get roadmap for career with populated skills and courses
    const roadmap = await Roadmap.findOne({ careerId, isActive: true })
      .populate('careerId')
      .populate('levels.phases.skillsToLearn.skillId')
      .populate('levels.phases.recommendedCourses.courseId')
      .lean();
    
    if (!roadmap) {
      return NextResponse.json(
        { error: 'Roadmap not found for this career' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}
