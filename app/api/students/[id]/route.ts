import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb/connection';
import { Student } from '@/lib/mongodb/models';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID format' },
        { status: 400 }
      );
    }

    const student = await Student.findById(id).lean();

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch student',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Update các fields được gửi lên
    if (body.fullName !== undefined) student.fullName = body.fullName;
    if (body.phone !== undefined) student.phone = body.phone;
    if (body.dateOfBirth !== undefined) student.dateOfBirth = new Date(body.dateOfBirth);
    if (body.gender !== undefined) student.gender = body.gender;
    if (body.university !== undefined) student.university = body.university;
    if (body.major !== undefined) student.major = body.major;
    if (body.careerGoals !== undefined) student.careerGoals = body.careerGoals;
    
    // Update skills
    if (body.itSkill !== undefined) student.itSkill = body.itSkill;
    if (body.softSkill !== undefined) student.softSkill = body.softSkill;
    if (body.interests !== undefined) student.interests = body.interests;
    
    // Update academic info
    if (body.currentSemester !== undefined) {
      student.academic.currentSemester = body.currentSemester;
    }
    if (body.gpa !== undefined) {
      student.academic.gpa = body.gpa;
    }
    
    // Update availability
    if (body.timePerWeekHours !== undefined) {
      student.availability.timePerWeekHours = body.timePerWeekHours;
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: student.toObject(),
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      {
        error: 'Failed to update student',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
