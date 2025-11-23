'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import SearchableSkillInput from '@/components/SearchableSkillInput';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState('');
  
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    university: '',
    major: '',
    gpa: 0,
    currentSemester: 1,
    itSkills: [] as string[],
    softSkills: [] as string[],
    interests: [] as string[],
  });

  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (session?.user?.studentId) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/students/${session?.user?.studentId}`);
      if (res.ok) {
        const data = await res.json();
        const student = data.student;
        
        setProfile(student);
        setFormData({
          fullName: student.fullName || '',
          university: student.university || '',
          major: student.major || '',
          gpa: student.academic?.gpa || 0,
          currentSemester: student.academic?.currentSemester || 1,
          itSkills: student.itSkill || [],
          softSkills: student.softSkill || [],
          interests: student.interests || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/students/${session?.user?.studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          university: formData.university,
          major: formData.major,
          gpa: formData.gpa,
          currentSemester: formData.currentSemester,
          itSkill: formData.itSkills,
          softSkill: formData.softSkills,
          interests: formData.interests,
        }),
      });

      if (res.ok) {
        setMessage('✅ Profile updated successfully!');
        fetchProfile();
      } else {
        setMessage('❌ Failed to update profile');
      }
    } catch (error) {
      setMessage('❌ Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateRoadmap = async () => {
    if (!confirm('Bạn có chắc muốn tạo lại roadmap? Roadmap hiện tại sẽ được thay thế.')) {
      return;
    }

    setRegenerating(true);
    setMessage('');

    try {
      const res = await fetch('/api/regenerate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: session?.user?.studentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(`✅ ${data.message}`);
        setTimeout(() => router.push('/my-roadmap'), 2000);
      } else {
        const error = await res.json();
        setMessage(`❌ ${error.error}`);
      }
    } catch (error) {
      setMessage('❌ Error regenerating roadmap');
    } finally {
      setRegenerating(false);
    }
  };



  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{session?.user?.name}</h1>
              <p className="text-gray-600">{session?.user?.studentCode}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trường</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngành học</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Học kỳ hiện tại</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* IT Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IT Skills</label>
              <SearchableSkillInput
                skillType="it"
                selectedSkills={formData.itSkills}
                onSkillsChange={(skills) =>
                  setFormData({ ...formData, itSkills: skills })
                }
                placeholder="Tìm kiếm IT skills (Python, Java, React...)"
              />
            </div>

            {/* Soft Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
              <SearchableSkillInput
                skillType="soft"
                selectedSkills={formData.softSkills}
                onSkillsChange={(skills) =>
                  setFormData({ ...formData, softSkills: skills })
                }
                placeholder="Tìm kiếm soft skills (teamwork, communication...)"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sở thích</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  placeholder="Thêm sở thích..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addInterest}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                  >
                    {interest}
                    <button onClick={() => removeInterest(idx)} className="hover:text-red-600">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>

              <button
                onClick={handleRegenerateRoadmap}
                disabled={regenerating}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold disabled:opacity-50"
              >
                {regenerating ? 'Đang tạo...' : '✨ Tạo lại Roadmap'}
              </button>
            </div>

            {/* AI Recommendation */}
            {profile?.aiCareerRecommendation && (
              <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  Đề xuất nghề nghiệp từ AI
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{profile.aiCareerRecommendation}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
