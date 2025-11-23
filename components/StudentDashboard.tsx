'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Skill {
  name: string;
  value: number;
}

interface PersonalityTrait {
  name: string;
  value: number;
}

interface StudentDashboardProps {
  student: {
    id: string;
    name: string;
    actualCareer: string;
    predictedCareer?: string; // AI predicted career
    targetConfidence?: number; // Confidence score
    aiCareerRecommendation?: string; // HCX-007 recommendation
    gpa: number;
    currentSemester?: number;
    university: String;
    major: String;
    personality: {
      mbti: string;
      traits: {
        analytical: number;
        creative: number;
        teamwork: number;
        leadership: number;
        technical: number;
      };
    };
    skills: Record<string, number>;
    interests: string[];
    itSkills?: string[]; // IT skills from registration
    softSkills?: string[]; // Soft skills from registration
  };
  hotCareers: Array<{
    id: string;
    title: string;
    description: string;
    overview: {
      salary_range: string;
      job_growth: string;
      difficulty: string;
      time_to_proficiency: string;
    };
  }>;
  currentRoadmap?: {
    _id?: string; // Roadmap ID for link
    careerName: string;
    description?: string;
    generatedAt?: string;
    stagesCount: number;
  };
  currentCareerId?: string | null;
}

// biểu đồ kỹ năng
function SkillsChart({ skills }: { skills: Record<string, number> }) {
  const skillsArray = Object.entries(skills).map(([name, value]) => ({
    name: name.replace(/([A-Z])/g, ' $1').trim(),
    value,
  }));

  return (
    <div className="space-y-4">
      {skillsArray.map((skill) => (
        <div key={skill.name}>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-foreground capitalize">
              {skill.name}
            </span>
            <span className="text-sm text-muted-foreground">{skill.value}/10</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(skill.value / 10) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// biểu đồ tính cách
function PersonalityRadar({ traits }: { traits: Record<string, number> }) {
  const traitsArray = Object.entries(traits).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const size = 200;
  const center = size / 2;
  const maxRadius = 80;
  const levels = 5;

  // Tính toán điểm cho polygon
  const angleStep = (2 * Math.PI) / traitsArray.length;
  const points = traitsArray.map((trait, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const radius = (trait.value / 10) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Tính toán điểm cho các đường lưới
  const gridPoints = Array.from({ length: levels }, (_, levelIndex) => {
    const radius = ((levelIndex + 1) / levels) * maxRadius;
    return traitsArray.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-4 overflow-visible">
        {/* Grid levels */}
        {gridPoints.map((gridPoint, index) => (
          <polygon
            key={index}
            points={gridPoint}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {traitsArray.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="currentColor"
          stroke="currentColor"
          className="text-primary/20 stroke-primary"
          strokeWidth="2"
        />

        {/* Data points */}
        {traitsArray.map((trait, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const radius = (trait.value / 10) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              className="fill-primary"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {traitsArray.map((trait) => (
          <div key={trait.name} className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground">{trait.name}:</span>
            <span className="font-bold text-primary">{trait.value}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboard({ student, hotCareers, currentRoadmap, currentCareerId }: StudentDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome back, {student.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your learning journey today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/career-advisor"
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span>✨</span> AI Career Advisor
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Stats */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
                  <p className="text-sm text-muted-foreground">{student.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">GPA</span>
                  <span className="font-bold text-foreground">{student.gpa}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">Major</span>
                  <span className="font-bold text-foreground text-right text-sm">{student.major}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">Semester</span>
                  <span className="font-bold text-foreground">{student.currentSemester || 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personality Radar */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🧠</span>
              Personality Profile
            </h3>
            <PersonalityRadar traits={student.personality.traits} />
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-bold">
                MBTI: {student.personality.mbti}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column: Career & Roadmap */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Goal */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-white/80 font-medium mb-1">Current Target Career</p>
                  <h2 className="text-3xl font-bold">{student.actualCareer}</h2>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="font-bold">{student.targetConfidence || 85}% Match</span>
                </div>
              </div>

              {currentRoadmap ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Active Roadmap</h3>
                    <Link 
                      href="/my-roadmap"
                      className="text-sm font-bold hover:text-white/80 transition-colors flex items-center gap-1"
                    >
                      View Details →
                    </Link>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-black/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full w-1/3"></div>
                    </div>
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <p className="mt-4 text-sm text-white/80 line-clamp-2">
                    {currentRoadmap.description}
                  </p>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                  <p className="mb-4">You haven't started a roadmap yet.</p>
                  <Link 
                    href="/career-advisor"
                    className="inline-block px-6 py-2 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-colors"
                  >
                    Create Roadmap
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📊</span>
              Skills Analysis
            </h3>
            <SkillsChart skills={student.skills} />
          </div>

          {/* AI Recommendation */}
          {student.aiCareerRecommendation && (
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">🤖</span>
                AI Recommendation
              </h3>
              <div className="bg-muted/30 rounded-xl p-4">
                <ReactMarkdown className="prose prose-sm max-w-none text-muted-foreground">
                  {student.aiCareerRecommendation}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hot Careers Section */}
      <div className="pt-8 border-t border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Trending Careers</h2>
          <Link href="/career-advisor" className="text-primary font-bold hover:underline">
            Explore All →
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotCareers.map((career) => (
            <Link 
              href={`/career-advisor/results?careerId=${career.id}`}
              key={career.id}
              className="group bg-card hover:bg-accent/5 border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-md flex flex-col h-full"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {career.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {career.description}
                </p>
              </div>
              
              <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-medium text-foreground">{career.overview.salary_range}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-medium text-green-600">{career.overview.job_growth}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}