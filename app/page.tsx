import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect based on authentication status
  if (session && session.user) {
    // User is logged in, redirect to dashboard
    redirect('/dashboard');
  } else {
    // User is not logged in, redirect to login
    redirect('/login');
  }

  // This code will not execute because of the redirect above
  return null;
}
