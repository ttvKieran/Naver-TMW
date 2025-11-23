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
    if (grade >= 8.5) return 'bg-green-100 text-green-800';
    if (grade >= 7) return 'bg-blue-100 text-blue-800';
    if (grade >= 5.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGradeLabel = (grade: number) => {
    if (grade === 0) return 'Chưa có điểm';
    if (grade >= 8.5) return 'Xuất sắc';
    if (grade >= 7) return 'Giỏi';
    if (grade >= 5.5) return 'Khá';
    if (grade >= 4) return 'Trung bình';
    return 'Yếu';
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
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Môn học của tôi</h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi kết quả học tập
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {courses.filter(c => c.grade).length}/{courses.length}
              </div>
              <div className="text-sm text-gray-600">môn đã có điểm</div>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          {/* Course List - Grouped by Semester */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <span className="text-4xl">📚</span>
              </div>
              <p className="text-gray-600 mb-4">Chưa có môn học nào</p>
              <p className="text-sm text-gray-500">
                Môn học sẽ được cập nhật dựa trên lộ trình học tập của bạn
              </p>
            </div>
          ) : (
            // Group courses by semester
            (() => {
              const semesterGroups = courses.reduce((acc, course) => {
                const sem = course.semester || 1;
                if (!acc[sem]) acc[sem] = [];
                acc[sem].push(course);
                return acc;
              }, {} as Record<number, Course[]>);

              console.log('🔢 Semester groups:', Object.keys(semesterGroups).map(k => ({
                semester: k,
                count: semesterGroups[parseInt(k)].length
              })));

              return Object.keys(semesterGroups)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(semKey => {
                  const semester = parseInt(semKey);
                  const semesterCourses = semesterGroups[semester];
                  
                  return (
                    <div key={semester} className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-lg">
                          Kỳ {semester}
                        </span>
                        <span className="text-sm text-gray-500 font-normal">
                          ({semesterCourses.length} môn học)
                        </span>
                      </h3>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {semesterCourses.map((course) => (
                          <div
                            key={course.code}
                            className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-purple-400 transition-all cursor-pointer hover:shadow-lg"
                            onClick={() => {
                              setSelectedCourse(course);
                              setGrade(course.grade > 0 ? String(course.grade) : '');
                            }}
                          >
                            <div className="mb-3">
                              <div className="font-mono text-xs text-purple-600 font-semibold mb-1">
                                {course.code}
                              </div>
                              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                {course.name}
                              </h3>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getGradeColor(course.grade)}`}>
                                {getGradeLabel(course.grade)}
                              </span>
                              
                              {course.grade > 0 ? (
                                <span className={`text-2xl font-bold px-3 py-1 rounded ${getGradeColor(course.grade)}`}>
                                  {course.grade.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 font-medium">Chưa có điểm</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
            })()
          )}
        </div>

        {/* GPA Summary */}
        {courses.some(c => c.grade > 0) && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Tổng kết</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl font-bold mb-1">
                  {(courses.reduce((sum, c) => sum + c.grade, 0) / courses.filter(c => c.grade > 0).length).toFixed(2)}
                </div>
                <div className="text-purple-100">Điểm TB (thang 10)</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">
                  {courses.filter(c => c.grade > 0).length}/{courses.length}
                </div>
                <div className="text-purple-100">Môn đã có điểm</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">
                  {courses.filter(c => c.grade >= 5).length}
                </div>
                <div className="text-purple-100">Môn đạt yêu cầu</div>
              </div>
            </div>
          </div>
        )}

        {/* Grade Input Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nhập điểm
              </h2>
              
              <div className="mb-6">
                <div className="font-mono text-xs text-gray-500 mb-1">
                  {selectedCourse.code}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {selectedCourse.name}
                </h3>
                {selectedCourse.grade && (
                  <p className="text-sm text-gray-500 mt-1">
                    Điểm hiện tại: <span className="font-semibold">{selectedCourse.grade}</span>
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điểm (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="8.5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setGrade('');
                    setMessage('');
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveGrade}
                  disabled={saving || !grade}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu điểm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
