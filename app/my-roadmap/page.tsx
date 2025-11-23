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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải roadmap...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!roadmap || error ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <span className="text-4xl">📋</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Chưa có roadmap cá nhân hóa
            </h1>
            <p className="text-gray-600 mb-8">
              Roadmap sẽ được tạo tự động sau khi bạn hoàn tất đăng ký và cập nhật profile
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-semibold"
            >
              Cập nhật Profile →
            </Link>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <span>✨</span>
                    Lộ trình cá nhân hóa bởi AI
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    {roadmap.careerName}
                  </h1>
                  <p className="text-gray-600 text-lg">{roadmap.description}</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-purple-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📋 Danh sách
                  </button>
                  <button
                    onClick={() => setViewMode('flow')}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      viewMode === 'flow'
                        ? 'bg-white text-purple-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🎨 Flow Diagram
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-4 text-sm flex-wrap">
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold">
                  {roadmap.stages?.length || 0} giai đoạn
                </div>
                {(() => {
                  const totalItems = roadmap.stages?.reduce((sum: number, stage: any) => 
                    sum + stage.areas?.reduce((areaSum: number, area: any) => 
                      areaSum + (area.items?.length || 0), 0
                    ), 0
                  ) || 0;
                  const completedItems = roadmap.stages?.reduce((sum: number, stage: any) => 
                    sum + stage.areas?.reduce((areaSum: number, area: any) => 
                      areaSum + (area.items?.filter((item: any) => item.check).length || 0), 0
                    ), 0
                  ) || 0;
                  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                  
                  return (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                      ✓ {completedItems}/{totalItems} hoàn thành ({percentage}%)
                    </div>
                  );
                })()}
                {roadmap.generatedAt && (
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                    {new Date(roadmap.generatedAt).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            </div>

            {/* Conditional Rendering based on View Mode */}
            {viewMode === 'flow' ? (
              <RoadmapFlow roadmap={roadmap} onToggleItem={handleToggleItem} />
            ) : (
              /* Stages - List View */
              <div className="space-y-4">
              {roadmap.stages?.map((stage: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{stage.name}</h2>
                      {stage.recommendedSemesters && stage.recommendedSemesters.length > 0 && (
                        <p className="text-gray-600">
                          Học kỳ đề xuất: {stage.recommendedSemesters.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Areas */}
                  <div className="space-y-4 ml-16">
                    {stage.areas?.map((area: any, areaIdx: number) => (
                      <div key={areaIdx} className="border-l-4 border-purple-400 pl-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{area.name}</h3>
                        <div className="grid gap-3">
                          {area.items?.map((item: any, itemIdx: number) => {
                            const statusColors = {
                              already_mastered: 'bg-green-50 border-green-300',
                              review_needed: 'bg-yellow-50 border-yellow-300',
                              new_topic: 'bg-blue-50 border-blue-300',
                            };
                            const status = item.personalization?.status || 'new_topic';

                            return (
                              <div
                                key={itemIdx}
                                className={`p-4 rounded-lg border-2 ${statusColors[status as keyof typeof statusColors]} transition-all`}
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={item.check || false}
                                    onChange={() => handleToggleItem(idx, areaIdx, itemIdx)}
                                    className="w-5 h-5 mt-0.5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer flex-shrink-0"
                                  />
                                  <div className="flex-1 flex items-start justify-between">
                                    <h4 className={`font-semibold ${item.check ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                      {item.title}
                                    </h4>
                                    {item.estimatedHours > 0 && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2 flex-shrink-0">
                                        ⏱️ {item.estimatedHours}h
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                )}
                                {item.personalization?.personalizedDescription && (
                                  <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                                    <span className="font-semibold text-purple-900">💡 AI: </span>
                                    <span className="text-purple-800">
                                      {item.personalization.personalizedDescription}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
