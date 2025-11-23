"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PersonalityTraits {
  analytical: number;
  creative: number;
  teamwork: number;
  leadership: number;
  technical: number;
}

interface Skills {
  programming: number;
  problemSolving: number;
  communication: number;
  systemDesign: number;
  dataAnalysis: number;
}

interface ProfileFormData {
  name: string;
  gpa: number;
  mbti: string;
  traits: PersonalityTraits;
  skills: Skills;
  interests: string[];
}

const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const availableInterests = [
  'coding', 'design', 'data-science', 'automation',
  'hardware', 'mobile-apps', 'web-development', 'cloud',
  'ai-ml', 'security', 'iot', 'robotics'
];

export default function ProfileForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    gpa: 3.0,
    mbti: 'INTJ',
    traits: {
      analytical: 5,
      creative: 5,
      teamwork: 5,
      leadership: 5,
      technical: 5,
    },
    skills: {
      programming: 5,
      problemSolving: 5,
      communication: 5,
      systemDesign: 5,
      dataAnalysis: 5,
    },
    interests: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTraitChange = (trait: keyof PersonalityTraits, value: number) => {
    setFormData(prev => ({
      ...prev,
      traits: { ...prev.traits, [trait]: value }
    }));
  };

  const handleSkillChange = (skill: keyof Skills, value: number) => {
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value }
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/career-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      sessionStorage.setItem('profileData', JSON.stringify(formData));
      sessionStorage.setItem('predictions', JSON.stringify(result.predictions));
      router.push('/career-advisor/results');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-4">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-lg text-muted-foreground">
            Điền thông tin để nhận tư vấn nghề nghiệp phù hợp với bạn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* 01 Basic Info Card */}
              <div className="bg-card rounded-3xl shadow-sm border border-border p-8 h-fit">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">01</span>
                  Thông Tin Cơ Bản
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Họ và Tên</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">GPA (0-4.0)</label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.1"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                      value={formData.gpa}
                      onChange={e => setFormData(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-3">MBTI Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {mbtiTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mbti: type }))}
                          className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            formData.mbti === type
                              ? 'bg-slate-700 text-white border-slate-700 shadow-md scale-105'
                              : 'bg-background text-muted-foreground border-border hover:border-slate-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 02 Personality Traits */}
              <div className="bg-card rounded-3xl shadow-sm border border-border p-8 h-fit">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">02</span>
                  Đánh Giá Tính Cách (1-10)
                </h2>
                
                <div className="space-y-6">
                  {Object.entries(formData.traits).map(([trait, value]) => (
                    <div key={trait}>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-foreground capitalize">
                            {trait === 'analytical' && 'Tư duy phân tích'}
                            {trait === 'creative' && 'Sáng tạo'}
                            {trait === 'teamwork' && 'Làm việc nhóm'}
                            {trait === 'leadership' && 'Lãnh đạo'}
                            {trait === 'technical' && 'Kỹ thuật'}
                        </label>
                        <span className="text-sm font-bold text-purple-600">{value}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={e => handleTraitChange(trait as keyof PersonalityTraits, parseInt(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* 03 Skills */}
              <div className="bg-card rounded-3xl shadow-sm border border-border p-8 h-fit">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">03</span>
                  Đánh Giá Kỹ Năng (1-10)
                </h2>
                
                <div className="space-y-6">
                  {Object.entries(formData.skills).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-foreground capitalize">
                            {skill === 'programming' && 'Lập trình'}
                            {skill === 'problemSolving' && 'Giải quyết vấn đề'}
                            {skill === 'communication' && 'Giao tiếp'}
                            {skill === 'systemDesign' && 'Thiết kế hệ thống'}
                            {skill === 'dataAnalysis' && 'Phân tích dữ liệu'}
                        </label>
                        <span className="text-sm font-bold text-orange-600">{value}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={e => handleSkillChange(skill as keyof Skills, parseInt(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 04 Interests */}
              <div className="bg-card rounded-3xl shadow-sm border border-border p-8 h-fit">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">04</span>
                  Sở Thích & Lĩnh Vực Quan Tâm
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        formData.interests.includes(interest)
                          ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'
                          : 'bg-background text-muted-foreground border-border hover:border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      {interest.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || formData.interests.length === 0}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/25 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    Nhận Tư Vấn Nghề Nghiệp
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
