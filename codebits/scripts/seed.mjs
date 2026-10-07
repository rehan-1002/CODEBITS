import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, sparse: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    department: { type: String },
  },
  { timestamps: true }
);

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    scheme: { type: String, default: 'Mumbai University' },
    category: { type: String, required: true },
    file_url: { type: String, required: true },
    file_size: { type: Number, default: 0 },
    page_count: { type: Number, default: 1 },
    uploader_id: { type: String, required: true },
    uploader_name: { type: String, required: true },
    uploader_role: { type: String, default: 'admin' },
    status: { type: String, default: 'approved' },
    view_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);

const sampleResources = [
  {
    title: 'Applied Mathematics IV - End Sem Question Paper (May 2024)',
    subject: 'Applied Mathematics IV',
    branch: 'COMPS',
    semester: 4,
    scheme: 'Mumbai University',
    category: 'pyq',
    file_url: '/uploads/doc_1791310899685_abb561ddb125.pdf',
    file_size: 2041721,
    page_count: 8,
    uploader_id: 'admin_mrf',
    uploader_name: 'Prof. Rohit Falake (M.R.F)',
    uploader_role: 'admin',
    status: 'approved',
    view_count: 142,
  },
  {
    title: 'Data Structures & Algorithms - Module 1 to 4 Comprehensive Notes',
    subject: 'Data Structures',
    branch: 'COMPS',
    semester: 3,
    scheme: 'Mumbai University',
    category: 'notes',
    file_url: '/uploads/doc_1791310916861_103943f51097.pdf',
    file_size: 2041721,
    page_count: 24,
    uploader_id: 'admin_mrf',
    uploader_name: 'Prof. Bharat Acharya',
    uploader_role: 'admin',
    status: 'approved',
    view_count: 320,
  },
  {
    title: 'Artificial Intelligence & Machine Learning - Verified PYQ Solutions',
    subject: 'Artificial Intelligence',
    branch: 'AI-DS',
    semester: 6,
    scheme: 'Mumbai University',
    category: 'solution',
    file_url: '/uploads/doc_1791311155704_61066e727a63.pdf',
    file_size: 2041721,
    page_count: 16,
    uploader_id: 'admin_mrf',
    uploader_name: 'Prof. Sameer Velenkar',
    uploader_role: 'admin',
    status: 'approved',
    view_count: 98,
  },
  {
    title: 'Database Management Systems - MU Official Syllabus & Blueprint',
    subject: 'Database Management Systems',
    branch: 'IT',
    semester: 4,
    scheme: 'Mumbai University',
    category: 'syllabus',
    file_url: '/uploads/doc_1791311484310_33ac3381de52.pdf',
    file_size: 2055073,
    page_count: 12,
    uploader_id: 'admin_mrf',
    uploader_name: 'Prof. Rohit Falake (M.R.F)',
    uploader_role: 'admin',
    status: 'approved',
    view_count: 215,
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected successfully to database:', mongoose.connection.name);

    // 1. Seed / verify Admin User
    const existingAdmin = await User.findOne({
      $or: [{ username: 'codebits' }, { phone: '9920336099' }],
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('codebits@mrf', salt);
      await User.create({
        fullName: 'Prof. Rohit Falake (M.R.F)',
        username: 'codebits',
        email: 'mrf@codebits.ac.in',
        phone: '9920336099',
        passwordHash,
        role: 'admin',
        department: 'Computer Engineering',
      });
      console.log('✅ Admin user created: codebits (phone: 9920336099 / pass: codebits@mrf)');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Seed Resources if none exist
    const count = await Resource.countDocuments();
    console.log(`Current resource count in DB: ${count}`);

    if (count === 0) {
      await Resource.insertMany(sampleResources);
      console.log(`✅ Seeded ${sampleResources.length} approved academic resources into Vault!`);
    } else {
      console.log('ℹ️ Resources already exist in database.');
    }

    console.log('\n🎉 Database sync completed successfully!');
  } catch (err) {
    console.error('❌ Database sync error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
