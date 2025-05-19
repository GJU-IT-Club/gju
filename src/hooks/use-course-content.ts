import { useState, useEffect } from 'react';

export interface CourseContent {
  content: string;
  isLoading: boolean;
  error: Error | null;
}

export function useCourseContent(courseId: string): CourseContent {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourseContent = async () => {
      if (!courseId) {
        setError(new Error("Course ID is required"));
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/courses/content?id=${courseId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course content: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setContent(data.content || "No course content available.");
      } catch (err) {
        console.error('Error fetching course content:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseContent();
    }
  }, [courseId]);

  return { content, isLoading, error };
}
