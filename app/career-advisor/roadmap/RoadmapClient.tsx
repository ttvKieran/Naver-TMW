'use client';

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RoadmapFlow, { DiagramDetailSelection } from "@/components/RoadmapFlow";
import type { RoadmapData } from "@/lib/roadmapGraph";

interface RoadmapClientProps {
  career: any;
  roadmap: RoadmapData;
  studentId?: string;
}

export default function RoadmapClient({ career, roadmap, studentId }: RoadmapClientProps) {
  const router = useRouter();
  const [selectedDetail, setSelectedDetail] = useState<DiagramDetailSelection | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!studentId) return;
    
    try {
      setIsRegenerating(true);
      const response = await fetch('/api/regenerate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          careerPath: career.title
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate roadmap');
      }

      // Refresh the page to show new data (if the page logic supports fetching personalized roadmap)
      router.refresh();
    } catch (error) {
      console.error('Error regenerating roadmap:', error);
      alert('Failed to regenerate roadmap. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDetailSelect = useCallback((detail: DiagramDetailSelection | null) => {
    setSelectedDetail(detail);
  }, []);

  const findItemTitle = useCallback((itemId: string) => {
    if (!roadmap) return itemId;
    for (const stage of roadmap) {
      for (const area of stage.areas) {
        const item = area.items.find(i => i.itemId === itemId);
        if (item) return item.title;
      }
    }
    return itemId;
  }, [roadmap]);

  const selectItemById = useCallback((itemId: string) => {
    if (!roadmap) return;
    for (const stage of roadmap) {
      for (const area of stage.areas) {
        const item = area.items.find(i => i.itemId === itemId);
        if (item) {
          setSelectedDetail({
            type: 'topic',
            stageId: stage.stageId,
            areaId: area.areaId,
            itemId: item.itemId,
            title: item.title,
            category: item.category,
            description: item.description,
            skillTags: item.skillTags,
            prerequisites: item.prerequisites,
            requiredSkills: item.requiredSkills,
            estimatedHours: item.estimatedHours,
            personalization: item.personalization,
            check: item.check
          });
          return;
        }
      }
    }
  }, [roadmap]);

  const skills = career.skills || [];
  const certifications = career.certifications || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-primary font-medium inline-flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {career.title} Roadmap
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {studentId && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRegenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Roadmap
                  </>
                )}
              </button>
            )}
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
              {career.duration}
            </span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-bold border border-secondary/20">
              {career.level}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Diagram */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-1 h-[800px]">
            <RoadmapFlow
              roadmapData={roadmap}
              onSelectDetail={handleDetailSelect}
              selectedItemId={selectedDetail?.itemId}
            />
          </div>

          {/* Career Overview Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </span>
                Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Certifications
              </h3>
              <ul className="space-y-2">
                {certifications.map((cert: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div> */}
        </div>

        {/* Right Column: Details Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {selectedDetail ? (
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      selectedDetail.category === 'skill' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      selectedDetail.category === 'project' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      selectedDetail.category === 'course' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selectedDetail.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {selectedDetail.title}
                  </h2>

                  {/* AI Recommendation */}
                  {selectedDetail.personalization && (
                    <div className="mb-6 bg-primary/5 rounded-xl p-4 border border-primary/10">
                      <h4 className="font-bold text-primary text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        AI Recommendation
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">Status:</span>
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${
                            selectedDetail.personalization.status === 'already_mastered' ? 'bg-green-100 text-green-700 border-green-200' :
                            selectedDetail.personalization.status === 'high_priority' ? 'bg-red-100 text-red-700 border-red-200' :
                            selectedDetail.personalization.status === 'medium_priority' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            selectedDetail.personalization.status === 'low_priority' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {selectedDetail.personalization.status?.replace('_', ' ')}
                          </span>
                        </div>
                        {selectedDetail.personalization.reason && (
                          <p className="text-sm text-muted-foreground italic">
                            "{selectedDetail.personalization.reason}"
                          </p>
                        )}
                        {selectedDetail.personalization.description && (
                           <p className="text-sm text-muted-foreground mt-2">
                             {selectedDetail.personalization.description}
                           </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="prose prose-sm text-muted-foreground mb-6">
                    <p>{selectedDetail.description || "No description available."}</p>
                  </div>

                  {/* Skill Tags */}
                  {selectedDetail.skillTags && selectedDetail.skillTags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wide mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDetail.skillTags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium border border-border">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Hours */}
                  {selectedDetail.estimatedHours && (
                    <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>Estimated time: <span className="font-medium text-foreground">{selectedDetail.estimatedHours} hours</span></span>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {selectedDetail.prerequisites && selectedDetail.prerequisites.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wide mb-2">Prerequisites</h4>
                      <ul className="space-y-1">
                        {selectedDetail.prerequisites.map(req => (
                          <li key={req} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <button 
                              onClick={() => selectItemById(req)}
                              className="hover:text-primary hover:underline text-left"
                            >
                              {findItemTitle(req)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Skills */}
                  {selectedDetail.requiredSkills && selectedDetail.requiredSkills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wide mb-2">Required Skills</h4>
                      <ul className="space-y-1">
                        {selectedDetail.requiredSkills.map((req, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {req.tag} (Level {req.min_level})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedDetail.category === 'project' && (
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <h4 className="font-bold text-foreground text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Project Deliverable
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Complete this project to demonstrate your mastery of the concepts in this area.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSelectedDetail(null)}>
                      Close
                    </button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
                      Mark as Complete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card/50 rounded-2xl border border-dashed border-border p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Interactive Roadmap</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any item in the roadmap to view details, resources, and track your progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
