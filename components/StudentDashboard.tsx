'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ProfileEditor from './ProfileEditor';
import { predictCareers } from '@/lib/career-matching';

// Dynamically import ReactFlow component to avoid SSR issues
const RoadmapFlow = dynamic(() => import('./RoadmapFlow'), { ssr: false });

interface StudentDashboardProps {
    initialStudent: any;
    hotCareers: any[];
    allRoadmaps: any[];
}

// Reuse the existing chart components
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
                        <span className="text-sm font-bold text-foreground capitalize">
                            {skill.name}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">{skill.value}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(skill.value / 10) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function PersonalityRadar({ traits }: { traits: Record<string, number> }) {
    const traitsArray = Object.entries(traits).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
    }));

    const size = 200;
    const center = size / 2;
    const maxRadius = 80;
    const levels = 5;
    const angleStep = (2 * Math.PI) / traitsArray.length;

    const points = traitsArray.map((trait, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const radius = (trait.value / 10) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

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
                {gridPoints.map((gridPoint, index) => (
                    <polygon key={index} points={gridPoint} fill="none" stroke="var(--border)" strokeWidth="1" />
                ))}
                {traitsArray.map((_, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const x = center + maxRadius * Math.cos(angle);
                    const y = center + maxRadius * Math.sin(angle);
                    return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
                })}
                <polygon points={points} fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeWidth="2" />
                {traitsArray.map((trait, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const radius = (trait.value / 10) * maxRadius;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return <circle key={index} cx={x} cy={y} r="4" fill="var(--primary)" />;
                })}
            </svg>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {traitsArray.map((trait) => (
                    <div key={trait.name} className="flex justify-between items-center min-w-[100px]">
                        <span className="text-muted-foreground">{trait.name}</span>
                        <span className="font-bold text-primary ml-2">{trait.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StudentDashboard({
    initialStudent,
    hotCareers,
    allRoadmaps
}: StudentDashboardProps) {
    const [student, setStudent] = useState(initialStudent);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

    // Initialize selected career from student's actual career
    useEffect(() => {
        if (student.actualCareer && !selectedCareerId) {
            setSelectedCareerId(student.actualCareer);
        }
    }, [student.actualCareer, selectedCareerId]);

    // Calculate predictions whenever student data changes
    const predictions = useMemo(() => {
        const profileForPrediction = {
            ...student,
            mbti: student.personality.mbti,
            traits: student.personality.traits
        };
        return predictCareers(profileForPrediction);
    }, [student]);

    // Get current roadmap based on selected career
    const currentRoadmap = useMemo(() => {
        if (!selectedCareerId) return null;
        return allRoadmaps.find(
            (career: any) =>
                career.title.toLowerCase() === selectedCareerId.toLowerCase() ||
                career.id === selectedCareerId.toLowerCase().replace(/\s+/g, '-')
        );
    }, [selectedCareerId, allRoadmaps]);

    const handleProfileUpdate = (newData: any) => {
        setStudent(newData);
    };

    return (
        <div className="space-y-8">
            {isEditing && (
                <ProfileEditor
                    initialData={student}
                    onUpdate={handleProfileUpdate}
                    onClose={() => setIsEditing(false)}
                />
            )}

            {/* Header Card */}
            <div className="bg-card rounded-3xl shadow-sm border border-border p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 group-hover:opacity-80 transition-opacity duration-500"></div>

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-4xl font-bold text-foreground tracking-tight">{student.name}</h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/5"
                                title="Edit Profile"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-muted-foreground font-medium font-mono text-sm">ID: {student.id}</p>

                        <div className="flex flex-wrap gap-3 mt-4">
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                                MBTI: {student.personality.mbti}
                            </span>
                            <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-bold border border-secondary/20">
                                Target: {student.actualCareer}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-muted/50 px-8 py-6 rounded-2xl border border-border backdrop-blur-sm">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">GPA</div>
                            <div className="text-4xl font-bold text-primary">{student.gpa.toFixed(1)}</div>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Skills Avg</div>
                            <div className="text-4xl font-bold text-secondary">
                                {(Object.values(student.skills).reduce((a: any, b: any) => a + b, 0) as number / 5).toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/20 transition-colors">
                        <h3 className="text-xl font-bold text-foreground mb-6">Skill Set</h3>
                        <SkillsChart skills={student.skills} />
                    </div>

                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/20 transition-colors">
                        <h3 className="text-xl font-bold text-foreground mb-6">Personality Profile</h3>
                        <PersonalityRadar traits={student.personality.traits} />
                    </div>

                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/20 transition-colors">
                        <h3 className="text-xl font-bold text-foreground mb-4">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {student.interests.map((interest: string) => (
                                <span key={interest} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all cursor-default">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Career & Roadmap */}
                <div className="lg:col-span-8 space-y-8">
                    {/* AI Career Predictions */}
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-50 -mr-8 -mt-8"></div>
                        <div className="flex items-center justify-between mb-6 relative">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <span className="text-2xl">✨</span> AI Career Matches
                            </h3>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                Based on your profile
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            {predictions.slice(0, 4).map((pred: any) => (
                                <button
                                    key={pred.career}
                                    onClick={() => setSelectedCareerId(pred.career)}
                                    className={`text-left p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${selectedCareerId === pred.career
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'border-border hover:border-primary/50 bg-card'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-foreground">{pred.career}</h4>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${pred.matchScore >= 0.8 ? 'bg-green-100 text-green-700' :
                                            pred.matchScore >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {Math.round(pred.matchScore * 100)}% Match
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                                        {pred.reasons[0]}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Roadmap */}
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground">Learning Roadmap</h3>
                            {currentRoadmap && (
                                <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                    {currentRoadmap.title}
                                </span>
                            )}
                        </div>

                        <RoadmapFlow roadmapData={currentRoadmap} />
                    </div>
                </div>
            </div>
        </div>
    );
}
