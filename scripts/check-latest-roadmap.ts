import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../lib/mongodb/connection';
import { PersonalizedRoadmap } from '../lib/mongodb/models/PersonalizedRoadmap';
import { Student } from '../lib/mongodb/models/Student';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function checkLatestRoadmap() {
  try {
    await connectDB();

    // Get latest student
    const latestStudent = await Student.findOne()
      .sort({ createdAt: -1 })
      .select('_id name studentCode email');

    if (!latestStudent) {
      console.log('❌ No students found');
      return;
    }

    console.log('📋 Latest student:');
    console.log('- ID:', latestStudent._id);
    console.log('- Name:', latestStudent.name);
    console.log('- Student Code:', latestStudent.studentCode);
    console.log('- Email:', latestStudent.email);

    // Check if roadmap exists for this student
    const roadmap = await PersonalizedRoadmap.findOne({ studentId: latestStudent._id })
      .sort({ generatedAt: -1 });

    if (roadmap) {
      console.log('\n✅ Personalized Roadmap found:');
      console.log('- Career:', roadmap.careerName);
      console.log('- Career ID:', roadmap.careerID);
      console.log('- Stages:', roadmap.stages?.length || 0);
      console.log('- Generated:', roadmap.generatedAt);
      
      if (roadmap.stages && roadmap.stages.length > 0) {
        console.log('\n📚 Stages:');
        roadmap.stages.forEach((stage: any, idx: number) => {
          console.log(`  ${idx + 1}. ${stage.name} (${stage.areas?.length || 0} areas)`);
        });
      }
    } else {
      console.log('\n❌ No personalized roadmap found for this student');
    }

    // Check total roadmaps in DB
    const totalRoadmaps = await PersonalizedRoadmap.countDocuments();
    console.log('\n📊 Total roadmaps in database:', totalRoadmaps);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkLatestRoadmap();
