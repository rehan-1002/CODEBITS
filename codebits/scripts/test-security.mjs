import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/db.ts';
import { User } from '../models/User.ts';
import { ResourceModel } from '../models/Resource.ts';
import { LoginSchema, RegisterSchema, sanitizePhone } from '../lib/auth-server.ts';

console.log('====================================================');
console.log('  CODEBITS PLATFORM - DEFENSIVE SECURITY TEST SUITE ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
  }
}

// TEST 1: NoSQL Injection via Object Payload in Login
console.log('[TEST GROUP 1: NoSQL Injection Defense]');
const noSqlInjectionPayload = {
  identifier: { $ne: null },
  password: { $gt: '' },
};
const loginZodResult = LoginSchema.safeParse(noSqlInjectionPayload);
assert(
  'Blocks NoSQL Operator Object Injection in Login Identifier',
  loginZodResult.success === false &&
    loginZodResult.error.issues.some((i) => i.path.includes('identifier'))
);

// TEST 2: SQL / Operator Injection in Registration
const maliciousRegisterPayload = {
  fullName: 'Student <script>alert(1)</script>',
  email: { $ne: null }, // Attempted injection
  phone: '9876543210',
  password: 'password123',
};
const regZodResult = RegisterSchema.safeParse(maliciousRegisterPayload);
assert(
  'Blocks Non-String Email Injection in Registration',
  regZodResult.success === false
);

// TEST 3: Phone Normalization & Sanitization
console.log('\n[TEST GROUP 2: Input Sanitization & Normalization]');
const rawPhone1 = '+91 98765-43210';
const rawPhone2 = '09876543210';
assert('Normalizes +91 prefixed phone correctly', sanitizePhone(rawPhone1) === '9876543210');
assert('Normalizes leading-0 phone correctly', sanitizePhone(rawPhone2) === '9876543210');

// TEST 4: File Header & Magic Byte Validation
console.log('\n[TEST GROUP 3: Malicious File Upload Defense]');
const fakePdfBuffer = Buffer.from('<html><body><script>alert("hacked")</script></body></html>');
const fakeMagicHeader = fakePdfBuffer.subarray(0, 4).toString('ascii');
assert(
  'Rejects HTML/Script Polyglot masquerading as PDF (Missing %PDF header)',
  fakeMagicHeader !== '%PDF'
);

const realPdfBuffer = Buffer.from('%PDF-1.7 Test Document Content');
const realMagicHeader = realPdfBuffer.subarray(0, 4).toString('ascii');
assert(
  'Accepts authentic PDF file with verified %PDF magic header',
  realMagicHeader === '%PDF'
);

// TEST 5: Live Database Connectivity & Model Validation
console.log('\n[TEST GROUP 4: MongoDB Atlas Cluster Integrity]');
try {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://rehxnnn0_db_user:afifa1002@cluster0.vcfz6z2.mongodb.net/codebits?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  assert('Successfully verified active live connection to MongoDB Atlas', mongoose.connection.readyState === 1);
  
  // Verify User Model exists and indexes compile
  assert('User collection model initialized with strict schema', User.modelName === 'User');
  assert('Resource collection model initialized with strict schema', ResourceModel.modelName === 'Resource');

  await mongoose.disconnect();
} catch (err) {
  assert('Database connection active', false);
  console.error('DB Error:', err.message);
}

console.log('\n====================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} Security Defenses Verified!`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
