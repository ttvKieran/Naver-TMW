'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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

  const handleToggleItem = async (stageIdx: number, areaIdx: number, itemIdx: number) => {
    if (!session?.user?.studentId || !roadmap) return;

    // Update UI optimistically
    const updatedRoadmap = { ...roadmap };
    const item = updatedRoadmap.stages[stageIdx].areas[areaIdx].items[itemIdx];
    item.check = !item.check;
    setRoadmap(updatedRoadmap);

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
          checked: item.check,
        }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
      // Revert on error
      item.check = !item.check;
      setRoadmap({ ...updatedRoadmap });
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
          <div className="bg-card rounded-3xl shadow-sm border border-border p-1 overflow-hidden h-[800px]">
            <RoadmapFlow roadmapData={roadmap} />
          </div>
        )}
      </main>
    </div>
  );
}
