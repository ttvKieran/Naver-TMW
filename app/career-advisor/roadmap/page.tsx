"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import roadmapsData from "@/data/career-roadmaps.json";
import CareerRoadmapDiagram from "@/components/CareerRoadmapDiagram";
import type { RoadmapPhases } from "@/lib/roadmapGraph";

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerParam = searchParams?.get('career');
  
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<string>('phase1');

  useEffect(() => {
    if (!careerParam) {
      router.push('/career-advisor');
      return;
    }

    const career = roadmapsData.careers.find(
      c => c.title === careerParam
    );

    if (career) {
      setSelectedCareer(career);
      const firstPhaseKey = Object.keys(career.roadmap)[0];
      if (firstPhaseKey) {
        setExpandedPhase(firstPhaseKey);
      }
    }
  }, [careerParam, router]);

  const roadmap = selectedCareer?.roadmap as RoadmapPhases | undefined;
  const phases = useMemo(() => {
    if (!roadmap) return [];
    return Object.entries(roadmap) as Array<
      [string, RoadmapPhases[keyof RoadmapPhases]]
    >;
  }, [roadmap]);

  const handlePhaseSelect = useCallback((phaseKey: string | null) => {
    if (!phaseKey) return;
    setExpandedPhase(phaseKey);
    const phaseSection = document.getElementById(`phase-${phaseKey}`);
    if (phaseSection) {
      phaseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [setExpandedPhase]);

  if (!selectedCareer || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            ← Quay lại
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {selectedCareer.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {selectedCareer.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700 font-semibold">Mức lương</p>
                  <p className="text-sm font-bold text-green-900">{selectedCareer.overview.salary_range}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 font-semibold">Tăng trưởng</p>
                  <p className="text-sm font-bold text-blue-900">{selectedCareer.overview.job_growth}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-700 font-semibold">Độ khó</p>
                  <p className="text-sm font-bold text-orange-900">{selectedCareer.overview.difficulty}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-700 font-semibold">Thời gian</p>
                  <p className="text-sm font-bold text-purple-900">{selectedCareer.overview.time_to_proficiency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Diagram */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Interactive Roadmap</h2>
              <p className="text-sm text-gray-600">
                Click a phase to jump to its detailed curriculum and milestones.
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-600">
              Drag to pan & Scroll to zoom
            </div>
          </div>
          <CareerRoadmapDiagram
            phases={roadmap}
            onSelectPhase={handlePhaseSelect}
          />
        </div>

        {/* Skills Required */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kỹ Năng Cần Thiết</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Technical Skills</h3>
              <ul className="space-y-2">
                {selectedCareer.required_skills.technical.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span className="text-gray-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Soft Skills</h3>
              <ul className="space-y-2">
                {selectedCareer.required_skills.soft_skills.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span className="text-gray-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Roadmap Phases */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Lộ Trình Chi Tiết</h2>

          {phases.map(([phaseKey, phaseData]) => (
            <div
              key={phaseKey}
              id={`phase-${phaseKey}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedPhase(expandedPhase === phaseKey ? '' : phaseKey)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">
                    {phaseData.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {phaseData.duration}
                  </p>
                </div>
                <span className="text-2xl text-gray-400">
                  {expandedPhase === phaseKey ? '▼' : '▶'}
                </span>
              </button>

              {expandedPhase === phaseKey && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  {/* Goals */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Mục Tiêu</h4>
                    <ul className="space-y-2">
                      {phaseData.goals.map((goal: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Learning Path */}
                  {phaseData.learning_path && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Chi Tiết Học Tập</h4>
                      <div className="space-y-4">
                        {phaseData.learning_path.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Tuần {item.week}
                              </span>
                              <h5 className="font-semibold text-gray-900">{item.topic}</h5>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Resources:</p>
                                <ul className="text-sm space-y-1">
                                  {item.resources.map((resource: string, ridx: number) => (
                                    <li key={ridx} className="text-gray-600">{resource}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Projects:</p>
                                <ul className="text-sm space-y-1">
                                  {item.projects.map((project: string, pidx: number) => (
                                    <li key={pidx} className="text-gray-600">• {project}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Milestones</h4>
                    <ul className="space-y-2">
                      {phaseData.milestones.map((milestone: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-1"></span>
                          <span className="text-gray-700">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Companies & Certifications */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {selectedCareer.certifications && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Certifications Recommended</h3>
              <ul className="space-y-2">
                {selectedCareer.certifications.map((cert: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600"></span>
                    <span className="text-gray-700">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedCareer.companies_hiring && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Công Ty Đang Tuyển</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCareer.companies_hiring.map((company: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Sẵn Sàng Bắt Đầu?</h3>
          <p className="mb-6 opacity-90">
            Hãy lưu lại roadmap này và bắt đầu hành trình của bạn ngay hôm nay!
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Tải Roadmap (PDF)
            </button>
            <button
              onClick={() => router.push('/career-advisor')}
              className="bg-indigo-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-900 transition-colors"
            >
              Thử Lại Với Profile Khác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
