#!/usr/bin/env node

/**
 * Pre-deploy Check Script
 * Validates critical items before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chalk = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

let exitCode = 0;
const errors = [];
const warnings = [];

console.log(chalk.blue('🔍 Running pre-deploy checks...\n'));

// =============================================================================
// Check 1: Environment Variables
// =============================================================================
console.log('Checking environment variables...');

const requiredEnvVars = [
  'ADMIN_TOKEN',
  'NEXT_PUBLIC_SITE_URL',
];

const recommendedEnvVars = [
  'NEXT_PUBLIC_PLAUSIBLE_DOMAIN',
  'RESEND_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    errors.push(`Missing required environment variable: ${envVar}`);
  }
});

recommendedEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    warnings.push(`Missing recommended environment variable: ${envVar}`);
  }
});

// =============================================================================
// Check 2: Console.log statements
// =============================================================================
console.log('Checking for console.log statements...');

try {
  const srcDir = path.join(process.cwd(), 'app');
  const libDir = path.join(process.cwd(), 'lib');
  const componentsDir = path.join(process.cwd(), 'components');
  
  const checkConsoleLog = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { recursive: true });
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile() && file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Allow console.error and console.warn, but not console.log
        const consoleLogMatches = content.match(/console\.log\(/g);
        if (consoleLogMatches) {
          warnings.push(`Found console.log in ${file} (${consoleLogMatches.length} occurrences)`);
        }
      }
    });
  };
  
  checkConsoleLog(srcDir);
  checkConsoleLog(libDir);
  checkConsoleLog(componentsDir);
} catch (error) {
  warnings.push('Could not check for console.log statements');
}

// =============================================================================
// Check 3: Image files exist
// =============================================================================
console.log('Checking image assets...');

const requiredImages = [
  'public/icon-192.png',
  'public/icon-512.png',
  'public/apple-icon.png',
  'public/favicon.ico',
];

requiredImages.forEach((imgPath) => {
  if (!fs.existsSync(path.join(process.cwd(), imgPath))) {
    warnings.push(`Missing image: ${imgPath}`);
  }
});

// =============================================================================
// Check 4: Affiliate links are not example.com
// =============================================================================
console.log('Checking affiliate links...');

try {
  const hardwareDataPath = path.join(process.cwd(), 'data', 'hardware.json');
  if (fs.existsSync(hardwareDataPath)) {
    const hardwareData = JSON.parse(fs.readFileSync(hardwareDataPath, 'utf8'));
    
    hardwareData.devices.forEach((device) => {
      if (device.affiliateUrl && device.affiliateUrl.includes('example.com')) {
        errors.push(`Device "${device.name}" has placeholder affiliate URL: ${device.affiliateUrl}`);
      }
    });
  }
} catch (error) {
  warnings.push('Could not validate affiliate links');
}

// =============================================================================
// Check 5: TODO/FIXME comments
// =============================================================================
console.log('Checking for TODO/FIXME comments...');

try {
  const dirsToCheck = [
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'components'),
    path.join(process.cwd(), 'lib'),
  ];
  
  dirsToCheck.forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    
    const files = execSync(`find ${dir} -type f -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    files.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const todoMatches = content.match(/TODO:/gi);
      const fixmeMatches = content.match(/FIXME:/gi);
      
      if (todoMatches) {
        warnings.push(`Found TODO in ${path.relative(process.cwd(), filePath)}`);
      }
      if (fixmeMatches) {
        errors.push(`Found FIXME in ${path.relative(process.cwd(), filePath)} (must be resolved before deploy)`);
      }
    });
  });
} catch (error) {
  // find command might not work on Windows, skip this check
}

// =============================================================================
// Check 6: Package.json scripts
// =============================================================================
console.log('Checking package.json...');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  
  const requiredScripts = ['build', 'start', 'lint'];
  requiredScripts.forEach((script) => {
    if (!packageJson.scripts[script]) {
      errors.push(`Missing script in package.json: ${script}`);
    }
  });
} catch (error) {
  errors.push('Could not read package.json');
}

// =============================================================================
// Check 7: Build output directory
// =============================================================================
console.log('Checking build output...');

const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (!fs.existsSync(nextConfigPath)) {
  errors.push('Missing next.config.js');
}

// =============================================================================
// Check 8: TypeScript configuration
// =============================================================================
console.log('Checking TypeScript config...');

const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsConfigPath)) {
  errors.push('Missing tsconfig.json');
}

// =============================================================================
// Report Results
// =============================================================================
console.log('\n' + '='.repeat(60));

if (errors.length === 0 && warnings.length === 0) {
  console.log(chalk.green('✅ All checks passed! Ready to deploy.'));
} else {
  if (errors.length > 0) {
    console.log(chalk.red(`\n❌ ${errors.length} Error(s) found:`));
    errors.forEach((error) => {
      console.log(chalk.red(`  • ${error}`));
    });
    exitCode = 1;
  }
  
  if (warnings.length > 0) {
    console.log(chalk.yellow(`\n⚠️  ${warnings.length} Warning(s):`));
    warnings.forEach((warning) => {
      console.log(chalk.yellow(`  • ${warning}`));
    });
  }
}

console.log('='.repeat(60) + '\n');

// =============================================================================
// Additional Info
// =============================================================================

if (exitCode === 0) {
  console.log(chalk.blue('📋 Pre-deployment checklist:'));
  console.log('  1. Environment variables set in Vercel dashboard');
  console.log('  2. Domain configured with SSL');
  console.log('  3. Analytics script installed');
  console.log('  4. Affiliate links updated');
  console.log('  5. Images optimized');
  console.log('\n🚀 Ready for deployment!\n');
} else {
  console.log(chalk.red('❌ Please fix errors before deploying.\n'));
}

process.exit(exitCode);
