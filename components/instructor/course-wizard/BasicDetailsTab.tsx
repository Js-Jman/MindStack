"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";

interface CourseData {
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  introVideoUrl?: string;
  isPublished: boolean;
}

interface BasicDetailsTabProps {
  data: CourseData;
  onChange: (data: CourseData) => void;
  onNext: () => void;
  canProceed: boolean;
}

export function BasicDetailsTab({ data, onChange, onNext, canProceed }: BasicDetailsTabProps) {
  const handleChange = (field: keyof CourseData, value: string | number | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Basic Course Information</h2>
        <p className="text-slate-600">Provide the essential details for your course.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            placeholder="Enter course title"
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Course Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe what students will learn in this course"
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Price (Rs)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={data.price}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              placeholder="https://example.com/thumbnail.jpg"
              value={data.thumbnailUrl || ""}
              onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="introVideo">Intro Video URL</Label>
          <Input
            id="introVideo"
            placeholder="https://example.com/intro-video.mp4"
            value={data.introVideoUrl || ""}
            onChange={(e) => handleChange("introVideoUrl", e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={data.isPublished}
            onCheckedChange={(checked) => handleChange("isPublished", checked)}
          />
          <Label htmlFor="published">Publish course immediately</Label>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          Continue to Lessons
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}