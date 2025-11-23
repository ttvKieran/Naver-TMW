'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoadmapViewerProps {
  student: {
    _id: string;
    fullName: string;
    studentCode: string;
    email: string;
    careerGoals?: string;
    aiCareerRecommendation?: string;
  };
  roadmap: {
    careerID: string;
    careerName: string;
    description?: string;
    generatedAt: string;
    stages: Array<{
      id: string;
      name: string;
      description?: string;
      orderIndex: number;
      recommendedSemesters?: number[];
      areas: Array<{
        id: string;
        name: string;
        description?: string;
        items: Array<{
          id: string;
          name: string;
          description?: string;
          check?: boolean;
          personalization?: {
            status: string;
            priority: number;
            personalizedDescription?: string;
            reason?: string;
          };
        }>;
      }>;
    }>;
  };
}

export default function RoadmapViewer({ student, roadmap }: RoadmapViewerProps) {
  const router = useRouter();
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const toggleArea = (areaId: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaId)) {
      newExpanded.delete(areaId);
    } else {
      newExpanded.add(areaId);
    }
    setExpandedAreas(newExpanded);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'already_mastered':
        return <span className="text-green-600 font-bold">✓</span>;
      case 'high_priority':
        return <span className="text-red-600 font-bold">🔥</span>;
      case 'medium_priority':
        return <span className="text-orange-500 font-bold">⭐</span>;
      case 'low_priority':
        return <span className="text-gray-500">•</span>;
      case 'optional':
        return <span className="text-gray-400">○</span>;
      default:
        return <span className="text-gray-300">-</span>;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'already_mastered':
        return 'bg-green-50 border-green-200';
      case 'high_priority':
        return 'bg-red-50 border-red-200';
      case 'medium_priority':
        return 'bg-orange-50 border-orange-200';
      case 'low_priority':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {roadmap.careerName}
          </h1>
          <p className="text-gray-600 mb-4">{roadmap.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👤 {student.fullName}</span>
            <span>📅 Generated: {new Date(roadmap.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* AI Career Recommendation */}
      {student.aiCareerRecommendation && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🤖</span> AI Career Recommendation
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {student.aiCareerRecommendation}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Personalization Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span className="text-gray-700">Already Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold">🔥</span>
            <span className="text-gray-700">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold">⭐</span>
            <span className="text-gray-700">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">•</span>
            <span className="text-gray-700">Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">○</span>
            <span className="text-gray-700">Optional</span>
          </div>
        </div>
      </div>

      {/* Roadmap Stages */}
      <div className="space-y-6">
        {roadmap.stages
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((stage) => (
            <div key={stage.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(stage.id)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between hover:from-blue-700 hover:to-blue-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{stage.orderIndex}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">{stage.name}</h3>
                    {stage.description && (
                      <p className="text-sm text-blue-100 mt-1">{stage.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-2xl">
                  {expandedStages.has(stage.id) ? '▼' : '▶'}
                </span>
              </button>

              {/* Stage Content */}
              {expandedStages.has(stage.id) && (
                <div className="p-6 space-y-4">
                  {stage.areas.map((area) => (
                    <div key={area.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Area Header */}
                      <button
                        onClick={() => toggleArea(area.id)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">{area.name}</h4>
                          {area.description && (
                            <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                          )}
                        </div>
                        <span className="text-gray-600">
                          {expandedAreas.has(area.id) ? '▼' : '▶'}
                        </span>
                      </button>

                      {/* Area Items */}
                      {expandedAreas.has(area.id) && (
                        <div className="p-4 space-y-2">
                          {area.items.map((item) => (
                            <div
                              key={item.id}
                              className={`p-4 rounded-lg border ${getStatusColor(
                                item.personalization?.status
                              )}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getStatusIcon(item.personalization?.status)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                                    {item.check && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Completed
                                      </span>
                                    )}
                                  </div>
                                  
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}

                                  {item.personalization?.personalizedDescription && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                      <p className="text-sm text-blue-900 font-medium mb-1">
                                        💡 For you:
                                      </p>
                                      <p className="text-sm text-blue-800">
                                        {item.personalization.personalizedDescription}
                                      </p>
                                      {item.personalization.reason && (
                                        <p className="text-xs text-blue-700 mt-2 italic">
                                          {item.personalization.reason}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
