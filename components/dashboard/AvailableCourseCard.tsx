import React from "react";
import { Users, Badge } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AvailableCourseCardProps {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructorName?: string;
  instructorAvatar?: string;
  lessonCount?: number;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  isLoading?: boolean;
}

export function AvailableCourseCard({
  id,
  title,
  description,
  image,
  instructorName,
  instructorAvatar,
  lessonCount = 0,
  isEnrolled = false,
  onEnroll,
  isLoading = false,
}: AvailableCourseCardProps) {
  const learnerCount = (id * 37) % 500 + 50;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-200 to-blue-200 overflow-hidden group">
        {image ? (
          <Image
            src={image}
            alt={title}
            width={640}
            height={360}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Badge className="w-16 h-16 text-purple-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{title}</h3>

        {/* Instructor Info */}
        {instructorName && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            {instructorAvatar ? (
              <Image
                src={instructorAvatar}
                alt={instructorName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
            )}
            <div>
              <p className="text-xs text-gray-600">Instructor</p>
              <p className="text-sm font-semibold text-gray-800">
                {instructorName}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
          {description}
        </p>

        {/* Course Details */}
        <div className="flex flex-wrap gap-3 mb-4 pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <Badge className="w-4 h-4 text-blue-500" />
            <span>{lessonCount} lessons</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4 text-cyan-500" />
            <span>{learnerCount}+ learning</span>
          </div>
        </div>

        {/* Enroll Button */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/courses/${id}`}
            className="inline-flex items-center justify-center py-2 rounded-lg border border-purple-200 text-purple-700 font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            View Details
          </Link>

          <button
            onClick={onEnroll}
            disabled={isEnrolled || isLoading}
            className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
              isEnrolled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-300 active:scale-95"
            } ${isLoading ? "opacity-75" : ""}`}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enrolling...
              </span>
            ) : isEnrolled ? (
              "Enrolled"
            ) : (
              "Enroll Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
