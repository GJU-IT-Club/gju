import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // <-- shadcn button

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

export function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { name: "Course name", credit: 3, percentage: 85 },
  ]);

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
    //We create a new array using [...] and pass it to setCourses.
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

  const gpaPercentage = calculateGpaPercentage().toFixed(2);
  const rating = getRating(Number(gpaPercentage));

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-2xl shadow-xl">
      {courses.map((course, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 mb-3 items-center">
          <input
            type="text"
            placeholder="Course Name"
            value={course.name}
            onChange={(e) => handleCourseChange(index, "name", e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            min={1}
            value={course.credit}
            onChange={(e) =>
              handleCourseChange(index, "credit", e.target.value)
            }
            className="border p-2 rounded"
            placeholder="Credit Hours"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={course.percentage}
            onChange={(e) =>
              handleCourseChange(index, "percentage", e.target.value)
            }
            className="border p-2 rounded"
            placeholder="Grade %"
          />
          <Button
            variant="destructive"
            onClick={() => deleteCourse(index)}
            className="w-full"
          >
            Delete
          </Button>
        </div>
      ))}

      <Button
        onClick={addCourse}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
      >
        Add Course
      </Button>

      <div className="mt-6 text-center text-lg font-semibold">
        GPA (%): <span className="text-blue-600">{gpaPercentage}</span>
        <br />
        Rating: <span className="text-green-600">{rating}</span>
      </div>
    </div>
  );
}

export default GpaCalculator;
