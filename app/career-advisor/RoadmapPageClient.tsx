'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RoadmapPageClient() {
  const searchParams = useSearchParams();
  const roadmapId = searchParams.get('roadmapId'); // Personalized roadmap ID
  const careerId = searchParams.get('careerId'); // Base career roadmap ID
  const studentId = searchParams.get('studentId');

  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    if (!roadmapId && !careerId) {
      setError('Roadmap ID or Career ID is required');
      setLoading(false);
      return;
    }

    const fetchRoadmap = async () => {
      try {
        let res, data;
        
        // Fetch personalized roadmap if roadmapId is provided
        if (roadmapId) {
          res = await fetch(`/api/personalized-roadmap/${roadmapId}`);
          data = await res.json();
          
          if (res.ok && data.roadmap) {
            setIsPersonalized(true);
            setRoadmap(data.roadmap);
            // Expand first stage by default
            if (data.roadmap.stages?.[0]) {
              setExpandedStages(new Set([data.roadmap.stages[0].name]));
            }
          } else {
            throw new Error(data.error || 'Failed to fetch personalized roadmap');
          }
        } else {
          // Fallback to base career roadmap
          res = await fetch(`/api/roadmaps?careerId=${careerId}`);
          data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch roadmap');
          }
          
          setRoadmap(data.roadmap);
          if (data.roadmap?.levels?.[0]) {
            setExpandedStages(new Set([data.roadmap.levels[0].levelId]));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roadmapId, careerId]);

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy roadmap'}</p>
          <Link
            href={`/dashboard?id=${studentId || 'STU001'}`}
            className="text-purple-600 hover:underline"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <Link
            href={`/dashboard?id=${studentId || 'STU001'}`}
            className="text-purple-600 hover:underline mb-4 inline-block"
          >
            ← Quay lại Dashboard
          </Link>
          {isPersonalized && (
            <div className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              <span>✨</span>
              Lộ trình cá nhân hóa bởi AI
            </div>
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            {roadmap.careerName || roadmap.title}
          </h1>
          <p className="text-gray-600 text-lg">{roadmap.description}</p>
          
          <div className="mt-6 flex gap-4 text-sm flex-wrap">
            {isPersonalized ? (
              <>
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
                  <span className="font-semibold">Số giai đoạn:</span> {roadmap.stages?.length || 0}
                </div>
                {roadmap.generatedAt && (
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                    <span className="font-semibold">Tạo ngày:</span> {new Date(roadmap.generatedAt).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
                  <span className="font-semibold">Tổng thời gian:</span> {roadmap.totalDuration || 'N/A'}
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                  <span className="font-semibold">Kỹ năng:</span> {roadmap.totalSkills || 0}
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  <span className="font-semibold">Khóa học:</span> {roadmap.totalCourses || 0}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Render personalized roadmap stages */}
          {isPersonalized && roadmap.stages?.map((stage: any, stageIdx: number) => {
            const isExpanded = expandedStages.has(stage.name);
            
            return (
              <div key={stageIdx} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleStage(stage.name)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                        {stageIdx + 1}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{stage.name}</h2>
                        {stage.recommendedSemesters && stage.recommendedSemesters.length > 0 && (
                          <p className="text-gray-600 mt-1">
                            Học kỳ đề xuất: {stage.recommendedSemesters.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {stage.areas?.map((area: any, areaIdx: number) => (
                      <div key={areaIdx} className="mt-4 border-l-4 border-purple-400 pl-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{area.name}</h3>
                        <div className="space-y-3">
                          {area.items?.map((item: any, itemIdx: number) => {
                            const personalization = item.personalization;
                            const statusColors = {
                              already_mastered: 'bg-green-50 border-green-200',
                              review_needed: 'bg-yellow-50 border-yellow-200',
                              new_topic: 'bg-blue-50 border-blue-200',
                            };
                            const priorityBadges = {
                              high_priority: 'bg-red-100 text-red-800',
                              medium_priority: 'bg-yellow-100 text-yellow-800',
                              low_priority: 'bg-gray-100 text-gray-800',
                            };

                            return (
                              <div
                                key={itemIdx}
                                className={`p-4 rounded-lg border-2 ${
                                  personalization?.status ? statusColors[personalization.status as keyof typeof statusColors] : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 flex-1">
                                    {item.check ? '✅ ' : '◻️ '}
                                    {item.title}
                                  </h4>
                                  {personalization?.priority && (
                                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${priorityBadges[personalization.priority as keyof typeof priorityBadges]}`}>
                                      {typeof personalization.priority === 'string' 
                                        ? personalization.priority.replace('_', ' ')
                                        : String(personalization.priority).replace('_', ' ')
                                      }
                                    </span>
                                  )}
                                </div>
                                
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                )}
                                
                                {personalization?.personalizedDescription && (
                                  <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                                    <span className="font-semibold text-purple-900">💡 Lời khuyên AI: </span>
                                    <span className="text-purple-800">{personalization.personalizedDescription}</span>
                                  </div>
                                )}
                                
                                {personalization?.reason && (
                                  <p className="text-xs text-gray-500 mt-2 italic">{personalization.reason}</p>
                                )}
                                
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  {item.estimatedHours > 0 && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      ⏱️ {item.estimatedHours}h
                                    </span>
                                  )}
                                  {item.skillTags?.map((tag: string, tagIdx: number) => (
                                    <span key={tagIdx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render base career roadmap levels */}
          {!isPersonalized && roadmap.levels?.map((level: any) => {
            const isExpanded = expandedStages.has(level.levelId);
            
            return (
              <div key={level.levelId} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleStage(level.levelId)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                        {level.levelNumber}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{level.title}</h2>
                        {level.description && <p className="text-gray-600 mt-1">{level.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-semibold">
                        {level.duration}
                      </span>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {level.goals && level.goals.length > 0 && (
                      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Mục tiêu:</h3>
                        <ul className="space-y-1">
                          {level.goals.map((goal: string, idx: number) => (
                            <li key={idx} className="text-blue-800 flex items-start">
                              <span className="mr-2">✓</span>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      {level.phases?.map((phase: any) => (
                        <div key={phase.phaseId} className="border-l-4 border-purple-400 pl-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {phase.phaseNumber}. {phase.title}
                              </h4>
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {phase.duration}
                              </span>
                            </div>
                            {phase.description && (
                              <p className="text-gray-600 mb-3">{phase.description}</p>
                            )}

                            {phase.skillsToLearn && phase.skillsToLearn.length > 0 && (
                              <div className="mt-3">
                                <h5 className="font-semibold text-gray-900 mb-2">Kỹ năng cần học:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {phase.skillsToLearn.map((skill: any, skillIdx: number) => (
                                    <div
                                      key={skillIdx}
                                      className="bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">
                                          {skill.skillId?.name || 'Skill'}
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                          Target: {skill.targetProficiency}/10
                                        </span>
                                      </div>
                                      {skill.priority && (
                                        <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                                          skill.priority === 'essential'
                                            ? 'bg-red-100 text-red-800'
                                            : skill.priority === 'recommended'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {skill.priority}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {phase.recommendedCourses && phase.recommendedCourses.length > 0 && (
                              <div className="mt-3">
                                <h5 className="font-semibold text-gray-900 mb-2">Khóa học đề xuất:</h5>
                                <div className="space-y-2">
                                  {phase.recommendedCourses.map((course: any, courseIdx: number) => (
                                    <div
                                      key={courseIdx}
                                      className="bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">
                                          {course.courseId?.title || 'Course'}
                                        </span>
                                        {course.isRequired && (
                                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                            Bắt buộc
                                          </span>
                                        )}
                                      </div>
                                      {course.courseId?.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {course.courseId.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {phase.milestones && phase.milestones.length > 0 && (
                              <div className="mt-3">
                                <h5 className="font-semibold text-gray-900 mb-2">Cột mốc quan trọng:</h5>
                                <div className="space-y-2">
                                  {phase.milestones.map((milestone: any, milestoneIdx: number) => (
                                    <div
                                      key={milestoneIdx}
                                      className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg"
                                    >
                                      <div className="font-medium text-gray-900">{milestone.title}</div>
                                      {milestone.description && (
                                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                      )}
                                      {milestone.deliverable && (
                                        <p className="text-sm text-purple-700 mt-1">
                                          Deliverable: {milestone.deliverable}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}