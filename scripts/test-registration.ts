import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testRegistration() {
  const testUser = {
    // User account
    email: `test${Date.now()}@example.com`,
    password: 'Test123456',
    name: `testuser${Date.now()}`,
    
    // Student profile
    fullName: `Test User ${Date.now()}`,
    studentId: `STU${Date.now().toString().slice(-6)}`,
    dateOfBirth: '2000-01-01',
    currentSemester: 1,
    major: 'Computer Science',
    gpa: 3.5,
    
    // Skills
    skills: {
      itSkills: ['javascript', 'python'],
      softSkills: ['teamwork', 'communication'],
      technicalSkills: {
        javascript: 6,
        python: 5,
      },
      generalSkills: {
        teamwork: 7,
        communication: 6,
      },
    },
    
    interests: ['web development', 'ai'],
    
    // AI Preview data (simulating what preview step would return)
    aiCareerRecommendation: 'Based on your skills in JavaScript and Python, you would be a great Full Stack Developer. Your teamwork and communication skills will help you collaborate effectively in development teams.',
  };

  console.log('🧪 Testing registration with:', {
    email: testUser.email,
    name: testUser.name,
    fullName: testUser.fullName,
    skills: testUser.skills.itSkills,
  });

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Registration successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      // Check if roadmap was created
      if (data.personalizedRoadmap) {
        console.log('\n🎯 Personalized Roadmap:');
        console.log('- Career:', data.personalizedRoadmap.careerName);
        console.log('- Stages:', data.personalizedRoadmap.stages?.length || 0);
        if (data.personalizedRoadmap.stages && data.personalizedRoadmap.stages.length > 0) {
          console.log('- First stage:', data.personalizedRoadmap.stages[0].name);
          console.log('- Areas in first stage:', data.personalizedRoadmap.stages[0].areas?.length || 0);
        }
      } else {
        console.log('\n⚠️ No personalized roadmap in response');
      }
    } else {
      console.error('\n❌ Registration failed!');
      console.error('Status:', response.status);
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error);
  }
}

testRegistration();
