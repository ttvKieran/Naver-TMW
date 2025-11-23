'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { DiagramDetailSelection } from '@/components/RoadmapFlow';

// Dynamically import RoadmapFlow to avoid SSR issues
const RoadmapFlow = dynamic(() => import('@/components/RoadmapFlow'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[800px] bg-white rounded-xl shadow-lg border-2 border-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải flow diagram...</p>
      </div>
    </div>
  ),
});

export default function MyRoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'flow'>('list');
  const [selectedDetail, setSelectedDetail] = useState<DiagramDetailSelection | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.studentId) return;

    const fetchRoadmap = async () => {
      try {
        const res = await fetch(
          `/api/personalized-roadmap?studentId=${session.user.studentId}`,
          { cache: 'no-store' }
        );

        if (res.ok) {
          const data = await res.json();
          setRoadmap(data.roadmap);
        } else {
          setError('Roadmap not found');
        }
      } catch (err) {
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [session]);

  const handleDetailSelect = useCallback((detail: DiagramDetailSelection | null) => {
    setSelectedDetail(detail);
  }, []);

  const findItemTitle = useCallback((itemId: string) => {
    if (!roadmap || !roadmap.stages) return itemId;
    for (const stage of roadmap.stages) {
      for (const area of stage.areas) {
        const item = area.items.find((i: any) => (i.id || i.itemId) === itemId);
        if (item) return item.name || item.title;
      }
    }
    return itemId;
  }, [roadmap]);

  const selectItemById = useCallback((itemId: string) => {
    if (!roadmap || !roadmap.stages) return;
    for (const stage of roadmap.stages) {
      for (const area of stage.areas) {
        const item = area.items.find((i: any) => (i.id || i.itemId) === itemId);
        if (item) {
          // Construct detail object based on item structure
          // This might need adjustment based on your exact data structure
          setSelectedDetail({
            type: 'topic',
            stageId: stage.id,
            areaId: area.id,
            itemId: item.id || item.itemId,
            title: item.name || item.title,
            category: item.itemType || item.category || 'skill',
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

  const handleToggleItem = async (stageIdx: number, areaIdx: number, itemIdx: number) => {
    if (!session?.user?.studentId || !roadmap) return;

    // Update UI optimistically
    const updatedRoadmap = { ...roadmap };
    const stage = updatedRoadmap.stages[stageIdx];
    const area = stage.areas[areaIdx];
    const item = area.items[itemIdx];
    
    const newCheckState = !item.check;
    item.check = newCheckState;
    setRoadmap(updatedRoadmap);

    // Sync with selectedDetail if it's the same item
    if (selectedDetail && 
        selectedDetail.stageId === stage.id && 
        selectedDetail.areaId === area.id && 
        selectedDetail.itemId === (item.id || item.itemId)) {
      setSelectedDetail(prev => prev ? { ...prev, check: newCheckState } : null);
    }

    // Save to database
    try {
      await fetch('/api/roadmap-progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.user.studentId,
          stageIdx,
          areaIdx,
          itemIdx,
          checked: newCheckState,
        }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
      // Revert on error
      item.check = !newCheckState;
      setRoadmap({ ...updatedRoadmap });
      
      // Revert selectedDetail
      if (selectedDetail && 
          selectedDetail.stageId === stage.id && 
          selectedDetail.areaId === area.id && 
          selectedDetail.itemId === (item.id || item.itemId)) {
        setSelectedDetail(prev => prev ? { ...prev, check: !newCheckState } : null);
      }
    }
  };

  const handleMarkAsComplete = () => {
    if (!selectedDetail || !roadmap) return;

    // Find indices
    for (let s = 0; s < roadmap.stages.length; s++) {
      const stage = roadmap.stages[s];
      if (stage.id === selectedDetail.stageId) {
        for (let a = 0; a < stage.areas.length; a++) {
          const area = stage.areas[a];
          if (area.id === selectedDetail.areaId) {
            for (let i = 0; i < area.items.length; i++) {
              const item = area.items[i];
              if ((item.id || item.itemId) === selectedDetail.itemId) {
                handleToggleItem(s, a, i);
                return;
              }
            }
          }
        }
      }
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading your journey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Learning Path</h1>
            <p className="text-muted-foreground mt-1">Track your progress and master new skills</p>
          </div>
          
          {roadmap && (
            <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-card text-xs font-bold text-primary">
                  {roadmap.stages?.length || 0}
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">Stages to complete</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Unable to load roadmap</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Diagram */}
            <div className="lg:col-span-8 bg-card rounded-3xl shadow-sm border border-border p-1 overflow-hidden h-[800px]">
              <RoadmapFlow 
                roadmapData={roadmap} 
                onSelectDetail={handleDetailSelect}
                selectedItemId={selectedDetail?.itemId}
              />
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
                                {selectedDetail.personalization.reason}
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
                            {selectedDetail.requiredSkills.map((req: any, i: number) => (
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
                        <button 
                          onClick={handleMarkAsComplete}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${
                            selectedDetail.check 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {selectedDetail.check ? 'Completed' : 'Mark as Complete'}
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
          </div>
        )}
      </main>
    </div>
  );
}
