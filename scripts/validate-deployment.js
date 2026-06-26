#!/usr/bin/env node

/**
 * Pre-deployment validation script for AWS Amplify
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];
const success = [];

console.log('🔍 Validating deployment configuration...\n');

// Check 1: amplify.yml exists
if (fs.existsSync(path.join(process.cwd(), 'amplify.yml'))) {
  success.push('✓ amplify.yml found');
} else {
  errors.push('✗ amplify.yml not found - required for Amplify deployment');
}

// Check 2: next.config.mjs has required settings
if (fs.existsSync(path.join(process.cwd(), 'next.config.mjs'))) {
  const nextConfig = fs.readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8');
  
  if (nextConfig.includes('output: \'standalone\'')) {
    success.push('✓ Next.js standalone output enabled');
  } else {
    warnings.push('⚠ Next.js standalone output not enabled (recommended for Amplify)');
  }
  
  if (nextConfig.includes('bodySizeLimit')) {
    success.push('✓ Body size limit configured for file uploads');
  } else {
    warnings.push('⚠ Body size limit not configured (may cause upload issues)');
  }
} else {
  errors.push('✗ next.config.mjs not found');
}

// Check 3: .env.example exists and has required variables
if (fs.existsSync(path.join(process.cwd(), '.env.example'))) {
  const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envExample.includes(varName)) {
      success.push(`✓ ${varName} documented in .env.example`);
    } else {
      errors.push(`✗ ${varName} missing from .env.example`);
    }
  });
} else {
  errors.push('✗ .env.example not found');
}

// Check 4: .env file exists (but don't check contents for security)
if (fs.existsSync(path.join(process.cwd(), '.env'))) {
  success.push('✓ .env file exists');
  
  // Check if .env is in .gitignore
  const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
  if (gitignore.includes('.env')) {
    success.push('✓ .env is in .gitignore');
  } else {
    errors.push('✗ .env is NOT in .gitignore - SECURITY RISK!');
  }
} else {
  warnings.push('⚠ .env file not found (will be created during deployment)');
}

// Check 5: package.json has required scripts
if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    success.push('✓ Build script found in package.json');
  } else {
    errors.push('✗ Build script missing from package.json');
  }
  
  if (packageJson.scripts && packageJson.scripts.start) {
    success.push('✓ Start script found in package.json');
  } else {
    errors.push('✗ Start script missing from package.json');
  }
  
  // Check for critical dependencies
  const criticalDeps = ['next', 'react', 'react-dom', '@prisma/client', 'next-auth'];
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      success.push(`✓ ${dep} in dependencies`);
    } else {
      errors.push(`✗ ${dep} missing from dependencies`);
    }
  });
  
  // Check for sharp (may cause build issues)
  if (packageJson.dependencies && packageJson.dependencies.sharp) {
    warnings.push('⚠ sharp package found (native dependency - may cause build issues on Amplify)');
    warnings.push('  Consider using @vercel/og or a different image processing solution');
  }
} else {
  errors.push('✗ package.json not found');
}

// Check 6: Prisma schema exists
if (fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma'))) {
  success.push('✓ Prisma schema found');
  
  const schema = fs.readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');
  
  if (schema.includes('provider = "postgresql"')) {
    success.push('✓ PostgreSQL provider configured');
  } else {
    errors.push('✗ PostgreSQL provider not configured in Prisma schema');
  }
} else {
  errors.push('✗ prisma/schema.prisma not found');
}

// Check 7: Verify no hardcoded localhost URLs in critical files
const criticalFiles = [
  'src/app/api/auth/[...nextauth]/route.js',
  'src/lib/supabase.js'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('localhost:3000') && !content.includes('process.env')) {
      warnings.push(`⚠ Hardcoded localhost URL found in ${file}`);
    }
  }
});

// Check 8: Verify gitignore includes node_modules and .next
if (fs.existsSync(path.join(process.cwd(), '.gitignore'))) {
  const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
  
  if (gitignore.includes('node_modules')) {
    success.push('✓ node_modules in .gitignore');
  } else {
    errors.push('✗ node_modules not in .gitignore');
  }
  
  if (gitignore.includes('.next')) {
    success.push('✓ .next in .gitignore');
  } else {
    errors.push('✗ .next not in .gitignore');
  }
}

// Print results
console.log('═══════════════════════════════════════════════════════════');
console.log('VALIDATION RESULTS');
console.log('═══════════════════════════════════════════════════════════\n');

if (success.length > 0) {
  console.log('✅ SUCCESS (' + success.length + ' checks passed):\n');
  success.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (' + warnings.length + ' issues):\n');
  warnings.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERRORS (' + errors.length + ' issues found):\n');
  errors.forEach(msg => console.log('  ' + msg));
  console.log('');
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
if (errors.length === 0) {
  console.log('✅ READY FOR DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Next steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Set environment variables in AWS Amplify Console');
  console.log('3. Deploy using AWS Amplify Console');
  console.log('4. Run database migrations: npx prisma migrate deploy');
  console.log('\nSee DEPLOYMENT.md for detailed instructions.\n');
  process.exit(0);
} else {
  console.log('❌ DEPLOYMENT BLOCKED');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Please fix the errors above before deploying.\n');
  process.exit(1);
}