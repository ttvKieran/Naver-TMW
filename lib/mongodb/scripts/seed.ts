import fs from 'fs';
import path from 'path';
import connectDB from '../connection';
import mongoose from 'mongoose';

import { User } from '../models/User';
import { Skill } from '../models/Skill';
import { Course } from '../models/Course';
import { Career } from '../models/Career';
import { Roadmap } from '../models/Roadmap';
import { Student } from '../models/Student';
import { Recommendation } from '../models/Recommendation';
import { ChatSession } from '../models/ChatSession';

async function clearCollections() {
  const models = [ChatSession, Recommendation, Student, Roadmap, Career, Course, Skill, User];

  for (const m of models) {
    try {
      await (m as any).deleteMany({});
      console.log(`Cleared ${m.modelName}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Could not clear ${m.modelName}:`, message);
    }
  }
}

async function seed() {
  await connectDB();
  console.log('Starting DB seed...');
  await clearCollections();

  // 1. Seed Careers and Roadmaps from data/jobs/*.json
  const jobsDir = path.join(process.cwd(), 'data', 'jobs');
  if (fs.existsSync(jobsDir)) {
    const jobFiles = fs.readdirSync(jobsDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${jobFiles.length} job files.`);

    for (const file of jobFiles) {
      const jobData = JSON.parse(fs.readFileSync(path.join(jobsDir, file), 'utf-8'));
      console.log(`Processing ${jobData.career_name}...`);
      
      // Create Career
      const career = await Career.create({
        careerId: jobData.career_id,
        title: jobData.career_name,
        description: jobData.description,
        category: 'Technology',
        overview: {
          salaryRange: { min: 10000000, max: 50000000, currency: 'VND', level: 'entry' },
          jobGrowth: 'High',
          difficulty: 'Medium',
          timeToProficiency: '12-24 months'
        },
        requiredSkills: [],
        isActive: true
      });

      // Process stages/areas to find skills and courses
      const levels = [];
      for (const stage of jobData.stages) {
         const phases = [];
         for (const area of stage.areas) {
            const skillsToLearn = [];
            const recommendedCourses = [];
            const milestones = [];

            for (const item of area.items) {
               if (item.item_type === 'skill' || item.item_type === 'concept') {
                  // Check if skill exists, if not create
                  let skill = await Skill.findOne({ name: item.name });
                  if (!skill) {
                     skill = await Skill.create({
                        skillId: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                        name: item.name,
                        category: item.item_type === 'concept' ? 'technical' : 'technical', // Distinguish if needed
                        difficulty: 'intermediate',
                        description: item.description
                     });
                  }
                  skillsToLearn.push({
                     skillId: skill._id,
                     targetProficiency: 5,
                     priority: 'essential',
                     skillTags: item.skill_tags || [],
                     prerequisites: item.prerequisites || [],
                     requiredSkills: item.required_skills || [],
                     estimatedHours: item.estimated_hours
                  });
               } else if (item.item_type === 'course') {
                  // Check if course exists
                  let course = await Course.findOne({ name: item.name });
                  if (!course) {
                    course = await Course.create({
                      courseId: item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      name: item.name,
                      provider: 'Unknown',
                      level: 'beginner',
                      cost: { amount: 0, currency: 'VND' }
                    });
                  }
                  recommendedCourses.push({
                    courseId: course._id,
                    isRequired: true,
                    order: item.order_index || 1,
                    prerequisites: item.prerequisites || [],
                    estimatedHours: item.estimated_hours
                  });
               } else if (item.item_type === 'project') {
                  milestones.push({
                    title: item.name,
                    description: item.description,
                    skillsApplied: [], // Could link to skills if available
                    deliverable: 'Project Code',
                    prerequisites: item.prerequisites || [],
                    requiredSkills: item.required_skills || [],
                    estimatedHours: item.estimated_hours,
                    skillTags: item.skill_tags || []
                  });
               }
            }
            
            phases.push({
               phaseId: area.id,
               phaseNumber: area.order_index,
               title: area.name,
               description: area.description,
               duration: '1 month',
               skillsToLearn,
               recommendedCourses,
               milestones
            });
         }
         levels.push({
            levelId: stage.id,
            levelNumber: stage.order_index,
            title: stage.name,
            description: stage.description,
            duration: '3 months',
            goals: [],
            phases
         });
      }

      await Roadmap.create({
         careerId: career._id,
         title: `${jobData.career_name} Roadmap`,
         version: '1.0',
         levels,
         isActive: true
      });
    }
  }

  // 2. Seed Users/Students from data/users/users.json
  const usersFile = path.join(process.cwd(), 'data', 'users', 'users.json');
  if (fs.existsSync(usersFile)) {
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    console.log(`Found ${usersData.length} users in users.json`);

    for (const userData of usersData) {
      console.log(`Processing user ${userData.full_name}...`);

      // Create User
      const user = await User.create({
        email: `${userData.user_id.toLowerCase()}@example.com`,
        password: 'password123',
        name: userData.full_name,
        role: 'student'
      });

      // Create Student Profile
      await Student.create({
        userId: user._id,
        studentCode: userData.user_id,
        fullName: userData.full_name,
        
        academic: {
          currentSemester: userData.academic.current_semester,
          gpa: userData.academic.gpa,
          courses: userData.academic.courses.map((c: any) => ({
            code: c.code,
            name: c.name,
            grade: c.grade
          }))
        },

        career: {
          targetCareerId: userData.career.target_career_id,
          actualCareer: userData.career.actual_career,
          targetConfidence: userData.career.target_confidence
        },

        availability: {
          timePerWeekHours: userData.availability.time_per_week_hours
        },

        skills: {
          technical: userData.skills.technical,
          general: userData.skills.general
        },

        interests: userData.interests,
        projects: userData.projects,
        itSkills: userData.it_skill,
        softSkills: userData.soft_skill,

        meta: {
          source: userData.meta.source,
          createdAt: new Date(userData.meta.created_at),
          updatedAt: new Date(userData.meta.updated_at)
        }
      });
    }
  }

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
