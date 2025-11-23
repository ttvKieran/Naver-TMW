import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { PersonalizedRoadmap } from '@/lib/mongodb/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    const roadmap = await PersonalizedRoadmap.findById(id)
      .populate('studentId', 'fullName studentCode')
      .lean();

    if (!roadmap) {
      return NextResponse.json(
        { error: 'Personalized roadmap not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error('Error fetching personalized roadmap:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch personalized roadmap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
