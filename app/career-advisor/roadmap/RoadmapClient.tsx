'use client';

import { useCallback, useState } from "react";
import Link from "next/link";
import CareerRoadmapDiagram, { DiagramDetailSelection } from "@/components/CareerRoadmapDiagram";
import type { RoadmapPhases } from "@/lib/roadmapGraph";

interface RoadmapClientProps {
  career: any;
  roadmap: RoadmapPhases;
}

export default function RoadmapClient({ career, roadmap }: RoadmapClientProps) {
  const [expandedPhase, setExpandedPhase] = useState<string>('phase1');
  const [selectedDetail, setSelectedDetail] = useState<null | {
    kind: 'learning_path' | 'goal' | 'milestone';
    phaseTitle: string;
    title: string;
    subtitle?: string;
    resources?: string[];
    projects?: string[];
    milestone?: string | null;
  }>(null);

  const handlePhaseSelect = useCallback((phaseKey: string | null) => {
    if (!phaseKey) {
      setExpandedPhase('');
      setSelectedDetail(null);
      return;
    }
    setExpandedPhase(phaseKey);
    setSelectedDetail(null);
  }, []);

  const handleDetailSelect = useCallback((detail: DiagramDetailSelection | null) => {
    if (!detail) {
      setSelectedDetail(null);
      return;
    }

    if (!roadmap) return;
    const phase = roadmap[detail.phaseKey];
    if (!phase) return;

    if (detail.type === 'topic') {
      if (detail.source === 'learning_path' && phase.learning_path) {
        const entry = phase.learning_path[detail.topicIndex];
        if (!entry) return;
        setSelectedDetail({
          kind: 'learning_path',
          phaseTitle: phase.title,
          title: entry.topic,
          subtitle: `Week ${entry.week}`,
          resources: entry.resources,
          projects: entry.projects,
          milestone: detail.milestone,
        });
      } else {
        const goal = phase.goals[detail.topicIndex];
        if (!goal) return;
        setSelectedDetail({
          kind: 'goal',
          phaseTitle: phase.title,
          title: goal,
          milestone: detail.milestone,
        });
      }
      return;
    }
  }, [roadmap]);

  const skills = career.skills || (career.required_skills ? [...(career.required_skills.technical || []), ...(career.required_skills.soft_skills || [])] : []);
  const certifications = career.certifications || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/career-advisor/results"
              className="text-muted-foreground hover:text-primary font-medium inline-flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Results
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {career.title} Roadmap
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
              {career.duration}
            </span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-bold border border-secondary/20">
              {career.level}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Interactive Diagram */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm h-full">
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">🗺️</span>
                Interactive Roadmap
              </h2>
              <div className="h-[800px] w-full bg-background/50 rounded-2xl border border-border/50 overflow-hidden relative">
                <CareerRoadmapDiagram
                  phases={roadmap}
                  onSelectPhase={handlePhaseSelect}
                  onSelectDetail={handleDetailSelect}
                />
                <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground shadow-sm">
                  Click nodes to view details
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {selectedDetail ? (
                <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/5 ring-1 ring-primary/10 animate-in slide-in-from-right-4 duration-300">
                  <div className="mb-4 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider">
                        {selectedDetail.phaseTitle}
                      </div>
                      <button 
                        onClick={() => setSelectedDetail(null)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {selectedDetail.title}
                    </h3>
                    {selectedDetail.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {selectedDetail.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    {selectedDetail.milestone && (
                      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-foreground p-5 rounded-xl border border-purple-500/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
                        <div className="flex items-start gap-3 relative z-10">
                          <span className="text-2xl">🚩</span>
                          <div>
                            <strong className="block text-purple-700 dark:text-purple-400 text-sm uppercase tracking-wide mb-1">Milestone Reached</strong>
                            <p className="text-sm font-medium leading-relaxed">
                              {selectedDetail.milestone}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDetail.resources && selectedDetail.resources.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Learning Resources
                        </h4>
                        <ul className="space-y-2">
                          {selectedDetail.resources.map((resource, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedDetail.projects && selectedDetail.projects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Hands-on Projects
                        </h4>
                        <ul className="space-y-2">
                          {selectedDetail.projects.map((project, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50 hover:border-secondary/30 transition-colors">
                              {project}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedDetail.kind === 'goal' && (
                      <div className="bg-green-500/10 text-green-700 p-4 rounded-xl border border-green-500/20 text-sm">
                        <strong>Goal:</strong> This is a key learning objective for this phase. Focus on mastering the concepts.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {/* Skills Section */}
                  <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                      <span className="text-primary">🛠️</span> Key Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-sm font-medium border border-border hover:border-primary/30 transition-colors">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                      <span className="text-secondary">🏆</span> Certifications
                    </h3>
                    <ul className="space-y-2">
                      {certifications.map((cert: string) => (
                        <li key={cert} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <svg className="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="flex-1">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Top Companies */}
                  <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                      <span className="text-green-500">🏢</span> Top Employers
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {career.companies?.map((company: string) => (
                        <span key={company} className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-bold text-foreground shadow-sm">
                          {company}
                        </span>
                      )) || <span className="text-muted-foreground text-sm">Information not available</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}