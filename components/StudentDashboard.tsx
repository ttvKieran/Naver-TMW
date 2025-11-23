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

function SkillsRadarChart({ title, skills, colorClass, strokeColor }: { title: string, skills: Record<string, number>, colorClass: string, strokeColor: string }) {
    const [hoveredSkill, setHoveredSkill] = useState<{ name: string, value: number } | null>(null);
    
    const skillsArray = Object.entries(skills).map(([name, value]) => ({
        name: name.replace(/([A-Z])/g, ' $1').trim(),
        value,
    }));

    if (skillsArray.length < 3) {
        return (
             <div className="mb-6">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">{title}</h4>
                <div className="space-y-3">
                    {skillsArray.map((skill) => (
                        <div key={skill.name}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-foreground capitalize">{skill.name}</span>
                                <span className={`text-xs font-bold ${colorClass.replace('bg-', 'text-')}`}>{skill.value}/10</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                    className={`${colorClass} h-2 rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${(skill.value / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const size = 380;
    const center = size / 2;
    const maxRadius = 100;
    const levels = 5;
    const angleStep = (2 * Math.PI) / skillsArray.length;

    const points = skillsArray.map((skill, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const radius = (skill.value / 10) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const gridPoints = Array.from({ length: levels }, (_, levelIndex) => {
        const radius = ((levelIndex + 1) / levels) * maxRadius;
        return skillsArray.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
    });

    return (
        <div className="flex flex-col items-center relative w-full">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</h4>
            <div className="relative w-full flex justify-center">
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-[380px] overflow-visible">
                    {gridPoints.map((gridPoint, index) => (
                        <polygon key={index} points={gridPoint} fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                    {skillsArray.map((_, index) => {
                        const angle = index * angleStep - Math.PI / 2;
                        const x = center + maxRadius * Math.cos(angle);
                        const y = center + maxRadius * Math.sin(angle);
                        return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
                    })}
                    <polygon points={points} fill={strokeColor} fillOpacity="0.2" stroke={strokeColor} strokeWidth="2" />
                    {skillsArray.map((skill, index) => {
                        const angle = index * angleStep - Math.PI / 2;
                        const radius = (skill.value / 10) * maxRadius;
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        
                        // Improved label positioning
                        const labelRadius = maxRadius + 30;
                        const labelX = center + labelRadius * Math.cos(angle);
                        const labelY = center + labelRadius * Math.sin(angle);

                        let textAnchor: "middle" | "start" | "end" = "middle";
                        if (Math.cos(angle) > 0.1) textAnchor = "start";
                        else if (Math.cos(angle) < -0.1) textAnchor = "end";

                        // Adjust Y slightly for top/bottom labels
                        let dy = 0;
                        if (Math.abs(Math.sin(angle)) > 0.9) {
                            dy = Math.sin(angle) > 0 ? 10 : -5;
                        }

                        return (
                            <g key={index} 
                               onMouseEnter={() => setHoveredSkill({ name: skill.name, value: skill.value })}
                               onMouseLeave={() => setHoveredSkill(null)}
                               className="cursor-pointer"
                            >
                                <circle cx={x} cy={y} r="4" fill={strokeColor} className="hover:r-6 transition-all" />
                                <text 
                                    x={labelX} 
                                    y={labelY + dy} 
                                    textAnchor={textAnchor} 
                                    dominantBaseline="middle" 
                                    className="text-[10px] fill-muted-foreground uppercase font-medium"
                                >
                                    {skill.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                
                {/* Center Overlay Tooltip */}
                {hoveredSkill && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-card/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl border border-border/50 text-center z-10 animate-in fade-in zoom-in duration-200">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{hoveredSkill.name}</div>
                            <div className="text-2xl font-bold text-foreground leading-none">
                                {hoveredSkill.value}<span className="text-sm text-muted-foreground font-medium">/10</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SkillsChart({ technical, general }: { technical: Record<string, number>, general: Record<string, number> }) {
    return (
        <div className="space-y-6">
            <SkillsRadarChart 
                title="Technical Skills" 
                skills={technical} 
                colorClass="bg-primary" 
                strokeColor="var(--primary)" 
            />
            <SkillsRadarChart 
                title="General Skills" 
                skills={general} 
                colorClass="bg-secondary" 
                strokeColor="var(--secondary)" 
            />
        </div>
    );
}

function CourseScoreBarChart({ courses }: { courses: any[] }) {
    const [hoveredCourse, setHoveredCourse] = useState<any>(null);
    const height = 200;
    const width = 340;
    const padding = { top: 20, right: 0, bottom: 40, left: 20 };
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = width - padding.left - padding.right;
    
    const barWidth = Math.min(40, chartWidth / courses.length * 0.6);
    const gap = (chartWidth - (barWidth * courses.length)) / (courses.length + 1);

    return (
        <div className="w-full overflow-x-auto">
             <div className="min-w-[300px] relative flex justify-center">
                <svg width={width} height={height} className="overflow-visible">
                    {[0, 2.5, 5, 7.5, 10].map((score) => {
                        const y = padding.top + chartHeight - (score / 10) * chartHeight;
                        return (
                            <g key={score}>
                                <line 
                                    x1={padding.left} 
                                    y1={y} 
                                    x2={width - padding.right} 
                                    y2={y} 
                                    stroke="var(--border)" 
                                    strokeWidth="1" 
                                    strokeDasharray="4 4" 
                                />
                                <text 
                                    x={padding.left - 10} 
                                    y={y} 
                                    textAnchor="end" 
                                    dominantBaseline="middle" 
                                    className="text-[10px] fill-muted-foreground"
                                >
                                    {score}
                                </text>
                            </g>
                        );
                    })}
                    {courses.map((course: any, index: number) => {
                        const x = padding.left + gap + index * (barWidth + gap);
                        const barHeight = (course.grade / 10) * chartHeight;
                        const y = padding.top + chartHeight - barHeight;
                        
                        return (
                            <g key={index}
                               onMouseEnter={() => setHoveredCourse({ ...course, x: x + barWidth/2, y })}
                               onMouseLeave={() => setHoveredCourse(null)}
                            >
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="var(--primary)"
                                    rx="4"
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                                <text
                                    x={x + barWidth / 2}
                                    y={height - 10}
                                    textAnchor="middle"
                                    className="text-[10px] fill-muted-foreground"
                                >
                                    {course.code}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {hoveredCourse && (
                    <div 
                        className="absolute bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border border-border text-xs z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{ left: hoveredCourse.x, top: hoveredCourse.y - 10, display: 'block' }}
                    >
                        <div className="font-bold">{hoveredCourse.name}</div>
                        <div>Grade: {hoveredCourse.grade}</div>
                    </div>
                )}
             </div>
        </div>
    );
}

function AcademicHistory({ academic }: { academic: any }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-muted-foreground">Current Semester</div>
                    <div className="text-2xl font-bold text-foreground">{academic.currentSemester}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">GPA</div>
                    <div className="text-2xl font-bold text-primary">{academic.gpa.toFixed(2)}</div>
                </div>
            </div>

            <CourseScoreBarChart courses={academic.courses} />

            {/* <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3 text-right">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {academic.courses.map((course: any, i: number) => (
                            <tr key={i} className="bg-card hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-foreground">{course.name}</div>
                                    <div className="text-xs text-muted-foreground">{course.code}</div>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-foreground">
                                    {course.grade}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> */}
        </div>
    );
}

function ProjectsList({ projects }: { projects: string[] }) {
    if (!projects || projects.length === 0) return null;
    return (
        <div className="space-y-3">
            {projects.map((project, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">{project}</p>
                    </div>
                </div>
            ))}
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
        if (student.career?.actualCareer && !selectedCareerId) {
            setSelectedCareerId(student.career.actualCareer);
        }
    }, [student.career?.actualCareer, selectedCareerId]);

    // Calculate predictions whenever student data changes
    const predictions = useMemo(() => {
        // Mock prediction logic or adapt existing one
        // Since we removed personality, we might need to adjust predictCareers or just mock it for now
        // For now, let's just return empty or mock predictions if predictCareers fails
        try {
             const profileForPrediction = {
                ...student,
                // Mock personality for compatibility if needed by the function
                personality: { mbti: 'INTJ', traits: { analytical: 8 } } 
            };
            return predictCareers(profileForPrediction);
        } catch (e) {
            return [];
        }
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
                            <h2 className="text-4xl font-bold text-foreground tracking-tight">{student.fullName}</h2>
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
                        <p className="text-muted-foreground font-medium font-mono text-sm">ID: {student.studentCode}</p>

                        <div className="flex flex-wrap gap-3 mt-4">
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
                                Target: {student.career?.actualCareer || 'Undecided'}
                            </span>
                            {student.availability?.timePerWeekHours > 0 && (
                                <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-bold border border-secondary/20">
                                    Available: {student.availability.timePerWeekHours}h/week
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-muted/50 px-8 py-6 rounded-2xl border border-border backdrop-blur-sm">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">GPA</div>
                            <div className="text-4xl font-bold text-primary">{student.academic?.gpa?.toFixed(2) || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/20 transition-colors">
                        <h3 className="text-xl font-bold text-foreground mb-6">Skill Set</h3>
                        <SkillsChart technical={student.skills?.technical || {}} general={student.skills?.general || {}} />
                    </div>

                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/20 transition-colors">
                        <h3 className="text-xl font-bold text-foreground mb-6">Academic History</h3>
                        <AcademicHistory academic={student.academic} />
                    </div>

                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/20 transition-colors">
                        <h3 className="text-xl font-bold text-foreground mb-4">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {student.interests?.map((interest: string) => (
                                <span key={interest} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all cursor-default">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Career & Roadmap */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Projects Section */}
                    {student.projects && student.projects.length > 0 && (
                        <div className="bg-card rounded-3xl shadow-sm border border-border p-6">
                            <h3 className="text-xl font-bold text-foreground mb-4">Projects</h3>
                            <ProjectsList projects={student.projects} />
                        </div>
                    )}

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