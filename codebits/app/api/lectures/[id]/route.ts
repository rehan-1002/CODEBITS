import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Lecture } from "@/models/Lecture";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

// PATCH: Toggle live stream status or update lecture details (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    await connectToDatabase();

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return NextResponse.json(
        { success: false, error: "Lecture not found." },
        { status: 404 }
      );
    }

    if (typeof body.isLive === "boolean") {
      if (body.isLive) {
        // Unset any other live lectures first
        await Lecture.updateMany({ _id: { $ne: id }, isLive: true }, { isLive: false });
      }
      lecture.isLive = body.isLive;
    }

    if (body.title) lecture.title = body.title.trim();
    if (body.subject) lecture.subject = body.subject.trim();
    if (body.faculty) lecture.faculty = body.faculty.trim();
    if (body.branch) lecture.branch = body.branch;
    if (body.semester) lecture.semester = Number(body.semester) as any;

    await lecture.save();

    return NextResponse.json({
      success: true,
      message: lecture.isLive ? "Marked as LIVE NOW!" : "Live broadcast ended.",
      lecture,
    });
  } catch (error: any) {
    console.error("PATCH /api/lectures/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lecture." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a lecture link (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const deleted = await Lecture.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Lecture not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lecture link removed successfully.",
    });
  } catch (error: any) {
    console.error("DELETE /api/lectures/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lecture." },
      { status: 500 }
    );
  }
}
