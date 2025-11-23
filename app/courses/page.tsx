'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Course {
  code: string;
  name: string;
  semester: number;
  grade: number;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [grade, setGrade] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user?.studentId) {
      fetchCourses();
    }
  }, [session]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/students/${session?.user?.studentId}/courses`);
      if (res.ok) {
        const data = await res.json();
        console.log('📚 Fetched courses from API:', data.courses?.length || 0);
        console.log('📋 First 3 courses:', data.courses?.slice(0, 3).map((c: Course) => ({ 
          code: c.code, 
          semester: c.semester 
        })));
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async () => {
    if (!selectedCourse || !grade) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/students/${session?.user?.studentId}/courses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseCode: selectedCourse.code,
          grade: parseFloat(grade) 
        }),
      });

      if (res.ok) {
        setMessage('✅ Đã lưu điểm thành công!');
        setSelectedCourse(null);
        setGrade('');
        fetchCourses();
      } else {
        setMessage('❌ Lỗi khi lưu điểm');
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade === 0) return 'bg-gray-100 text-gray-600';
    if (grade >= 8.5) return 'bg-green-100 text-green-700 border-green-200';
    if (grade >= 7) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (grade >= 5.5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getGradeLabel = (grade: number) => {
    if (grade === 0) return 'Not Graded';
    if (grade >= 8.5) return 'Excellent';
    if (grade >= 7) return 'Good';
    if (grade >= 5.5) return 'Average';
    if (grade >= 4) return 'Below Average';
    return 'Weak';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Academic Records</h1>
            <p className="text-muted-foreground mt-1">Manage your courses and track your GPA</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-card px-5 py-2.5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {courses.filter(c => c.grade > 0).length}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</span>
                <span className="text-sm font-bold text-foreground">Courses</span>
              </div>
            </div>
            
            <div className="bg-card px-5 py-2.5 rounded-2xl border border-border shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                {courses.length}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                <span className="text-sm font-bold text-foreground">Registered</span>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.includes('✅') 
              ? 'bg-green-50 border-green-100 text-green-800' 
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            <span className="text-xl">{message.includes('✅') ? '🎉' : '⚠️'}</span>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Course List - Grouped by Semester */}
        {courses.length === 0 ? (
          <div className="bg-card rounded-3xl border border-border p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              📚
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your course list will appear here once you have registered for classes or imported your data.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(
              courses.reduce((acc, course) => {
                const sem = course.semester || 1;
                if (!acc[sem]) acc[sem] = [];
                acc[sem].push(course);
                return acc;
              }, {} as Record<number, Course[]>)
            )
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([semKey, semesterCourses]) => (
              <div key={semKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-bold uppercase tracking-wider border border-border">
                    Semester {semKey}
                  </span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {semesterCourses.map((course) => (
                    <div
                      key={course.code}
                      onClick={() => {
                        setSelectedCourse(course);
                        setGrade(course.grade > 0 ? String(course.grade) : '');
                      }}
                      className="group bg-card hover:bg-accent/5 border border-border hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-md cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {course.code}
                          </span>
                          {course.grade > 0 && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getGradeColor(course.grade)}`}>
                              {course.grade}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-foreground text-lg leading-snug mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                          {course.name}
                        </h3>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className={`text-xs font-medium ${
                            course.grade > 0 ? 'text-muted-foreground' : 'text-orange-600 bg-orange-50 px-2 py-0.5 rounded'
                          }`}>
                            {getGradeLabel(course.grade)}
                          </span>
                          <span className="text-xs text-muted-foreground group-hover:translate-x-1 transition-transform">
                            Update Grade →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grade Edit Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">Update Grade</h3>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Course</div>
                <div className="font-bold text-foreground text-lg">{selectedCourse.name}</div>
                <div className="text-xs font-mono text-primary mt-1">{selectedCourse.code}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Grade (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-lg"
                    placeholder="Enter grade..."
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="flex-1 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGrade}
                    disabled={saving || !grade}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
