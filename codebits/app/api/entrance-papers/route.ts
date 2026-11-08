import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { EntrancePaperModel } from '@/models/EntrancePaper';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('examType');
    const subject = searchParams.get('subject');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    const hasSolutions = searchParams.get('hasSolutions');

    const filter: Record<string, any> = { status: 'approved' };

    if (examType && examType !== 'ALL') {
      filter.examType = examType;
    }

    if (subject && subject !== 'ALL') {
      filter.subject = subject;
    }

    if (year && year !== 'ALL') {
      filter.year = parseInt(year, 10);
    }

    if (hasSolutions === 'true') {
      filter.hasSolutions = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { session: { $regex: q, $options: 'i' } },
        { shift: { $regex: q, $options: 'i' } },
      ];
    }

    const papers = await EntrancePaperModel.find(filter)
      .sort({ year: -1, examType: 1, subject: 1 })
      .lean();

    // Compute distinct metadata for filters
    const stats = await EntrancePaperModel.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$examType',
          count: { $sum: 1 },
          questions: { $sum: '$questionCount' },
        },
      },
    ]);

    const examStats: Record<string, { count: number; questions: number }> = {};
    let totalQuestions = 0;
    stats.forEach((s) => {
      examStats[s._id] = { count: s.count, questions: s.questions };
      totalQuestions += s.questions;
    });

    return NextResponse.json({
      success: true,
      total: papers.length,
      totalQuestions,
      examStats,
      papers,
    });
  } catch (err: any) {
    console.error('Error fetching entrance papers:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch entrance papers' },
      { status: 500 }
    );
  }
}

