import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Sync user to clova-rag-roadmap users.json file
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    const usersFilePath = path.join(
      process.cwd(),
      'clova-rag-roadmap',
      'data',
      'users',
      'users.json'
    );
    
    // Read existing users
    let users: any[] = [];
    try {
      const fileContent = await fs.readFile(usersFilePath, 'utf-8');
      users = JSON.parse(fileContent);
    } catch (error) {
      console.log('users.json not found, creating new file');
    }
    
    // Check if user already exists
    const existingIndex = users.findIndex(u => u.user_id === userData.user_id);
    
    if (existingIndex >= 0) {
      // Update existing user
      users[existingIndex] = userData;
      console.log('Updated user:', userData.user_id);
    } else {
      // Add new user
      users.push(userData);
      console.log('Added new user:', userData.user_id);
    }
    
    // Write back to file
    await fs.writeFile(
      usersFilePath,
      JSON.stringify(users, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({
      success: true,
      message: 'User synced to clova-rag-roadmap',
    });
    
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync user', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
