// Script to sync existing MongoDB users to clova-rag-roadmap users.json
import connectDB from '../lib/mongodb/connection';
import { Student } from '../lib/mongodb/models/Student';

async function syncUserToRag(studentId: string) {
  try {
    await connectDB();

    const student = await Student.findById(studentId);
    if (!student) {
      console.error('Student not found:', studentId);
      return;
    }

    console.log('Found student:', student.fullName);

    // Build skills maps
    const technicalSkills: Record<string, number> = {};
    const generalSkills: Record<string, number> = {};
    
    if (student.skills?.technical) {
      if (student.skills.technical instanceof Map) {
        student.skills.technical.forEach((level: number, skillName: string) => {
          technicalSkills[skillName] = level;
        });
      } else if (typeof student.skills.technical === 'object') {
        Object.entries(student.skills.technical).forEach(([skillName, level]) => {
          technicalSkills[skillName] = level as number;
        });
      }
    }
    
    if (student.skills?.general) {
      if (student.skills.general instanceof Map) {
        student.skills.general.forEach((level: number, skillName: string) => {
          generalSkills[skillName] = level;
        });
      } else if (typeof student.skills.general === 'object') {
        Object.entries(student.skills.general).forEach(([skillName, level]) => {
          generalSkills[skillName] = level as number;
        });
      }
    }

    // Format for clova-rag-roadmap
    const clovaUserData = {
      user_id: student._id.toString(),
      full_name: student.fullName,
      current_semester: student.academic?.currentSemester || 1,
      gpa: student.academic?.gpa || 0,
      target_career_id: student.career?.targetCareerID || 'full_stack_developer',
      actual_career: student.career?.actualCareer || 'Full Stack Developer',
      time_per_week_hours: student.availability?.timePerWeekHours || 10,
      it_skills: student.itSkill || [],
      soft_skills: student.softSkill || [],
      skills: {
        technical: technicalSkills,
        general: generalSkills,
      },
      interests: student.interests || [],
      projects: student.projects?.map((p: any) => p.title || p.name || p) || [],
      academic: {
        current_semester: student.academic?.currentSemester || 1,
        gpa: student.academic?.gpa || 0,
        courses: student.academic?.courses || [],
      },
      career: {
        target_career_id: student.career?.targetCareerID || 'full_stack_developer',
        actual_career: student.career?.actualCareer || 'Full Stack Developer',
        target_confidence: student.career?.targetConfidence || 0.8,
      },
      availability: {
        time_per_week_hours: student.availability?.timePerWeekHours || 10,
      },
    };

    console.log('Syncing user to clova-rag-roadmap...');
    
    // Call sync-user API
    const response = await fetch('http://localhost:3000/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clovaUserData),
    });

    if (response.ok) {
      console.log('✅ User synced successfully!');
      console.log('User ID:', student._id.toString());
      console.log('Career:', student.career?.actualCareer);
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to sync user:', errorData);
    }

  } catch (error) {
    console.error('Error syncing user:', error);
  } finally {
    process.exit(0);
  }
}

const studentId = process.argv[2] || '69221879f907a50cc7236bbd';
console.log('Syncing student:', studentId);
syncUserToRag(studentId);
