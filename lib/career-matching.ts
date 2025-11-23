interface ProfileData {
  gpa: number;
  mbti: string;
  traits: {
    analytical: number;
    creative: number;
    teamwork: number;
    leadership: number;
    technical: number;
  };
  skills: {
    programming: number;
    problemSolving: number;
    communication: number;
    systemDesign: number;
    dataAnalysis: number;
  };
  interests: string[];
}

interface CareerMatch {
  career: string;
  matchScore: number;
  reasons: string[];
  challenges: string[];
}

export function predictCareers(profile: ProfileData): CareerMatch[] {
  const careers: Record<string, {
    requiredGPA: number;
    mbtiPreference: string[];
    traitWeights: Record<string, number>;
    skillWeights: Record<string, number>;
    relatedInterests: string[];
  }> = {
    'Big Data Engineer': {
      requiredGPA: 3.0,
      mbtiPreference: ['INTJ', 'INTP', 'ENTJ'],
      traitWeights: {
        analytical: 0.4,
        technical: 0.4,
        creative: 0.1,
        teamwork: 0.1,
        leadership: 0.0,
      },
      skillWeights: {
        dataAnalysis: 0.4,
        programming: 0.3,
        systemDesign: 0.2,
        problemSolving: 0.1,
        communication: 0.0,
      },
      relatedInterests: ['data-science', 'coding', 'cloud', 'ai-ml'],
    },
    'Business Intelligence Analyst': {
      requiredGPA: 2.5,
      mbtiPreference: ['ESTJ', 'ISTJ', 'ENTJ'],
      traitWeights: {
        analytical: 0.5,
        communication: 0.3,
        technical: 0.1,
        creative: 0.1,
        teamwork: 0.0,
      },
      skillWeights: {
        dataAnalysis: 0.5,
        communication: 0.3,
        problemSolving: 0.2,
        programming: 0.0,
        systemDesign: 0.0,
      },
      relatedInterests: ['data-science', 'business', 'analysis'],
    },
    'Cloud Architect': {
      requiredGPA: 3.0,
      mbtiPreference: ['ENTJ', 'INTJ', 'ESTJ'],
      traitWeights: {
        technical: 0.3,
        systemDesign: 0.4,
        leadership: 0.2,
        analytical: 0.1,
        creative: 0.0,
      },
      skillWeights: {
        systemDesign: 0.5,
        programming: 0.2,
        communication: 0.2,
        problemSolving: 0.1,
        dataAnalysis: 0.0,
      },
      relatedInterests: ['cloud', 'security', 'coding', 'architecture'],
    },
    'Data Analyst': {
      requiredGPA: 2.5,
      mbtiPreference: ['ISTJ', 'ISFJ', 'ESTJ'],
      traitWeights: {
        analytical: 0.5,
        technical: 0.2,
        communication: 0.2,
        creative: 0.1,
        teamwork: 0.0,
      },
      skillWeights: {
        dataAnalysis: 0.6,
        communication: 0.2,
        problemSolving: 0.1,
        programming: 0.1,
        systemDesign: 0.0,
      },
      relatedInterests: ['data-science', 'analysis', 'statistics'],
    },
    'Data Scientist': {
      requiredGPA: 3.2,
      mbtiPreference: ['INTP', 'INTJ', 'ENTP'],
      traitWeights: {
        analytical: 0.4,
        creative: 0.2,
        technical: 0.3,
        teamwork: 0.1,
        leadership: 0.0,
      },
      skillWeights: {
        dataAnalysis: 0.4,
        programming: 0.3,
        problemSolving: 0.2,
        communication: 0.1,
        systemDesign: 0.0,
      },
      relatedInterests: ['data-science', 'ai-ml', 'coding', 'math'],
    },
    'Full Stack Developer': {
      requiredGPA: 2.5,
      mbtiPreference: ['ENFP', 'INFP', 'ENTP', 'INTP'],
      traitWeights: {
        creative: 0.2,
        technical: 0.4,
        analytical: 0.2,
        teamwork: 0.2,
        leadership: 0.0,
      },
      skillWeights: {
        programming: 0.4,
        systemDesign: 0.2,
        problemSolving: 0.2,
        communication: 0.1,
        dataAnalysis: 0.1,
      },
      relatedInterests: ['web-development', 'coding', 'design', 'mobile-apps'],
    },
    'Information Security Analyst': {
      requiredGPA: 2.8,
      mbtiPreference: ['ISTJ', 'INTJ', 'ISTP'],
      traitWeights: {
        analytical: 0.4,
        technical: 0.4,
        creative: 0.1,
        teamwork: 0.1,
        leadership: 0.0,
      },
      skillWeights: {
        problemSolving: 0.4,
        systemDesign: 0.3,
        programming: 0.2,
        communication: 0.1,
        dataAnalysis: 0.0,
      },
      relatedInterests: ['security', 'coding', 'networks'],
    },
    'Machine Learning Engineer': {
      requiredGPA: 3.2,
      mbtiPreference: ['INTJ', 'INTP', 'ENTJ'],
      traitWeights: {
        analytical: 0.4,
        technical: 0.4,
        creative: 0.1,
        teamwork: 0.1,
        leadership: 0.0,
      },
      skillWeights: {
        dataAnalysis: 0.3,
        programming: 0.3,
        problemSolving: 0.3,
        systemDesign: 0.1,
        communication: 0.0,
      },
      relatedInterests: ['ai-ml', 'coding', 'math', 'data-science'],
    },
  };

  const results: CareerMatch[] = [];

  for (const [careerName, requirements] of Object.entries(careers)) {
    let score = 0;
    const reasons: string[] = [];
    const challenges: string[] = [];

    const gpaScore = profile.gpa >= requirements.requiredGPA ? 1.0 : profile.gpa / requirements.requiredGPA;
    score += gpaScore * 0.2;

    if (profile.gpa >= requirements.requiredGPA) {
      reasons.push(`GPA ${profile.gpa.toFixed(1)} đáp ứng yêu cầu ngành`);
    } else {
      challenges.push(`GPA hiện tại thấp hơn mức khuyến nghị (${requirements.requiredGPA})`);
    }

    const mbtiMatch = requirements.mbtiPreference.includes(profile.mbti);
    if (mbtiMatch) {
      score += 0.15;
      reasons.push(`Tính cách ${profile.mbti} rất phù hợp với ngành này`);
    } else {
      score += 0.05;
    }
    let traitScore = 0;
    for (const [trait, weight] of Object.entries(requirements.traitWeights)) {
      const value = profile.traits[trait as keyof typeof profile.traits] / 10; // Normalize to 0-1
      traitScore += value * weight;
    }
    score += traitScore * 0.3;

    const strongTraits = Object.entries(profile.traits)
      .filter(([_, value]) => value >= 7)
      .map(([trait]) => trait);
    
    if (strongTraits.length > 0) {
      reasons.push(`Điểm mạnh về ${strongTraits.join(', ')}`);
    }

    let skillScore = 0;
    for (const [skill, weight] of Object.entries(requirements.skillWeights)) {
      const value = profile.skills[skill as keyof typeof profile.skills] / 10;
      skillScore += value * weight;
    }
    score += skillScore * 0.25;

    const weakSkills = Object.entries(profile.skills)
      .filter(([skill, value]) => {
        const weight = requirements.skillWeights[skill as keyof typeof requirements.skillWeights];
        return weight > 0.2 && value < 5;
      })
      .map(([skill]) => skill);
    
    if (weakSkills.length > 0) {
      challenges.push(`Cần cải thiện kỹ năng: ${weakSkills.join(', ')}`);
    }

    const matchingInterests = profile.interests.filter(interest =>
      requirements.relatedInterests.includes(interest)
    );
    const interestScore = matchingInterests.length / requirements.relatedInterests.length;
    score += interestScore * 0.1;

    if (matchingInterests.length > 0) {
      reasons.push(`Sở thích trùng khớp: ${matchingInterests.join(', ')}`);
    } else {
      challenges.push('Sở thích chưa hoàn toàn align với ngành');
    }

    if (careerName === 'AI Engineer' && profile.gpa < 3.5) {
      challenges.push('Ngành AI đòi hỏi nền tảng toán học vững (GPA cao hơn sẽ tốt hơn)');
    }
    if (careerName === 'DevOps Engineer' && profile.traits.teamwork < 6) {
      challenges.push('DevOps yêu cầu làm việc nhóm tốt');
    }

    results.push({
      career: careerName,
      matchScore: Math.min(score, 1.0),
      reasons,
      challenges,
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);

  return results.slice(0, 5); 
}

// [
//   {
//     career: "AI Engineer",
//     matchScore: 0.92,  // 92%
//     reasons: [
//       "GPA 3.7 đáp ứng yêu cầu ngành",
//       "Tính cách INTJ rất phù hợp với ngành này",
//       "Điểm mạnh về analytical, technical",
//       "Sở thích trùng khớp: ai-ml, data-science, coding, automation"
//     ],
//     challenges: [
//       "Cần cải thiện kỹ năng: communication"
//     ]
//   },
//   {
//     career: "Backend Developer",
//     matchScore: 0.88,  // 88%
//     reasons: [...],
//     challenges: [...]
//   },
//   {
//     career: "DevOps Engineer",
//     matchScore: 0.81,  // 81%
//     reasons: [...],
//     challenges: [...]
//   }
// ]
