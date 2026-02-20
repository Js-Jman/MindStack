import React from "react";
import { Star, BarChart3, BookOpen } from "lucide-react";

interface EnrolledCourseCardProps {
  id: number;
  title: string;
  image?: string;
  instructorName?: string;
  progress?: number;
  lessonCount?: number;
  rating?: number;
  onClick?: () => void;
}

export function EnrolledCourseCard({
  id,
  title,
  image,
  instructorName,
  progress = 0,
  lessonCount = 0,
  rating = 0,
  onClick,
}: EnrolledCourseCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group"
    >
      {/* Course Image */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-200 to-blue-200">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-purple-400" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-700">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{title}</h3>

        {instructorName && (
          <p className="text-sm text-gray-600 mb-3">By {instructorName}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">
              Progress
            </span>
            <span className="text-xs font-bold text-purple-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span>{lessonCount} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span>Learning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
