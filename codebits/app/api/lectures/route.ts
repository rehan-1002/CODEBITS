import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Lecture, extractYouTubeId, getYouTubeThumbnail } from "@/models/Lecture";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

// GET: Fetch all lectures and active live stream
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const branch = url.searchParams.get("branch");
    const semester = url.searchParams.get("semester");
    const query = url.searchParams.get("q");

    const filter: Record<string, any> = {};

    if (branch && branch !== "ALL") {
      filter.$or = [{ branch }, { branch: "ALL" }];
    }

    if (semester && semester !== "ALL") {
      filter.semester = Number(semester);
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { subject: { $regex: query, $options: "i" } },
        { faculty: { $regex: query, $options: "i" } },
      ];
    }

    const [liveSession, lectures] = await Promise.all([
      Lecture.findOne({ isLive: true }).sort({ updatedAt: -1 }),
      Lecture.find(filter).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      live: liveSession,
      lectures,
    });
  } catch (error: any) {
    console.error("GET /api/lectures error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lectures." },
      { status: 500 }
    );
  }
}

// POST: Add a new YouTube video link or live broadcast (Admin only)
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, subject, faculty, branch, semester, youtubeUrl, isLive } = body;

    if (!title || !subject || !youtubeUrl) {
      return NextResponse.json(
        { success: false, error: "Title, Subject, and YouTube URL are required." },
        { status: 400 }
      );
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid YouTube URL. Please provide a valid YouTube watch link, youtu.be link, or live stream URL.",
        },
        { status: 422 }
      );
    }

    const thumbnailUrl = getYouTubeThumbnail(youtubeId);

    await connectToDatabase();

    // If marked as live, unset any existing live streams first
    if (isLive) {
      await Lecture.updateMany({ isLive: true }, { isLive: false });
    }

    const newLecture = await Lecture.create({
      title: title.trim(),
      subject: subject.trim(),
      faculty: faculty?.trim() || "Prof. Rohit Falake (M.R.F)",
      branch: branch || "ALL",
      semester: (Number(semester) || 1) as any,
      youtubeUrl: youtubeUrl.trim(),
      youtubeId,
      thumbnailUrl,
      isLive: Boolean(isLive),
    });

    return NextResponse.json({
      success: true,
      message: isLive ? "Live stream broadcast published!" : "Lecture link added successfully!",
      lecture: newLecture,
    });
  } catch (error: any) {
    console.error("POST /api/lectures error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create lecture link." },
      { status: 500 }
    );
  }
}
