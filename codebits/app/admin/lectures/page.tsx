"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Radio,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  Lock,
  LogIn,
} from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "@/models/Lecture";
import { getCurrentUser, loginWithApi, fetchCurrentAuthUser } from "@/lib/auth";
import { Profile } from "@/types/auth";

function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface LectureItem {
  _id: string;
  title: string;
  subject: string;
  faculty: string;
  branch: string;
  semester: number;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  isLive: boolean;
  createdAt: string;
}

const BRANCHES = ["ALL", "COMPS", "IT", "AI-DS", "EXTC", "MECH", "CIVIL"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const FACULTY_PRESETS = [
  "Prof. Rohit Falake (M.R.F)",
  "Prof. Om Baviskar",
  "Prof. Bharat Acharya",
  "Prof. Sameer Velenkar",
  "Prof. Prashant Patil",
  "Prof. Sunil Nagare",
  "Prof. Vineet Kutty",
  "Prof. Rahul Jadhav",
];

export default function AdminLecturesPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Admin login form states
  const [adminId, setAdminId] = useState("CODEBITS");
  const [adminPass, setAdminPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Lectures state
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [liveSession, setLiveSession] = useState<LectureItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form inputs
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [faculty, setFaculty] = useState("Prof. Rohit Falake (M.R.F)");
  const [branch, setBranch] = useState("ALL");
  const [semester, setSemester] = useState(3);
  const [isLive, setIsLive] = useState(false);

  // Live preview ID
  const previewId = extractYouTubeId(youtubeUrl);
  const previewThumbnail = previewId ? getYouTubeThumbnail(previewId) : null;

  useEffect(() => {
    fetchCurrentAuthUser().then((u) => {
      setUser(u || getCurrentUser());
      setAuthChecking(false);
    });
  }, []);

  async function fetchLectures() {
    try {
      setLoading(true);
      const res = await fetch("/api/lectures");
      const data = await res.json();
      if (data.success) {
        setLectures(data.lectures || []);
        setLiveSession(data.live || null);
      }
    } catch (err: any) {
      console.error("Failed to load lectures:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLectures();
  }, []);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await loginWithApi(
        adminId.trim(),
        adminPass.trim(),
        true
      );

      if (!res.success || !res.user) {
        setLoginError(res.error || "Invalid administrator credentials.");
        return;
      }

      if (res.user.role !== "admin") {
        setLoginError("Account does not have administrator privileges.");
        return;
      }

      setUser(res.user);
      await fetchLectures();
    } catch (err: any) {
      setLoginError(err?.message || "Login request failed.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!youtubeUrl.trim() || !title.trim() || !subject.trim()) {
      setError("Please fill in Title, Subject, and YouTube URL.");
      return;
    }

    if (!previewId) {
      setError("Invalid YouTube URL. Please check the link.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          faculty,
          branch,
          semester,
          youtubeUrl,
          isLive,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 403) {
          setError("Admin authorization required. Please log in as an administrator first.");
        } else {
          setError(data.error || "Failed to add lecture link.");
        }
        return;
      }

      setSuccessMsg(data.message || "Lecture added successfully!");
      setYoutubeUrl("");
      setTitle("");
      setSubject("");
      setIsLive(false);
      await fetchLectures();
    } catch (err: any) {
      setError(err?.message || "Communication error with server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleLive(id: string, currentLiveState: boolean) {
    try {
      const res = await fetch(`/api/lectures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: !currentLiveState }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to toggle live state.");
        return;
      }
      await fetchLectures();
    } catch (err) {
      alert("Error toggling live status.");
    }
  }

  async function handleDelete(id: string, itemTitle: string) {
    if (!confirm(`Are you sure you want to remove "${itemTitle}"?`)) return;

    try {
      const res = await fetch(`/api/lectures/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete lecture.");
        return;
      }
      await fetchLectures();
    } catch (err) {
      alert("Error deleting lecture.");
    }
  }

  // If not logged in as Admin, show high-contrast inline login portal
  if (!authChecking && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-[#0B120E]/80 border border-black/10 dark:border-white/10 p-8 shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 text-[var(--brand-primary)] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Authentication required to manage YouTube lectures and live broadcasts.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1 font-semibold">
                USERNAME OR PHONE
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="CODEBITS or 9920336099"
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1 font-semibold">
                ADMIN PASSWORD
              </label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-ambient,#34EE99)] text-[#05130D] font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md hover:scale-[1.01]"
            >
              {loginLoading ? "VERIFYING CREDENTIALS..." : "ENTER BROADCAST CONSOLE"}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/lectures"
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1"
            >
              <span>&larr; Back to Public Lectures</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/40 text-[var(--brand-primary)] font-mono text-[10px] uppercase font-bold tracking-wider">
                ADMIN CONSOLE
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                YOUTUBE BROADCAST CONTROLLER
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Manage Lectures &amp; Live Streams
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/lectures"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:border-[var(--brand-primary)] text-[var(--text-primary)] transition-all"
            >
              <span>VIEW STUDENT PAGE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={fetchLectures}
              className="p-2 rounded-xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:text-[var(--brand-primary)] transition-colors"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Now Spotlight Status Banner */}
        {liveSession && (
          <div className="relative rounded-2xl bg-gradient-to-r from-red-600/15 via-red-500/10 to-transparent border border-red-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg overflow-hidden">
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] font-bold uppercase text-red-500 tracking-wider flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  CURRENTLY BROADCASTING LIVE TO STUDENTS
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">
                  {liveSession.title}
                </h3>
                <p className="text-xs font-mono text-[var(--text-secondary)]">
                  {liveSession.subject} &bull; {liveSession.faculty} ({liveSession.branch} - SEM {liveSession.semester})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 relative z-10 shrink-0">
              <a
                href={liveSession.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5 transition-colors"
              >
                <span>TEST ON YOUTUBE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleToggleLive(liveSession._id, true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                ⏹ END LIVE
              </button>
            </div>
          </div>
        )}

        {/* Add YouTube Video / Live Session Form */}
        <div className="relative rounded-3xl backdrop-blur-2xl bg-white/75 dark:bg-[#0B120E]/75 border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-xl overflow-hidden space-y-6">
          <div className="flex items-center gap-2.5 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] flex items-center justify-center">
              <YouTubeIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Add YouTube Video or Live Broadcast
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Paste any YouTube URL. The thumbnail is auto-extracted and loaded automatically.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Link & Metadata */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5 font-semibold">
                    YOUTUBE URL / SHARE LINK <span className="text-[var(--brand-primary)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-mono focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5 font-semibold">
                    VIDEO / STREAM TITLE <span className="text-[var(--brand-primary)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Applied Mathematics 3 – Fourier Series Rapid Revision"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5 font-semibold">
                      SUBJECT NAME <span className="text-[var(--brand-primary)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Applied Mathematics III"
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5 font-semibold">
                      FACULTY NAME
                    </label>
                    <select
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm focus:outline-none focus:border-[var(--brand-primary)] transition-all cursor-pointer"
                    >
                      {FACULTY_PRESETS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5 font-semibold">
                      ACADEMIC BRANCH
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-mono focus:outline-none focus:border-[var(--brand-primary)] transition-all cursor-pointer"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b === "ALL" ? "ALL BRANCHES (Common / FE)" : b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[var(--text-secondary)] mb-1.5 font-semibold">
                      SEMESTER
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-mono focus:outline-none focus:border-[var(--brand-primary)] transition-all cursor-pointer"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Live Thumbnail Preview */}
              <div className="space-y-4">
                <label className="block text-xs font-mono text-[var(--text-secondary)] font-semibold">
                  THUMBNAIL PREVIEW
                </label>

                <div className="aspect-video w-full rounded-2xl border border-black/15 dark:border-white/15 bg-black/10 dark:bg-black/40 flex items-center justify-center overflow-hidden relative group">
                  {previewThumbnail ? (
                    <>
                      <img
                        src={previewThumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                          <YouTubeIcon className="w-6 h-6" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-xs font-mono text-[var(--text-muted)] space-y-2">
                      <YouTubeIcon className="w-8 h-8 mx-auto opacity-30 text-red-500" />
                      <p>Paste a YouTube URL to generate live preview</p>
                    </div>
                  )}
                </div>

                {/* Mark as Live Broadcast Toggle */}
                <div
                  onClick={() => setIsLive(!isLive)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isLive
                      ? "border-red-500 bg-red-500/10 text-red-500 font-semibold"
                      : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className={`w-4 h-4 ${isLive ? "animate-pulse text-red-500" : ""}`} />
                    <span className="text-xs font-mono">
                      {isLive ? "🔴 SET AS LIVE STREAM NOW" : "MARK AS LIVE BROADCAST"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLive}
                    onChange={(e) => setIsLive(e.target.checked)}
                    className="w-4 h-4 accent-red-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-ambient,#34EE99)] text-[#05130D] text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <span>{submitting ? "PUBLISHING LINK..." : "PUBLISH TO CODEBITS"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Existing Lectures / Archive Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              Published YouTube Sessions ({lectures.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center font-mono text-xs text-[var(--text-muted)]">
              Loading YouTube sessions from database...
            </div>
          ) : lectures.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-black/15 dark:border-white/15 text-center space-y-2">
              <YouTubeIcon className="w-10 h-10 mx-auto text-[var(--text-muted)] opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No YouTube lectures added yet.
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Paste any YouTube video or live stream link above to make it accessible to Mumbai University students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lectures.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#0E1512] overflow-hidden flex flex-col justify-between shadow-sm hover:border-[var(--brand-primary)]/50 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Thumbnail with Live Badge */}
                    <div className="aspect-video relative overflow-hidden bg-black/10">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.isLive && (
                        <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          LIVE NOW
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[10px]">
                        YouTube
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-mono text-[10px] font-bold">
                          {item.branch}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-mono text-[10px]">
                          SEM {item.semester}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs font-mono text-[var(--brand-primary)] font-medium">
                        {item.subject}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {item.faculty}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
                    <button
                      onClick={() => handleToggleLive(item._id, item.isLive)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                        item.isLive
                          ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
                          : "bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-red-500"
                      }`}
                    >
                      {item.isLive ? "⏹ End Live" : "🔴 Set Live"}
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"
                        title="Delete Lecture Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
