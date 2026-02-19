import React from "react";
import { Star, Users, Clock, Badge } from "lucide-react";

interface AvailableCourseCardProps {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructorName?: string;
  instructorAvatar?: string;
  level?: string;
  duration?: number;
  lessonCount?: number;
  rating?: number;
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
  level = "Beginner",
  duration = 0,
  lessonCount = 0,
  rating = 0,
  isEnrolled = false,
  onEnroll,
  isLoading = false,
}: AvailableCourseCardProps) {
  const levelColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-blue-100 text-blue-800",
    Advanced: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col h-full">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-200 to-blue-200 overflow-hidden group">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Badge className="w-16 h-16 text-purple-400" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              levelColors[level as keyof typeof levelColors] ||
              levelColors.Beginner
            }`}
          >
            {level}
          </span>
        </div>
        {rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">{rating}</span>
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
              <img
                src={instructorAvatar}
                alt={instructorName}
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
            <Clock className="w-4 h-4 text-purple-500" />
            <span>{duration}h</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Badge className="w-4 h-4 text-blue-500" />
            <span>{lessonCount} lessons</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4 text-cyan-500" />
            <span>{Math.floor(Math.random() * 500) + 50}+ learning</span>
          </div>
        </div>

        {/* Enroll Button */}
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
            "Already Enrolled"
          ) : (
            "Enroll Now"
          )}
        </button>
      </div>
    </div>
  );
}
