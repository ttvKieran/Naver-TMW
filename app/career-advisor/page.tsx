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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-600 mb-8">
            Điền thông tin để nhận tư vấn nghề nghiệp phù hợp với bạn
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thông Tin Cơ Bản
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPA (Điểm Trung Bình): <span className="text-indigo-600 font-bold">{formData.gpa.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    value={formData.gpa}
                    onChange={(e) => setFormData(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.0</span>
                    <span>2.0</span>
                    <span>4.0</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MBTI Personality Type
                  </label>
                  <select
                    value={formData.mbti}
                    onChange={(e) => setFormData(prev => ({ ...prev, mbti: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    {mbtiTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Personality Traits */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Đánh Giá Tính Cách
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Đánh giá từ 0 (yếu) đến 10 (xuất sắc)
              </p>

              <div className="space-y-6">
                {Object.entries(formData.traits).map(([trait, value]) => (
                  <div key={trait}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {trait === 'analytical' && 'Tư duy phân tích'}
                        {trait === 'creative' && 'Sáng tạo'}
                        {trait === 'teamwork' && 'Làm việc nhóm'}
                        {trait === 'leadership' && 'Lãnh đạo'}
                        {trait === 'technical' && 'Kỹ thuật'}
                      </label>
                      <span className="text-sm font-bold text-indigo-600">{value}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={value}
                      onChange={(e) => handleTraitChange(trait as keyof PersonalityTraits, parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Skills Assessment */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Đánh Giá Kỹ Năng
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Đánh giá từ 0 (chưa biết) đến 10 (chuyên gia)
              </p>

              <div className="space-y-6">
                {Object.entries(formData.skills).map(([skill, value]) => (
                  <div key={skill}>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {skill === 'programming' && 'Lập trình'}
                        {skill === 'problemSolving' && 'Giải quyết vấn đề'}
                        {skill === 'communication' && 'Giao tiếp'}
                        {skill === 'systemDesign' && 'Thiết kế hệ thống'}
                        {skill === 'dataAnalysis' && 'Phân tích dữ liệu'}
                      </label>
                      <span className="text-sm font-bold text-indigo-600">{value}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={value}
                      onChange={(e) => handleSkillChange(skill as keyof Skills, parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Interests */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sở Thích & Lĩnh Vực Quan Tâm
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Chọn tất cả các lĩnh vực bạn quan tâm
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableInterests.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-3 rounded-xl border transition-all font-medium ${formData.interests.includes(interest)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform -translate-y-0.5'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                  >
                    {interest.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </section>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || formData.interests.length === 0}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Đang phân tích...' : 'Nhận Tư Vấn Nghề Nghiệp'}
              </button>

              {formData.interests.length === 0 && (
                <p className="text-sm text-red-500 mt-2 text-center font-medium">
                  * Vui lòng chọn ít nhất 1 sở thích
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
