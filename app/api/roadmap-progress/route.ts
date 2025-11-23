import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { PersonalizedRoadmap } from '@/lib/mongodb/models';

// PATCH /api/roadmap-progress - Cập nhật trạng thái check/uncheck của item
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { studentId, stageIdx, areaIdx, itemIdx, checked } = body;

    if (!studentId || stageIdx === undefined || areaIdx === undefined || itemIdx === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Tìm roadmap của student
    const roadmap = await PersonalizedRoadmap.findOne({ studentId });
    if (!roadmap) {
      return NextResponse.json(
        { error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    // Validate indices
    if (
      !roadmap.stages[stageIdx] ||
      !roadmap.stages[stageIdx].areas[areaIdx] ||
      !roadmap.stages[stageIdx].areas[areaIdx].items[itemIdx]
    ) {
      return NextResponse.json(
        { error: 'Invalid indices' },
        { status: 400 }
      );
    }

    // Update check status
    roadmap.stages[stageIdx].areas[areaIdx].items[itemIdx].check = checked;

    // Save to database
    await roadmap.save();

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    console.error('Error updating roadmap progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
