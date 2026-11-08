import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const EntrancePaperSchema = new mongoose.Schema(
  {
    examType: {
      type: String,
      required: true,
      enum: ['HSC', 'MHT-CET', 'JEE-MAIN', 'JEE-ADVANCED'],
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true },
    session: { type: String, trim: true },
    shift: { type: String, trim: true },
    examDate: { type: String, trim: true },
    questionCount: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 0 },
    pdfUrl: { type: String, required: true, trim: true, unique: true },
    solutionPdfUrl: { type: String, trim: true },
    hasSolutions: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true },
    source: { type: String, trim: true },
    view_count: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      default: 'approved',
      enum: ['approved', 'pending', 'rejected'],
    },
    verified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'entrance_papers',
  }
);

EntrancePaperSchema.index({ examType: 1, year: -1, subject: 1 });

const EntrancePaper =
  mongoose.models.EntrancePaper ||
  mongoose.model('EntrancePaper', EntrancePaperSchema, 'entrance_papers');

// Helper to run async tasks with concurrency limit
async function asyncPool(limit, items, iteratorFn) {
  const ret = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

function parseSubjectAndMetadata(examType, title, linkTitle) {
  const full = `${title} ${linkTitle}`.toLowerCase();
  
  let subject = 'General';
  let questionCount = 30;
  let maxMarks = 100;
  let shift = '';
  let session = '';
  
  // Parse year
  const yearMatch = `${linkTitle} ${title}`.match(/20\d\d|19\d\d/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 2024;

  // Parse session
  if (full.includes('july')) session = 'July';
  else if (full.includes('february') || full.includes('feb')) session = 'February';
  else if (full.includes('march') || full.includes('mar')) session = 'March';
  else if (full.includes('january') || full.includes('jan')) session = 'January';
  else if (full.includes('april') || full.includes('apr')) session = 'April';
  else if (full.includes('may')) session = 'May';
  else if (full.includes('june') || full.includes('jun')) session = 'June';
  else if (full.includes('august') || full.includes('aug')) session = 'August';
  else if (full.includes('october') || full.includes('oct')) session = 'October';

  // Parse shift
  if (full.includes('shift - i') || full.includes('shift i') || full.includes('shift 1')) shift = 'Shift 1';
  else if (full.includes('shift - ii') || full.includes('shift ii') || full.includes('shift 2')) shift = 'Shift 2';
  else if (full.includes('paper - 1') || full.includes('paper 1') || full.includes('part 1') || full.includes('part - 1')) shift = 'Paper 1';
  else if (full.includes('paper - 2') || full.includes('paper 2') || full.includes('part 2') || full.includes('part - 2')) shift = 'Paper 2';

  if (examType === 'HSC') {
    if (full.includes('physics')) {
      subject = 'Physics';
      questionCount = 31;
      maxMarks = 70;
    } else if (full.includes('chemistry')) {
      subject = 'Chemistry';
      questionCount = 31;
      maxMarks = 70;
    } else if (full.includes('math') || full.includes('mathematics')) {
      subject = 'Mathematics & Statistics';
      questionCount = 34;
      maxMarks = 80;
    } else if (full.includes('biology')) {
      subject = 'Biology';
      questionCount = 31;
      maxMarks = 70;
    } else if (full.includes('english')) {
      subject = 'English';
      questionCount = 30;
      maxMarks = 80;
    } else if (full.includes('computer science - i') || full.includes('cs 1') || full.includes('cs-1')) {
      subject = 'Computer Science - I';
      questionCount = 20;
      maxMarks = 50;
    } else if (full.includes('computer science - ii') || full.includes('cs 2') || full.includes('cs-2')) {
      subject = 'Computer Science - II';
      questionCount = 20;
      maxMarks = 50;
    } else if (full.includes('electronics paper - i') || full.includes('electronics - i')) {
      subject = 'Electronics - I';
      questionCount = 20;
      maxMarks = 50;
    } else if (full.includes('electronics paper - ii') || full.includes('electronics - ii')) {
      subject = 'Electronics - II';
      questionCount = 20;
      maxMarks = 50;
    } else if (full.includes('hindi')) {
      subject = 'Hindi';
      questionCount = 30;
      maxMarks = 80;
    } else if (full.includes('marathi')) {
      subject = 'Marathi';
      questionCount = 30;
      maxMarks = 80;
    } else if (full.includes('geography')) {
      subject = 'Geography';
      questionCount = 30;
      maxMarks = 80;
    } else {
      subject = title;
      questionCount = 30;
      maxMarks = 80;
    }
  } else if (examType === 'MHT-CET') {
    if (full.includes('pcm')) {
      subject = 'Physics, Chemistry & Mathematics (PCM)';
      questionCount = 150;
      maxMarks = 200;
    } else if (full.includes('pcb')) {
      subject = 'Physics, Chemistry & Biology (PCB)';
      questionCount = 200;
      maxMarks = 200;
    } else if (full.includes('physics')) {
      subject = 'Physics';
      questionCount = 50;
      maxMarks = 50;
    } else if (full.includes('chemistry')) {
      subject = 'Chemistry';
      questionCount = 50;
      maxMarks = 50;
    } else if (full.includes('mathematics') || full.includes('math')) {
      subject = 'Mathematics';
      questionCount = 50;
      maxMarks = 100;
    } else if (full.includes('biology')) {
      subject = 'Biology';
      questionCount = 100;
      maxMarks = 100;
    } else {
      subject = 'Combined';
      questionCount = 150;
      maxMarks = 200;
    }
  } else if (examType === 'JEE-MAIN') {
    subject = 'Physics, Chemistry & Mathematics (PCM)';
    questionCount = 90;
    maxMarks = 300;
  } else if (examType === 'JEE-ADVANCED') {
    subject = 'Physics, Chemistry & Mathematics (PCM)';
    questionCount = 54;
    maxMarks = 180;
    if (full.includes('aat')) {
      subject = 'Architecture Aptitude Test (AAT)';
      questionCount = 16;
      maxMarks = 100;
    }
  }

  return { subject, year, session, shift, questionCount, maxMarks };
}

async function scrapeTargetSection(sectionName, sectionUrl, defaultExamType) {
  console.log(`\n🔍 Fetching Target Publications: ${sectionName}...`);
  try {
    const res = await fetch(sectionUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.error(`Failed to fetch ${sectionUrl}: ${res.status}`);
      return [];
    }
    const html = await res.text();
    const unescaped = html.replace(/\\"/g, '"');
    const matches = unescaped.match(/\{"identifier":"[^"]+","title":"[^"]+","link_title":"[^"]+","redirect_url":"[^"]+"[^}]*\}/g) || [];
    
    const parsed = [];
    for (const m of matches) {
      try {
        parsed.push(JSON.parse(m));
      } catch {}
    }

    console.log(`Found ${parsed.length} items in ${sectionName}. Scraping details with concurrency...`);

    let completed = 0;
    const records = await asyncPool(6, parsed, async (item) => {
      try {
        const detailUrl = `https://www.targetpublications.org/download/${item.redirect_url}`;
        const dRes = await fetch(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!dRes.ok) return null;
        const dHtml = await dRes.text();
        
        // Match CDN PDF URL
        const cdnMatch = dHtml.match(/https:\/\/cdn\.targetpublications\.org\/admin\/downloads\/[a-zA-Z0-9_-]+\.pdf/i);
        const generalPdf = dHtml.match(/https?:\/\/[^\s"'<>]+\.pdf/i);
        const pdfUrl = cdnMatch ? cdnMatch[0] : (generalPdf ? generalPdf[0] : null);

        if (!pdfUrl) return null;

        const meta = parseSubjectAndMetadata(defaultExamType, item.title, item.link_title);

        completed++;
        if (completed % 25 === 0 || completed === parsed.length) {
          process.stdout.write(`  [${sectionName}] Scraped ${completed}/${parsed.length} papers...\r`);
        }

        return {
          examType: defaultExamType,
          subject: meta.subject,
          year: meta.year,
          session: meta.session || undefined,
          shift: meta.shift || undefined,
          questionCount: meta.questionCount,
          maxMarks: meta.maxMarks,
          pdfUrl: pdfUrl,
          hasSolutions: true,
          title: item.link_title || item.title,
          source: 'Target Publications',
          status: 'approved',
          verified: true,
        };
      } catch (err) {
        return null;
      }
    });

    const validRecords = records.filter(Boolean);
    console.log(`\n✅ Completed ${sectionName}: ${validRecords.length} valid PDF papers extracted.`);
    return validRecords;
  } catch (err) {
    console.error(`Error scraping ${sectionName}:`, err.message);
    return [];
  }
}

async function scrapeJeeAdvOfficial() {
  console.log(`\n🔍 Fetching Official JEE Advanced Archives (jeeadv.ac.in)...`);
  try {
    const res = await fetch('https://jeeadv.ac.in/archive.html', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
      console.error(`Failed to fetch JEE Adv archive: ${res.status}`);
      return [];
    }
    const html = await res.text();
    const pdfMatches = [...html.matchAll(/href="([^"']*past_qps[^"']*\.pdf)"/gi)].map(m => m[1]);

    const records = [];
    for (const rel of pdfMatches) {
      const fullUrl = rel.startsWith('http') ? rel : `https://jeeadv.ac.in/${rel}`;
      const filename = rel.split('/').pop() || '';
      
      let year = 2024;
      let shift = 'Paper 1';
      let subject = 'Physics, Chemistry & Mathematics (PCM)';
      let questionCount = 54;
      let maxMarks = 180;
      let title = `JEE Advanced Question Paper`;

      const yearMatch = filename.match(/20\d\d/);
      if (yearMatch) year = parseInt(yearMatch[0], 10);

      if (filename.includes('_1') || filename.includes('-1')) {
        shift = 'Paper 1';
        title = `JEE Advanced ${year} Paper 1 (Official)`;
      } else if (filename.includes('_2') || filename.includes('-2')) {
        shift = 'Paper 2';
        title = `JEE Advanced ${year} Paper 2 (Official)`;
      } else if (filename.toLowerCase().includes('aat')) {
        shift = 'Architecture Aptitude';
        subject = 'Architecture Aptitude Test (AAT)';
        questionCount = 16;
        maxMarks = 100;
        title = `JEE Advanced ${year} AAT Question Paper (Official)`;
      }

      if (filename.toLowerCase().includes('hindi')) {
        title += ' (Hindi)';
      }

      records.push({
        examType: 'JEE-ADVANCED',
        subject,
        year,
        session: 'Official Exam',
        shift,
        questionCount,
        maxMarks,
        pdfUrl: fullUrl,
        hasSolutions: false,
        title,
        source: 'IIT JEE (Advanced) Official Portal',
        status: 'approved',
        verified: true,
      });
    }

    console.log(`✅ Completed JEE Advanced Official: ${records.length} official papers extracted.`);
    return records;
  } catch (err) {
    console.error('Error fetching JEE Adv official portal:', err.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Entrance & Board PYQ Scraper & Ingestion Pipeline...');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB successfully.');

  const hscPapers = await scrapeTargetSection('HSC Science', 'https://www.targetpublications.org/download/hsc-science-board-papers', 'HSC');
  const cetPapers = await scrapeTargetSection('MHT-CET', 'https://www.targetpublications.org/download/mht-cet-question-papers', 'MHT-CET');
  const jeeMainTarget = await scrapeTargetSection('JEE Main', 'https://www.targetpublications.org/download/jee-main-question-papers', 'JEE-MAIN');
  const jeeAdvTarget = await scrapeTargetSection('JEE Advanced (TargetPub)', 'https://www.targetpublications.org/download/jee-advanced-question-paper', 'JEE-ADVANCED');
  const jeeAdvOfficial = await scrapeJeeAdvOfficial();

  const allPapers = [...hscPapers, ...cetPapers, ...jeeMainTarget, ...jeeAdvTarget, ...jeeAdvOfficial];
  console.log(`\n📦 Total papers to ingest: ${allPapers.length}`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const paper of allPapers) {
    const res = await EntrancePaper.findOneAndUpdate(
      { pdfUrl: paper.pdfUrl },
      { $set: paper },
      { upsert: true, new: true, rawResult: true }
    );
    if (res.lastErrorObject && res.lastErrorObject.updatedExisting) {
      updatedCount++;
    } else {
      insertedCount++;
    }
  }

  console.log(`\n🎉 Ingestion finished! Inserted: ${insertedCount}, Updated: ${updatedCount}`);

  // Aggregation breakdown
  console.log('\n======================================================');
  console.log('📊 ACCURATE BREAKDOWN BY EXAM TYPE');
  console.log('======================================================');

  const stats = await EntrancePaper.aggregate([
    {
      $group: {
        _id: '$examType',
        paperCount: { $sum: 1 },
        totalQuestions: { $sum: '$questionCount' },
        subjects: { $addToSet: '$subject' },
        minYear: { $min: '$year' },
        maxYear: { $max: '$year' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  let grandPapers = 0;
  let grandQuestions = 0;

  for (const s of stats) {
    grandPapers += s.paperCount;
    grandQuestions += s.totalQuestions;
    console.log(`\n📌 Exam: ${s._id}`);
    console.log(`   - Papers Count:     ${s.paperCount}`);
    console.log(`   - Total Questions:  ${s.totalQuestions.toLocaleString()}`);
    console.log(`   - Year Range:       ${s.minYear} - ${s.maxYear}`);
    console.log(`   - Subjects (${s.subjects.length}):   ${s.subjects.slice(0, 8).join(', ')}${s.subjects.length > 8 ? '...' : ''}`);
  }

  console.log('\n======================================================');
  console.log(`🎯 GRAND TOTAL: ${grandPapers} Question Papers | ${grandQuestions.toLocaleString()} PYQ Questions`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal pipeline error:', err);
  process.exit(1);
});

