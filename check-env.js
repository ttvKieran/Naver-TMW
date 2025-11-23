#!/usr/bin/env node

/**
 * Check if all required environment variables are set
 * Run: node check-env.js
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_BASE_URL',
  'NCP_CLOVASTUDIO_API_KEY',
  'NCP_APIGW_API_KEY',
  'NCP_REQUEST_ID',
  'PYTHON_API_URL'
];

const optionalEnvVars = [
  'NEWS_API_KEY'
];

console.log('🔍 Checking environment variables...\n');

let missingRequired = [];
let missingOptional = [];

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING (Required)`);
    missingRequired.push(varName);
  } else {
    const maskedValue = value.length > 20 
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : '***';
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n📝 Optional variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Not set (Optional)`);
    missingOptional.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

console.log('\n' + '='.repeat(50));

if (missingRequired.length > 0) {
  console.log('\n❌ MISSING REQUIRED VARIABLES:');
  missingRequired.forEach(v => console.log(`   - ${v}`));
  console.log('\n💡 Create .env.local file and add these variables.');
  console.log('   See .env.example for reference.\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  
  if (missingOptional.length > 0) {
    console.log('\n⚠️  Some optional variables are not set:');
    missingOptional.forEach(v => console.log(`   - ${v}`));
    console.log('   These are not required but some features may be limited.\n');
  } else {
    console.log('✅ All optional variables are also set!\n');
  }
  
  process.exit(0);
}
