import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb/connection';
import { User, Student } from '@/lib/mongodb/models';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email })
            .populate('studentId')
            .lean();

          console.log('Auth - User found:', user?.email);
          
          if (!user) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          // Handle student data resolution
          let studentId = null;
          let studentCode = null;
          
          if (user.studentId) {
            // Check if populated (has studentCode)
            if ((user.studentId as any).studentCode) {
              studentId = (user.studentId as any)._id.toString();
              studentCode = (user.studentId as any).studentCode;
            } else {
              // Not populated or missing code, try to fetch manually if it's an ID
              const idStr = user.studentId.toString();
              if (mongoose.Types.ObjectId.isValid(idStr)) {
                const studentDoc = await Student.findById(idStr).select('studentCode').lean();
                if (studentDoc) {
                  studentId = studentDoc._id.toString();
                  studentCode = studentDoc.studentCode;
                }
              }
            }
          }

          console.log('Auth - Resolved student:', { studentId, studentCode });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            studentId: studentId,
            studentCode: studentCode,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.studentId = (user as any).studentId;
        token.studentCode = (user as any).studentCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).studentId = token.studentId;
        (session.user as any).studentCode = token.studentCode;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
