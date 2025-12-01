"use client";

import React, { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth/auth-client";
import Header from "@/components/layout/Header";
import {
  User,
  Mail,
  LogOut,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  updatedAt: string | null;
}

interface Photo {
  id: string;
  fileName: string;
  originalUrl: string;
  width: number;
  height: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  // Gallery slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch("/api/resume/list");
        const data = await res.json();
        setResumes(data.resumes ?? []);
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (session) fetchResumes();
  }, [session]);

  // Fetch photos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/photos/library");
        const data = await res.json();
        setPhotos(data.photos ?? []);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoadingPhotos(false);
      }
    };

    if (session) fetchPhotos();
  }, [session]);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (
      !confirm(
        "Delete this photo? It will be removed from all resumes using it."
      )
    )
      return;

    setDeletingPhotoId(photoId);
    try {
      const res = await fetch(`/api/photos/${photoId}?force=true`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        if (currentSlide >= photos.length - 1) {
          setCurrentSlide(Math.max(0, photos.length - 2));
        }
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#FFA239] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Header Card */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFA239] via-[#FF5656] to-[#8CE4FF] opacity-90">
            <div className="absolute inset-0" />
          </div>

          <div className="relative h-40 sm:h-48" />

          <div className="relative px-6 sm:px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-16 left-6 sm:left-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        width={128}
                        height={128}
                        alt={session.user.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="pt-20 sm:pt-6 sm:pl-40">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {session.user.name}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2">
                    <Mail size={16} />
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-xl font-medium transition-all duration-300 group"
                >
                  <LogOut size={18} className="group-hover:animate-pulse" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Resumes",
              value: resumes.length,
              icon: FileText,
              color: "from-[#FFA239] to-[#FF5656]",
            },
            {
              label: "Photos",
              value: photos.length,
              icon: ImageIcon,
              color: "from-[#8CE4FF] to-[#3b82f6]",
            },
            {
              label: "Templates",
              value: "9+",
              icon: FolderOpen,
              color: "from-[#10b981] to-[#059669]",
            },
            {
              label: "Downloads",
              value: "∞",
              icon: Sparkles,
              color: "from-[#8b5cf6] to-[#6366f1]",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resumes Section */}
          <section className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    My Resumes
                  </h2>
                  <p className="text-sm text-gray-500">
                    {resumes.length} documents
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[#FFA239] hover:text-[#FF5656] transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              {loadingResumes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FFA239]" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No resumes yet</p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Create First Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {resumes.map((resume, index) => (
                    <Link
                      key={resume.id}
                      href={`/editor?resumeId=${resume.id}`}
                      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFA239]/5 hover:to-[#FF5656]/5 transition-all duration-300 border border-transparent hover:border-[#FFA239]/20"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-[#FFA239]/20 group-hover:to-[#FF5656]/20 transition-all duration-300">
                        <FileText
                          size={24}
                          className="text-gray-400 group-hover:text-[#FFA239] transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#FFA239] transition-colors">
                          {resume.title || "Untitled Resume"}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(resume.updatedAt)}
                        </p>
                      </div>
                      <ExternalLink
                        size={18}
                        className="text-gray-400 group-hover:text-[#FFA239] transition-colors opacity-0 group-hover:opacity-100"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Photo Gallery Section */}
          <section className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8CE4FF] to-[#3b82f6] flex items-center justify-center">
                  <ImageIcon size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Photo Gallery
                  </h2>
                  <p className="text-sm text-gray-500">
                    {photos.length}/5 photos used
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingPhotos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8CE4FF]" />
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">No photos uploaded</p>
                  <p className="text-sm text-gray-400">
                    Upload photos when editing a resume
                  </p>
                </div>
              ) : (
                <>
                  {/* Slider */}
                  <div
                    className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square mb-4 group"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                  >
                    <div
                      ref={sliderRef}
                      className="flex transition-transform duration-500 ease-out h-full"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="min-w-full h-full relative"
                        >
                          <img
                            src={photo.originalUrl}
                            alt={photo.fileName}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                              <div className="text-white">
                                <p className="font-medium truncate">
                                  {photo.fileName}
                                </p>
                                <p className="text-sm text-white/80">
                                  {photo.width} × {photo.height}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePhoto(photo.id);
                                }}
                                disabled={deletingPhotoId === photo.id}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors disabled:opacity-50"
                              >
                                {deletingPhotoId === photo.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <ChevronLeft size={24} className="text-gray-700" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <ChevronRight size={24} className="text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Slide Counter */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      {currentSlide + 1} / {photos.length}
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setCurrentSlide(index);
                        }}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                          currentSlide === index
                            ? "ring-2 ring-[#8CE4FF] ring-offset-2 scale-105"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo.originalUrl}
                          alt={photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setCurrentSlide(index);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentSlide === index
                            ? "w-8 bg-gradient-to-r from-[#8CE4FF] to-[#3b82f6]"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Storage Usage Bar */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Storage Usage</h3>
            <span className="text-sm text-gray-500">
              {photos.length} / 5 photos
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8CE4FF] via-[#FFA239] to-[#FF5656] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(photos.length / 5) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {5 - photos.length} photo slots remaining
          </p>
        </div>
      </main>
    </div>
  );
}
