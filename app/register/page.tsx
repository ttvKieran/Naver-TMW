'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchableSkillInput from '@/components/SearchableSkillInput';
import ReactMarkdown from 'react-markdown';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Preview state
  const [aiPreview, setAiPreview] = useState<{
    predictedCareer: string;
    careerRecommendation: string;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Account Info
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    
    // Step 2: Personal Info
    fullName: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    phone: '',
    
    // Step 3: Skills
    skills: {
      itSkill: [] as string[],
      softSkill: [] as string[],
    },
    interests: [] as string[],
    careerGoals: '',
    
    // Step 4: Academic Info
    university: 'Học viện Công nghệ Bưu chính Viễn thông',
    major: 'Công nghệ Thông tin',
    currentYear: 1,
    currentSemester: 1,
    gpa: '',
  });

  const handleNext = async () => {
    // Validate current step
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu không khớp');
        return;
      }
      if (formData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    } else if (step === 2) {
      if (!formData.fullName) {
        setError('Vui lòng nhập họ tên');
        return;
      }
    } else if (step === 3) {
      if (formData.skills.itSkill.length === 0) {
        setError('Vui lòng thêm ít nhất một IT skill');
        return;
      }
    } else if (step === 4) {
      if (!formData.currentSemester) {
        setError('Vui lòng chọn kỳ học hiện tại');
        return;
      }
      // After step 4, generate AI preview before final step
      await generateAIPreview();
    }
    
    setError('');
    setStep(step + 1);
  };

  const generateAIPreview = async () => {
    setLoadingPreview(true);
    setError('');
    
    try {
      const response = await fetch('/api/preview-career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itSkill: formData.skills.itSkill,
          softSkill: formData.skills.softSkill,
          fullName: formData.fullName,
          currentSemester: formData.currentSemester,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
          interests: formData.interests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate preview');
      }

      setAiPreview({
        predictedCareer: data.predictedCareer,
        careerRecommendation: data.careerRecommendation,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo dự đoán AI');
      setStep(4); // Go back to previous step
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentSemester) {
      setError('Vui lòng chọn kỳ học hiện tại');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
          // Pass AI preview data from Step 5
          aiCareerRecommendation: aiPreview?.careerRecommendation || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success! Redirect to dashboard
      alert('Đăng ký thành công! Chúng tôi đã tạo lộ trình học tập cá nhân hóa cho bạn.');
      router.push(data.redirectTo || '/dashboard');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffbf7] py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#eb7823]/10 to-[#6e3787]/10 rounded-full blur-3xl opacity-60 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#eb7823]/10 to-[#6e3787]/10 rounded-full blur-3xl opacity-60 -ml-20 -mb-20"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-[#f0e6dd] p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-1/5 text-center text-sm font-bold ${
                    s <= step ? 'text-[#eb7823]' : 'text-[#8a7a70]/50'
                  }`}
                >
                  {s === 5 ? '✓' : `Step ${s}`}
                </div>
              ))}
            </div>
            <div className="w-full bg-[#fdf6f0] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#eb7823] to-[#6e3787] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6 text-center tracking-tight">
            Create Your Account
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Account Information</h2>
                
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    placeholder="How should we call you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Personal Details</h2>
                
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Your Skills & Goals</h2>
                
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    IT Skills * (Min 1)
                  </label>
                  <SearchableSkillInput
                    skillType="it"
                    selectedSkills={formData.skills.itSkill}
                    onSkillsChange={(skills) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, itSkill: skills },
                      })
                    }
                    placeholder="Search IT skills (Python, Java, React...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Soft Skills
                  </label>
                  <SearchableSkillInput
                    skillType="soft"
                    selectedSkills={formData.skills.softSkill}
                    onSkillsChange={(skills) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, softSkill: skills },
                      })
                    }
                    placeholder="Search soft skills (teamwork, communication...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Career Goals
                  </label>
                  <textarea
                    value={formData.careerGoals}
                    onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    placeholder="E.g., Become a Full Stack Developer at a top tech company..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Academic Info */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Academic Background</h2>
                
                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    University *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.university}
                    readOnly
                    className="w-full px-4 py-3 bg-[#fdf6f0]/50 border border-[#f0e6dd] rounded-xl text-[#8a7a70] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#8a7a70] mt-1">
                    Currently supporting PTIT only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    Major *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.major}
                    readOnly
                    className="w-full px-4 py-3 bg-[#fdf6f0]/50 border border-[#f0e6dd] rounded-xl text-[#8a7a70] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#8a7a70] mt-1">
                    Currently supporting Information Technology only
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                      Year *
                    </label>
                    <select
                      required
                      value={formData.currentYear}
                      onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    >
                      {[1, 2, 3, 4, 5].map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                      Semester *
                    </label>
                    <select
                      required
                      value={formData.currentSemester}
                      onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                    GPA (4.0 Scale)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a]"
                    placeholder="3.50"
                  />
                </div>
              </div>
            )}

            {/* Step 5: AI Preview */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-[#1a1a1a]">
                  🎯 AI Career Prediction
                </h2>

                {loadingPreview ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#eb7823] mb-4"></div>
                    <p className="text-[#1a1a1a] font-medium">Analyzing your profile...</p>
                    <p className="text-sm text-[#8a7a70] mt-2">AI is processing your skills and career path</p>
                  </div>
                ) : aiPreview ? (
                  <div className="space-y-6">
                    {/* Predicted Career */}
                    <div className="bg-gradient-to-r from-[#eb7823]/10 to-[#6e3787]/10 p-6 rounded-2xl border border-[#eb7823]/20">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                        Recommended Career Path:
                      </h3>
                      <p className="text-3xl font-bold text-[#6e3787]">
                        {aiPreview.predictedCareer}
                      </p>
                    </div>

                    {/* Career Recommendation */}
                    <div className="bg-[#fdf6f0] p-6 rounded-2xl border border-[#f0e6dd]">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        AI Advisor Insights:
                      </h3>
                      <div className="prose prose-sm max-w-none text-[#1a1a1a] leading-relaxed">
                        <ReactMarkdown>{aiPreview.careerRecommendation}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-[#eb7823]/5 p-4 rounded-xl border border-[#eb7823]/20">
                      <p className="text-sm text-[#eb7823] font-medium">
                        <strong>✨ Next Step:</strong> We will generate a personalized learning roadmap based on this career path and your current skills.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-[#f0e6dd]">
              {step > 1 && step < 5 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loadingPreview}
                  className="px-6 py-2.5 border border-[#f0e6dd] text-[#8a7a70] rounded-xl hover:bg-[#fdf6f0] transition-colors disabled:opacity-50 font-medium"
                >
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2.5 bg-gradient-to-r from-[#eb7823] to-[#6e3787] text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#eb7823]/20 font-bold"
                >
                  Next Step
                </button>
              ) : step === 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loadingPreview}
                  className="ml-auto px-6 py-2.5 bg-gradient-to-r from-[#eb7823] to-[#6e3787] text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#eb7823]/20 font-bold disabled:opacity-50"
                >
                  {loadingPreview ? 'Analyzing...' : 'Get AI Prediction'}
                </button>
              ) : step === 5 && aiPreview ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20 font-bold"
                >
                  {loading ? 'Creating Account...' : '✓ Confirm & Finish'}
                </button>
              ) : null}
            </div>
          </form>

          {loading && (
            <div className="mt-6 p-4 bg-[#eb7823]/10 border border-[#eb7823]/20 text-[#eb7823] rounded-xl">
              <p className="font-bold">Processing your registration...</p>
              <p className="text-sm mt-1 opacity-80">
                • Finalizing career path<br />
                • Generating personalized roadmap<br />
                • Setting up your dashboard<br />
                Please wait a moment...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
