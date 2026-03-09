export type SeedLessonSpec = {
  title: string;
  textHtml: string;
  imageUrl: string;
  videoUrl: string;
};

export type SeedSectionSpec = {
  title: string;
  lessons: SeedLessonSpec[];
};

export type SeedCourseSpec = {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  introVideoUrl?: string | null;
  price?: number | null;
  isPublished?: boolean;
  sections: SeedSectionSpec[];
};
