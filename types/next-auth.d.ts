import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      studentId: string | null;
      studentCode: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    studentId?: string | null;
    studentCode?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    studentId?: string | null;
    studentCode?: string | null;
  }
}
