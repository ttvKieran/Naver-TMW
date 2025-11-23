'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchableSkillInput from '@/components/SearchableSkillInput';

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
      itSkills: [] as string[],
      softSkills: [] as string[],
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
      if (formData.skills.itSkills.length === 0) {
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
          itSkills: formData.skills.itSkills,
          softSkills: formData.skills.softSkills,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-1/5 text-center text-sm font-medium ${
                    s <= step ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {s === 5 ? '✓' : `Bước ${s}`}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Đăng ký tài khoản
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên hiển thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên đầy đủ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Kỹ năng của bạn</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IT Skills * (Tối thiểu 1)
                  </label>
                  <SearchableSkillInput
                    skillType="it"
                    selectedSkills={formData.skills.itSkills}
                    onSkillsChange={(skills) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, itSkills: skills },
                      })
                    }
                    placeholder="Tìm kiếm IT skills (Python, Java, React...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soft Skills
                  </label>
                  <SearchableSkillInput
                    skillType="soft"
                    selectedSkills={formData.skills.softSkills}
                    onSkillsChange={(skills) =>
                      setFormData({
                        ...formData,
                        skills: { ...formData.skills, softSkills: skills },
                      })
                    }
                    placeholder="Tìm kiếm soft skills (teamwork, communication...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mục tiêu nghề nghiệp
                  </label>
                  <textarea
                    value={formData.careerGoals}
                    onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ví dụ: Trở thành Full Stack Developer tại công ty công nghệ lớn..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Academic Info */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Thông tin học tập</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trường *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.university}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Hiện tại chỉ hỗ trợ Học viện Công nghệ Bưu chính Viễn thông
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngành *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.major}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Hiện tại chỉ hỗ trợ Công nghệ Thông tin
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm học *
                    </label>
                    <select
                      required
                      value={formData.currentYear}
                      onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map((year) => (
                        <option key={year} value={year}>
                          Năm {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kỳ học hiện tại *
                    </label>
                    <select
                      required
                      value={formData.currentSemester}
                      onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((sem) => (
                        <option key={sem} value={sem}>
                          Kỳ {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPA (Thang 4.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3.50"
                  />
                </div>
              </div>
            )}

            {/* Step 5: AI Preview */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  🎯 Dự đoán Nghề nghiệp của AI
                </h2>

                {loadingPreview ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Đang phân tích hồ sơ của bạn...</p>
                    <p className="text-sm text-gray-500 mt-2">AI đang xử lý kỹ năng và lộ trình nghề nghiệp</p>
                  </div>
                ) : aiPreview ? (
                  <div className="space-y-6">
                    {/* Predicted Career */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nghề nghiệp phù hợp với bạn:
                      </h3>
                      <p className="text-3xl font-bold text-purple-600">
                        {aiPreview.predictedCareer}
                      </p>
                    </div>

                    {/* Career Recommendation */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        Lời khuyên từ AI Career Advisor:
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {aiPreview.careerRecommendation}
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>✨ Tiếp theo:</strong> Chúng tôi sẽ tạo lộ trình học tập cá nhân hóa dựa trên nghề nghiệp này và kỹ năng hiện tại của bạn.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && step < 5 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loadingPreview}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Quay lại
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tiếp theo
                </button>
              ) : step === 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loadingPreview}
                  className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                >
                  {loadingPreview ? 'Đang phân tích...' : 'Xem dự đoán AI'}
                </button>
              ) : step === 5 && aiPreview ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Đang tạo tài khoản...' : '✓ Xác nhận & Hoàn tất'}
                </button>
              ) : null}
            </div>
          </form>

          {loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
              <p className="font-medium">Đang xử lý đăng ký của bạn...</p>
              <p className="text-sm mt-1">
                • Dự đoán ngành nghề phù hợp<br />
                • Tạo đề xuất từ AI<br />
                • Tạo lộ trình học tập cá nhân hóa<br />
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
