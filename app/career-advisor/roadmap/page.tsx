'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import roadmapsData from "@/data/career-roadmaps.json";
import CareerRoadmapDiagram, { DiagramDetailSelection } from "@/components/CareerRoadmapDiagram";
import type { RoadmapPhases } from "@/lib/roadmapGraph";

export default function RoadmapPage() {
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
    if (careerParam) {
      const career = roadmapsData.careers.find(c => c.title === careerParam);
      if (career) {
        setSelectedCareer(career);
        // Set initial expanded phase if available
        if (career.roadmap && Object.keys(career.roadmap).length > 0) {
          // Default to phase1 if it exists, otherwise the first key
          setExpandedPhase('phase1');
        }
      }
    }
  }, [careerParam]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <Link
            href="/career-advisor/results"
            className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại kết quả
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                {selectedCareer.title}
              </h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-3xl">
                {selectedCareer.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">Mức lương</p>
                  <p className="text-base font-bold text-emerald-900">{selectedCareer.overview.salary_range}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Tăng trưởng</p>
                  <p className="text-base font-bold text-blue-900">{selectedCareer.overview.job_growth}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-1">Độ khó</p>
                  <p className="text-base font-bold text-orange-900">{selectedCareer.overview.difficulty}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-1">Thời gian</p>
                  <p className="text-base font-bold text-purple-900">{selectedCareer.overview.time_to_proficiency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Diagram */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Interactive Roadmap</h2>
              <p className="text-sm text-gray-500 mt-1">
                Click a phase to jump to its detailed curriculum and milestones.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              Drag to pan & Scroll to zoom
            </div>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
            <CareerRoadmapDiagram
              phases={roadmap}
              activePhaseKey={expandedPhase}
              onSelectPhase={handlePhaseSelect}
              onSelectDetail={handleDetailSelect}
            />
          </div>
        </div>

        {/* Skills Required */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kỹ năng cần thiết</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">🛠️</span>
                Technical Skills
              </h3>
              <ul className="space-y-3">
                {selectedCareer.required_skills.technical.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700 font-medium">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">🤝</span>
                Soft Skills
              </h3>
              <ul className="space-y-3">
                {selectedCareer.required_skills.soft_skills.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700 font-medium">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Companies & Certifications */}
        <div className="grid md:grid-cols-2 gap-8">
          {selectedCareer.certifications && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">📜</span> Certifications Recommended
              </h3>
              <ul className="space-y-3">
                {selectedCareer.certifications.map((cert: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700 font-medium">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedCareer.companies_hiring && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">🏢</span> Công ty ứng tuyển
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCareer.companies_hiring.map((company: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
