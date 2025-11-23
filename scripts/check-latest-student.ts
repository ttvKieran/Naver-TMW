import connectDB from '../lib/mongodb/connection';
import { Student } from '../lib/mongodb/models/Student';

async function checkLatestStudent() {
  try {
    await connectDB();
    
    const latest = await Student.findOne()
      .sort({ 'meta.createdAt': -1 })
      .limit(1);
    
    if (!latest) {
      console.log('No students found');
      return;
    }
    
    console.log('Latest student:', {
      _id: latest._id,
      fullName: latest.fullName,
      studentCode: latest.studentCode,
      hasAiRecommendation: !!latest.aiCareerRecommendation,
      aiRecommendationLength: latest.aiCareerRecommendation?.length || 0,
      aiRecommendationPreview: latest.aiCareerRecommendation?.substring(0, 100) || 'N/A',
      createdAt: latest.meta?.createdAt,
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkLatestStudent();
