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

  const user = await User.create({
    email: 'phanlan@example.com',
    password: '123',
    passwordHash: 'seed-placeholder',
    name: 'Phan Lan',
    role: 'student',
  });

  const skillsPayload = [
    { skillId: 'python', name: 'Python', category: 'technical', difficulty: 'beginner', demandLevel: 9 },
    { skillId: 'git', name: 'Git', category: 'tool', difficulty: 'beginner', demandLevel: 8 },
    { skillId: 'ds', name: 'Data Structures', category: 'technical', difficulty: 'intermediate', demandLevel: 8 },
    { skillId: 'comm', name: 'Communication', category: 'soft-skill', difficulty: 'beginner', demandLevel: 7 },
  ];

  const skills = await Skill.insertMany(skillsPayload);
  console.log(`Inserted ${skills.length} skills`);

  const skillMap = new Map(skills.map((s) => [s.skillId, s._id]));

  const coursesPayload = [
    {
      courseId: 'python-beginners',
      name: 'Python for Beginners',
      provider: 'Coursera',
      level: 'beginner',
      skillsCovered: [{ skillId: skillMap.get('python'), proficiencyGained: 5 }],
      cost: { amount: 0, currency: 'VND' },
    },
    {
      courseId: 'git-essentials',
      name: 'Git Essentials',
      provider: 'Udemy',
      level: 'beginner',
      skillsCovered: [{ skillId: skillMap.get('git'), proficiencyGained: 4 }],
      cost: { amount: 100000, currency: 'VND' },
    },
    {
      courseId: 'ds-bootcamp',
      name: 'Data Structures Bootcamp',
      provider: 'edX',
      level: 'intermediate',
      skillsCovered: [{ skillId: skillMap.get('ds'), proficiencyGained: 6 }],
      cost: { amount: 0, currency: 'VND' },
    },
  ];

  const courses = await Course.insertMany(coursesPayload as any);
  console.log(`Inserted ${courses.length} courses`);

  const courseMap = new Map(courses.map((c) => [c.courseId, c._id]));

  const backendCareer = await Career.create({
    careerId: 'backend-dev',
    title: 'Backend Developer',
    category: 'Software Engineering',
    description: 'Build server-side applications, APIs and backend systems.',
    overview: {
      salaryRange: { min: 8000000, max: 30000000, currency: 'VND', level: 'entry' },
      jobGrowth: 'High',
      difficulty: 'Medium',
      timeToProficiency: '6-12 months',
    },
    requiredSkills: [
      { skillId: skillMap.get('python'), importanceLevel: 'essential', minimumProficiency: 6, category: 'technical' },
      { skillId: skillMap.get('git'), importanceLevel: 'recommended', minimumProficiency: 4, category: 'tool' },
      { skillId: skillMap.get('ds'), importanceLevel: 'highly-recommended', minimumProficiency: 5, category: 'technical' },
    ],
    certifications: [],
    education: { minimumDegree: 'Bachelor', preferredMajors: ['Computer Science'] },
    companies: ['Company A', 'Company B'],
    relatedCareers: [],
    idealProfile: { personalityTypes: ['ISTJ', 'INTJ'], topSkills: [], minGPA: 2.5 },
  });

  console.log('Created Career:', backendCareer.careerId);

  const roadmap = await Roadmap.create({
    careerId: backendCareer._id,
    title: 'Backend Developer Roadmap',
    description: 'Progressive roadmap to become a backend developer.',
    version: '1.0',
    levels: [
      {
        levelId: 'lvl1',
        levelNumber: 1,
        title: 'Foundations',
        duration: '1-2 months',
        goals: ['Basic syntax', 'Version control'],
        phases: [
          {
            phaseId: 'p1-1',
            phaseNumber: 1,
            title: 'Programming Basics',
            duration: '2 weeks',
            skillsToLearn: [
              { skillId: skillMap.get('python'), targetProficiency: 4, priority: 'essential', estimatedTime: '10h' },
            ],
            recommendedCourses: [{ courseId: courseMap.get('python-beginners'), isRequired: true, order: 1 }],
            milestones: [{ title: 'Hello world', skillsApplied: [skillMap.get('python')], deliverable: 'Scripts' }],
          },
        ],
      },
    ],
    isActive: true,
  });

  console.log('Created Roadmap:', roadmap._id.toString());

  const student = await Student.create({
    userId: user._id,
    studentCode: 'STU001',
    fullName: 'Phan Lan',
    university: 'Example University',
    major: 'Computer Science',
    cpa: 3.6,
    personality: { mbti: 'ISTJ', traits: { analytical: 8, creative: 5, teamwork: 6, leadership: 5, technical: 7 }, assessmentDate: new Date(), assessmentSource: 'self' },
    studentSkills: [
      { skillId: skillMap.get('python'), proficiencyLevel: 5, lastAssessed: new Date(), source: 'self-assessment' },
    ],
    studentCourses: [{ courseId: courseMap.get('python-beginners'), status: 'completed', completionDate: new Date(), progress: 100 }],
    interests: ['Backend Developer'],
    currentCareer: 'Backend Developer',
    careerStatus: 'decided',
  });

  console.log('Created Student:', student.studentCode);

  const chat = await ChatSession.create({
    userId: user._id,
    studentId: student._id,
    messages: [
      { role: 'user', content: 'Tell me about Backend Developer', timestamp: new Date() },
      { role: 'assistant', content: 'Backend Developer builds server...', timestamp: new Date() },
    ],
    metadata: { topic: 'career', careerDiscussed: 'Backend Developer' },
    status: 'active',
  });

  console.log('Created ChatSession:', chat._id.toString());

  const recommendation = await Recommendation.create({
    studentId: student._id,
    sessionId: chat._id,
    recommendedCareers: [
      {
        careerId: backendCareer._id,
        careerTitle: backendCareer.title,
        matchScore: 82,
        confidence: 'high',
        strengths: ['Python'],
        skillGaps: [
          { skillId: skillMap.get('ds'), skillName: 'Data Structures', currentLevel: 2, requiredLevel: 5, gap: 3, priority: 'high' },
        ],
        recommendedCourses: [
          { courseId: courseMap.get('ds-bootcamp'), reason: 'Covers core DS', priority: 1, skillsAddressed: [skillMap.get('ds')], estimatedImpact: 60 },
        ],
        recommendedRoadmap: roadmap._id,
        rank: 1,
      },
    ],
    studentSnapshot: { gpa: 3.6, skills: { python: 5 }, interests: student.interests },
    aiAnalysis: { overallAssessment: 'Good fit', keyStrengths: ['Python'], areasForImprovement: ['DS'], careerReadiness: 'needs_preparation' },
    engagement: { viewed: false },
  });

  console.log('Created Recommendation:', recommendation._id.toString());
  console.log('Seed completed successfully.');
}

seed()
  .then(() => {
    console.log('Seed finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
