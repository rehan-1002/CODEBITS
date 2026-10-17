"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Radio,
  ExternalLink,
  Search,
  Filter,
  Play,
  User,
  GraduationCap,
  Sparkles,
} from "lucide-react";

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
const SEMESTERS = ["ALL", "1", "2", "3", "4", "5", "6", "7", "8"];

export default function LecturesPage() {
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [liveSession, setLiveSession] = useState<LectureItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedSem, setSelectedSem] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchLectures() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBranch !== "ALL") params.append("branch", selectedBranch);
      if (selectedSem !== "ALL") params.append("semester", selectedSem);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`/api/lectures?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLectures(data.lectures || []);
        setLiveSession(data.live || null);
      }
    } catch (err) {
      console.error("Error fetching lectures:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLectures();
  }, [selectedBranch, selectedSem]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLectures();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/35 text-[var(--brand-primary)] font-mono text-xs uppercase tracking-wider font-semibold">
              OFFICIAL VIDEO ARCHIVE
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              MUMBAI UNIVERSITY SYLLABUS
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
            Lectures &amp; Live Streams
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Curated video lectures, formula marathons, and live revision broadcasts by Prof. Rohit Falake (M.R.F) and verified faculty, hosted on the official CodeBits YouTube channel.
          </p>
        </div>

        {/* 
          ========================================================================
          LIVE BROADCAST SPOTLIGHT HERO
          Appears automatically when an active live stream is broadcasting
          ========================================================================
        */}
        {liveSession && (
          <div className="relative rounded-3xl overflow-hidden border border-red-500/40 bg-gradient-to-br from-red-600/15 via-[#0D1411] to-[#080D0B] p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            {/* Top corner live indicator */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 animate-pulse" />
                  LIVE NOW ON YOUTUBE
                </span>
              </div>

              <span className="font-mono text-xs text-[var(--text-muted)] hidden sm:inline">
                SUPERVISED BY PROF. MRF
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
              {/* Thumbnail with Click to YouTube */}
              <div className="lg:col-span-7">
                <a
                  href={liveSession.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-video rounded-2xl overflow-hidden border border-white/15 group shadow-2xl"
                >
                  <img
                    src={liveSession.thumbnailUrl}
                    alt={liveSession.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Dark scrim overlay */}
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all duration-300">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-xs flex items-center gap-1.5">
                    <YouTubeIcon className="w-4 h-4 text-red-500" />
                    <span>Watch Live Broadcast</span>
                  </div>
                </a>
              </div>

              {/* Broadcast Details */}
              <div className="lg:col-span-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/40 text-[var(--brand-primary)] font-mono text-xs font-bold">
                      {liveSession.branch}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white font-mono text-xs">
                      SEM {liveSession.semester}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {liveSession.title}
                  </h2>
                  <p className="text-sm font-mono text-[var(--brand-primary)] font-semibold">
                    {liveSession.subject}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Conducted by <span className="text-white font-medium">{liveSession.faculty}</span>
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={liveSession.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:scale-105 cursor-pointer"
                  >
                    <span>JOIN LIVE STREAM ON YOUTUBE</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 
          ========================================================================
          FILTER & SEARCH TOOLBAR
          ========================================================================
        */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0B120E]/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-sm">
          {/* Branch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {BRANCHES.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  selectedBranch === b
                    ? "bg-[var(--brand-primary)] text-black font-bold shadow-sm"
                    : "bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {b === "ALL" ? "ALL BRANCH" : b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Semester Dropdown */}
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-mono border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()}>
                  Semester {s}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lectures..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        {/* 
          ========================================================================
          VIDEO LECTURE GRID
          ========================================================================
        */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              Curated Video Lectures ({lectures.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[var(--text-muted)]">
              Loading YouTube lectures...
            </div>
          ) : lectures.length === 0 ? (
            <div className="p-16 rounded-3xl border border-dashed border-black/15 dark:border-white/15 text-center space-y-3">
              <YouTubeIcon className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-30" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                No videos found for this filter.
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Check back shortly or reset your branch/semester filter to view available Mumbai University lecture sessions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map((item) => (
                <a
                  key={item._id}
                  href={item.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0B120E]/85 backdrop-blur-2xl overflow-hidden flex flex-col justify-between shadow-md hover:border-[var(--brand-primary)]/70 hover:shadow-[0_12px_36px_rgba(0,194,105,0.15)] transition-all duration-300 transform-gpu hover:-translate-y-1 cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* YouTube Thumbnail with Hover Play Button */}
                    <div className="aspect-video relative overflow-hidden bg-black/20">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.7)] transition-all">
                          <Play className="w-6 h-6 ml-0.5 fill-white" />
                        </div>
                      </div>

                      {item.isLive && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          LIVE NOW
                        </div>
                      )}

                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white font-mono text-[10px] flex items-center gap-1">
                        <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
                        <span>YouTube</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/35 text-[var(--brand-primary)] font-mono text-[11px] font-bold">
                          {item.branch === "ALL" ? "ALL BRANCH" : item.branch}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-secondary)] font-mono text-[11px]">
                          SEM {item.semester}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs font-mono text-[var(--brand-primary)] font-semibold">
                        {item.subject}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] pt-1">
                        <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span className="truncate">{item.faculty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono font-bold text-[var(--brand-primary)]">
                      <span>WATCH ON YOUTUBE</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
