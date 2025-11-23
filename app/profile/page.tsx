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
    itSkill: [] as string[],
    softSkill: [] as string[],
    interests: [] as string[],
  });

  const [newInterest, setNewInterest] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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
          itSkill: student.itSkill || [],
          softSkill: student.softSkill || [],
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
          itSkill: formData.itSkill,
          softSkill: formData.softSkill,
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('❌ Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    setPasswordMessage('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          studentId: session?.user?.studentId
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage('✅ Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage(`❌ ${data.message || 'Failed to change password'}`);
      }
    } catch (error) {
      setPasswordMessage('❌ Error changing password');
    } finally {
      setChangingPassword(false);
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-primary/20">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-card rounded-full"></div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{session?.user?.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground">
              <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium border border-border">
                {session?.user?.studentCode}
              </span>
              <span className="hidden md:inline">•</span>
              <span>{session?.user?.email}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            message.includes('✅') 
              ? 'bg-green-50 border-green-100 text-green-800' 
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            <span className="text-xl">{message.includes('✅') ? '🎉' : '⚠️'}</span>
            <p className="font-medium">{message}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Personal & Academic */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-card rounded-3xl shadow-sm border border-border p-8">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg">🎓</span>
                Academic Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">University</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="University name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Major</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Your major"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">GPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.currentSemester}
                      onChange={(e) => setFormData({ ...formData, currentSemester: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-3xl shadow-sm border border-border p-8">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-lg">⚡</span>
                Skills & Interests
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">IT Skills</label>
                  <SearchableSkillInput
                    skillType="it"
                    selectedSkills={formData.itSkill}
                    onSkillsChange={(skills) =>
                      setFormData({ ...formData, itSkill: skills })
                    }
                    placeholder="Add technical skills (e.g. React, Python)..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Soft Skills</label>
                  <SearchableSkillInput
                    skillType="soft"
                    selectedSkills={formData.softSkill}
                    onSkillsChange={(skills) =>
                      setFormData({ ...formData, softSkill: skills })
                    }
                    placeholder="Add soft skills (e.g. Leadership, Communication)..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Interests</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="Add an interest..."
                      className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <button
                      onClick={addInterest}
                      className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg font-medium border border-secondary/20"
                      >
                        {interest}
                        <button 
                          onClick={() => removeInterest(idx)} 
                          className="hover:text-red-600 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-card rounded-3xl p-8 shadow-sm border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-lg">🔒</span>
                Security
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {passwordMessage && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${
                    passwordMessage.startsWith('✅') 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {passwordMessage}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-primary/10 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-foreground mb-4">Roadmap Settings</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Need a fresh start? You can regenerate your learning roadmap based on your updated profile.
              </p>
              
              <button
                onClick={handleRegenerateRoadmap}
                disabled={regenerating}
                className="w-full py-4 bg-white border-2 border-primary/20 text-primary rounded-xl font-bold hover:bg-primary/5 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {regenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="group-hover:rotate-180 transition-transform duration-500">↻</span>
                    Regenerate Roadmap
                  </>
                )}
              </button>
              
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 text-xs rounded-xl border border-yellow-100">
                <strong>Note:</strong> This will replace your current progress and create a new path tailored to your updated skills and interests.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
