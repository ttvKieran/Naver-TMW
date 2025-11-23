import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Student } from '@/lib/mongodb/models';

// GET /api/students/[id]/courses - Lấy danh sách courses của student
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Trả về courses từ academic.courses
    return NextResponse.json({
      success: true,
      courses: student.academic.courses || [],
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// PATCH /api/students/[id]/courses - Update điểm cho một course
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();
    const { courseCode, grade } = body;

    if (!courseCode || grade === undefined) {
      return NextResponse.json(
        { error: 'Missing courseCode or grade' },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Tìm và update course
    const courseIndex = student.academic.courses.findIndex(
      (c) => c.code === courseCode
    );

    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update grade
    student.academic.courses[courseIndex].grade = grade;

    // Tính lại GPA (convert from thang 10 to thang 4)
    const coursesWithGrade = student.academic.courses.filter((c) => c.grade > 0);
    if (coursesWithGrade.length > 0) {
      const avgGrade10 =
        coursesWithGrade.reduce((sum, c) => sum + c.grade, 0) /
        coursesWithGrade.length;
      // Convert thang 10 to thang 4.0
      student.academic.gpa = (avgGrade10 / 10) * 4.0;
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Course grade updated successfully',
      courses: student.academic.courses,
      gpa: student.academic.gpa,
    });
  } catch (error) {
    console.error('Error updating course grade:', error);
    return NextResponse.json(
      { error: 'Failed to update course grade' },
      { status: 500 }
    );
  }
}
