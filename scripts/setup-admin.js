/**
 * Admin Setup Script
 * Generates bcrypt hash for admin password
 * 
 * Usage:
 *   npm run setup:admin -- yourpassword
 *   Or: node scripts/setup-admin.js yourpassword
 */

async function main() {
  const password = process.argv[2];
  
  if (!password) {
    console.log('\n❌ Error: No password provided\n');
    console.log('Usage: npm run setup:admin -- yourpassword');
    console.log('   Or: node scripts/setup-admin.js yourpassword\n');
    process.exit(1);
  }
  
  // Dynamic import for bcryptjs
  const bcrypt = await import('bcryptjs');
  
  const hash = await bcrypt.hash(password, 12);
  const token = (await import('crypto')).randomBytes(32).toString('hex');
  
  console.log('\n✅ Admin credentials generated successfully!\n');
  console.log('Add these to your .env.local file:\n');
  console.log('='.repeat(50));
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`ADMIN_TOKEN=${token}`);
  console.log('='.repeat(50));
  console.log('\n⚠️  IMPORTANT:');
  console.log('   • Never commit .env.local to version control');
  console.log('   • Add .env.local to .gitignore');
  console.log('   • Store ADMIN_TOKEN securely (needed for login)\n');
}

main().catch(console.error);
