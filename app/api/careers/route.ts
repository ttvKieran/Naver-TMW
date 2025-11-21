import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Career } from '@/lib/mongodb/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const careerId = searchParams.get('id');
    
    if (careerId) {
      // Get single career with populated skills
      const career = await Career.findOne({ careerId })
        .populate('requiredSkills.skillId')
        .lean();
      
      if (!career) {
        return NextResponse.json(
          { error: 'Career not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ career });
    }
    
    // Get all active careers sorted by popularity
    const careers = await Career.find({ isActive: true })
      .select('careerId title category description overview popularity')
      .sort({ popularity: -1 })
      .lean();
    
    return NextResponse.json({ careers });
  } catch (error) {
    console.error('Error fetching careers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch careers' },
      { status: 500 }
    );
  }
}
