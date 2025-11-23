'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

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
    university: string;
    major: string;
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
    skills: {
      technical: Record<string, number>;
      general: Record<string, number>;
    };
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
function SkillsChart({ technical = {}, general = {} }: { technical?: Record<string, number>, general?: Record<string, number> }) {
  const technicalSkills = Object.keys(technical);
  const generalSkills = Object.keys(general);

  return (
    <div className="space-y-6">
      {technicalSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Technical Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {technicalSkills.map((skill) => (
              <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {generalSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Soft Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {generalSkills.map((skill) => (
              <span key={skill} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100 hover:bg-purple-100 transition-colors cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {technicalSkills.length === 0 && generalSkills.length === 0 && (
        <p className="text-muted-foreground text-sm italic">No skills listed yet.</p>
      )}
    </div>
  );
}

export default function StudentDashboard({ student, hotCareers, currentRoadmap }: StudentDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome back, {student.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your learning journey today.
          </p>
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

          {/* Skills Analysis - Moved to Left Column since Personality is gone */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">📊</span>
              Skills Profile
            </h3>
            <SkillsChart technical={student.skills.technical} general={student.skills.general} />
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
                  <span className="font-bold">{student.targetConfidence ? student.targetConfidence * 100 : 85}% Match</span>
                </div>
              </div>

              {currentRoadmap ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">{currentRoadmap.careerName}</h3>
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
                  <p className="mb-4">You haven&apos;t started a roadmap yet.</p>
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
          {/* <Link href="/career-advisor" className="text-primary font-bold hover:underline">
            Explore All →
          </Link> */}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotCareers.map((career) => (
            <Link 
              href={`/career-advisor/roadmap?career=${encodeURIComponent(career.title)}`}
              key={career.id}
              className="group bg-card hover:bg-accent/5 border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-md flex flex-col h-full"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {career.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {career.description}
                </p>
              </div>
              
              {/* <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-medium text-foreground">{career.overview.salary_range}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-medium text-green-600">{career.overview.job_growth}</span>
                </div>
              </div> */}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}