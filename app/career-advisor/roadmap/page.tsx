"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import roadmapsData from "@/data/career-roadmaps.json";
import CareerRoadmapDiagram, { DiagramDetailSelection } from "@/components/CareerRoadmapDiagram";
import type { RoadmapPhases } from "@/lib/roadmapGraph";

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerParam = searchParams?.get('career');
  
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<string>('phase1');
  const [selectedDetail, setSelectedDetail] = useState<null | {
    kind: 'learning_path' | 'goal' | 'milestone';
    phaseTitle: string;
    title: string;
    subtitle?: string;
    resources?: string[];
    projects?: string[];
  }>(null);

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
        });
      } else {
        const goal = phase.goals[detail.topicIndex];
        if (!goal) return;
        setSelectedDetail({
          kind: 'goal',
          phaseTitle: phase.title,
          title: goal,
        });
      }
      return;
    }

    if (detail.type === 'milestone') {
      const milestone = phase.milestones[detail.milestoneIndex];
      if (!milestone) return;
      setSelectedDetail({
        kind: 'milestone',
        phaseTitle: phase.title,
        title: milestone,
      });
    }
  }, [roadmap]);

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
            &larr; Quay lại
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
            activePhaseKey={expandedPhase}
            onSelectPhase={handlePhaseSelect}
            onSelectDetail={handleDetailSelect}
          />
        </div>

        {/* Detail Context Panel */}
        {/* <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Context Window</h3>
              <p className="text-sm text-gray-500">Select any topic or milestone node to preview its details.</p>
            </div>
            {selectedDetail && (
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {selectedDetail ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wide">
                  {selectedDetail.kind === 'learning_path' && 'Learning Path'}
                  {selectedDetail.kind === 'goal' && 'Goal'}
                  {selectedDetail.kind === 'milestone' && 'Milestone'}
                </p>
                <h4 className="text-2xl font-semibold text-gray-900">{selectedDetail.title}</h4>
                <p className="text-sm text-gray-500">Phase: {selectedDetail.phaseTitle}</p>
                {selectedDetail.subtitle && (
                  <p className="text-sm text-indigo-600 mt-1">{selectedDetail.subtitle}</p>
                )}
              </div>

              {selectedDetail.resources && selectedDetail.resources.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Resources</p>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {selectedDetail.resources.map((resource, idx) => (
                      <li key={idx}>{resource}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDetail.projects && selectedDetail.projects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Projects / Practice</p>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {selectedDetail.projects.map((project, idx) => (
                      <li key={idx}>{project}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No item selected yet. Hover and click on any child node (topics or milestones) to see its summary here.
            </div>
          )}
        </div> */}

        {/* Skills Required */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kỹ năng cần thiết</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Technical Skills</h3>
              <ul className="space-y-2">
                {selectedCareer.required_skills.technical.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">-</span>
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
                    <span className="text-indigo-600 mt-1">-</span>
                    <span className="text-gray-700">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Công ty ứng tuyển</h3>
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
