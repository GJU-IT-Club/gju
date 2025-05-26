import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash } from "lucide-react";

type Course = {
  name: string;
  credit: number;
  percentage: number;
};

function getRating(gpaPercentage: number): string {
  if (gpaPercentage >= 84) return "Excellent";
  if (gpaPercentage >= 76) return "Very Good";
  if (gpaPercentage >= 68) return "Good";
  if (gpaPercentage >= 60) return "Satisfactory";
  return "Fail";
}

interface GpaCalculatorProps {
  id?: number;
  semesterName?: string;
  onDelete?: () => void;
  showDelete: boolean;
  onGpaChange?: (gpa: number | null) => void;
  onHoursChange?: (hours: number) => void;
}

function GpaCalculator({ id, semesterName, onDelete, showDelete, onGpaChange, onHoursChange }: GpaCalculatorProps) {
  const [courses, setCourses] = useState<Course[]>([
    { name: "", credit: 3, percentage: 85 },
  ]);
  // Load courses from localStorage on mount
  useEffect(() => {
    if (id) {
      try {
        const savedCourses = localStorage.getItem(`gpa_courses_${id}`);
        if (savedCourses) {
          try {
            const parsedCourses = JSON.parse(savedCourses);
            if (Array.isArray(parsedCourses) && parsedCourses.length > 0) {
              setCourses(parsedCourses);
            }
          } catch (error) {
            console.error(`Error parsing courses for calculator ${id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error loading courses from localStorage for calculator ${id}:`, error);
      }
    }
  }, [id]);

  // Save courses to localStorage when courses change
  useEffect(() => {
    if (id) {
      try {
        localStorage.setItem(`gpa_courses_${id}`, JSON.stringify(courses));
      } catch (error) {
        console.error(`Error saving courses to localStorage for calculator ${id}:`, error);
      }
    }
  }, [courses, id]);
  useEffect(() => {
    const gpa = calculateGpaPercentage();
    const totalHours = calculateTotalHours();
    if (onGpaChange) onGpaChange(isNaN(gpa) ? null : gpa);
    if (onHoursChange) onHoursChange(totalHours);
    // eslint-disable-next-line
  }, [courses]);

  const handleCourseChange = (
    index: number,
    key: keyof Course,
    value: string | number
  ) => {
    const updated = [...courses];
    updated[index] = {
      ...updated[index],
      [key]: key === "credit" || key === "percentage" ? Number(value) : value,
    };
    setCourses(updated);
  };

  const addCourse = () => {
    setCourses([...courses, { name: "", credit: 3, percentage: 85 }]);
  };

  const deleteCourse = (index: number) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
  };
  const calculateGpaPercentage = (): number => {
    const totalWeighted = courses.reduce(
      (sum, course) => sum + course.percentage * course.credit,
      0
    );
    const totalCredits = courses.reduce(
      (sum, course) => sum + course.credit,
      0
    );
    return totalCredits ? totalWeighted / totalCredits : 0;
  };

  const calculateTotalHours = (): number => {
    return courses.reduce((sum, course) => sum + course.credit, 0);
  };

  const gpaPercentage = calculateGpaPercentage().toFixed(2);
  const totalHours = calculateTotalHours();
  const rating = getRating(Number(gpaPercentage));

  return (
    <div className="relative rounded-xl border bg-white shadow-lg p-6 space-y-4 w-full max-w-[500px] min-w-[400px]">
      {showDelete && (
        <button
          onClick={onDelete}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
          aria-label="Delete calculator"
        >
          <Trash className="h-6 w-6" />
        </button>
      )}
      <h2 className="text-xl font-bold mb-4">{semesterName || "Semester"}</h2>
      <div className="space-y-3">
        {courses.map((course, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 items-end">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Course Name</label>
              <input
                type="text"
                placeholder="e.g. Calculus"
                value={course.name}
                onChange={(e) =>
                  handleCourseChange(index, "name", e.target.value)
                }
                className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Credit Hours</label>
              <input
                type="number"
                min={1}
                value={course.credit}
                onChange={(e) =>
                  handleCourseChange(index, "credit", e.target.value)
                }
                className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 3"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">Grade %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={course.percentage}
                onChange={(e) =>
                  handleCourseChange(index, "percentage", e.target.value)
                }
                className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 85"
              />
            </div>
            <button
              onClick={() => deleteCourse(index)}
              className="flex items-center justify-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Delete course"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button onClick={addCourse} className="w-full mt-4">
        Add Course
      </Button>      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
        <div className="text-lg font-semibold">
          GPA (%): <span className="text-blue-600">{gpaPercentage}</span>
        </div>
        <div className="text-lg font-semibold mt-1">
          Rating: <span className="text-green-600">{rating}</span>
        </div>
        <div className="text-sm font-medium mt-2 text-gray-600">
          Total Hours: <span className="text-gray-800">{totalHours}</span>
        </div>
      </div>
    </div>
  );
}
export default GpaCalculator;