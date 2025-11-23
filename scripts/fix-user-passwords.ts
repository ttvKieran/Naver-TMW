import dotenv from 'dotenv';
import path from 'path';
import connectDB from '../lib/mongodb/connection';
import { User } from '../lib/mongodb/models/User';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function fixUserPasswords() {
  try {
    await connectDB();

    // Find all users with unhashed passwords (plain text)
    const users = await User.find({});
    
    console.log(`Found ${users.length} users to check`);
    
    let fixed = 0;
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.passwordHash && (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$'))) {
        console.log(`✓ User ${user.email} already has hashed password`);
        continue;
      }
      
      // If password field exists (old schema) or passwordHash is plain text
      const plainPassword = (user as any).password || user.passwordHash;
      
      if (plainPassword) {
        console.log(`Hashing password for user: ${user.email}`);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        user.passwordHash = hashedPassword;
        // Remove old password field if exists
        if ((user as any).password) {
          (user as any).password = undefined;
        }
        
        await user.save();
        fixed++;
        console.log(`✅ Fixed user: ${user.email}`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} users`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserPasswords();
