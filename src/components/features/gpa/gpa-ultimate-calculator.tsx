import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { PlusCircle, Trash2, Calculator } from "lucide-react";

// GPA grade categories
function getGradeCategory(gpa: number): string {
  if (gpa >= 84) return "Excellent";
  if (gpa >= 74) return "Very Good";
  if (gpa >= 64) return "Good";
  return "Poor";
}

// Types
interface Course {
  name: string;
  credit: number;
  grade: number;
}
interface Semester {
  id: string;
  name: string;
  courses: Course[];
  gpa: number | null;
}

// GPA calculations
function calculateSemesterGpa(courses: Course[]): number {
  const totalWeighted = courses.reduce((sum, c) => sum + c.grade * c.credit, 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);
  return totalCredits > 0 ? totalWeighted / totalCredits : 0;
}
function calculateCumulativeGpa(semesters: Semester[]): number {
  const allCourses = semesters.flatMap(s => s.courses);
  return calculateSemesterGpa(allCourses);
}

export default function GpaUltimateCalculator() {
  // State
  const [semesters, setSemesters] = useState<Semester[]>([]);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("gpaUltimate_semesters") : null;
    if (saved) setSemesters(JSON.parse(saved));
  }, []);
  const [cumulativeGpa, setCumulativeGpa] = useState<number>(0);
  const [gpaModalOpen, setGpaModalOpen] = useState(false);
  const [desiredGpa, setDesiredGpa] = useState<number>(84);
  const [requiredGpa, setRequiredGpa] = useState<number | null>(null);

  // Persist semesters
  useEffect(() => {
    localStorage.setItem("gpaUltimate_semesters", JSON.stringify(semesters));
    setCumulativeGpa(calculateCumulativeGpa(semesters));
  }, [semesters]);

  // Semester actions
  const addSemester = () => {
    setSemesters(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Semester ${prev.length + 1}`,
        courses: [],
        gpa: null,
      },
    ]);
  };
  const updateSemester = (id: string, updates: Partial<Semester>) => {
    setSemesters(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };
  const deleteSemester = (id: string) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
  };

  // Course actions
  const addCourse = (semesterId: string) => {
    setSemesters(prev => prev.map(s =>
      s.id === semesterId
        ? { ...s, courses: [...s.courses, { name: "", credit: 3, grade: 85 }] }
        : s
    ));
  };
  const updateCourse = (semesterId: string, idx: number, updates: Partial<Course>) => {
    setSemesters(prev => prev.map(s =>
      s.id === semesterId
        ? {
            ...s,
            courses: s.courses.map((c, i) => (i === idx ? { ...c, ...updates } : c)),
          }
        : s
    ));
  };
  const deleteCourse = (semesterId: string, idx: number) => {
    setSemesters(prev => prev.map(s =>
      s.id === semesterId
        ? { ...s, courses: s.courses.filter((_, i) => i !== idx) }
        : s
    ));
  };

  // Calculate all GPAs
  const calculateAllGpas = () => {
    setSemesters(prev => prev.map(s => ({
      ...s,
      gpa: calculateSemesterGpa(s.courses),
    })));
  };

  // GPA Increase logic
  const openGpaModal = () => {
    setGpaModalOpen(true);
    setRequiredGpa(null);
  };
  const handleGpaIncrease = () => {
    const totalCredits = semesters.reduce(
      (sum, s) => sum + s.courses.reduce((cSum, c) => cSum + c.credit, 0),
      0
    );
    const nextSemesterCredits = 15; // User can change this if needed
    const totalPoints = cumulativeGpa * totalCredits;
    const targetPoints = desiredGpa * (totalCredits + nextSemesterCredits);
    const neededPoints = targetPoints - totalPoints;
    setRequiredGpa(neededPoints / nextSemesterCredits);
  };

  // UI
  return (
    <div className="space-y-8">
      {/* Cumulative GPA at top */}
      <Card className="p-6 text-center">
        <h2 className="text-2xl font-bold">Cumulative GPA</h2>
        <p className="text-4xl font-bold">{cumulativeGpa.toFixed(2)}</p>
        <p className="text-lg">{getGradeCategory(cumulativeGpa)}</p>
      </Card>

      {/* GPA Increase Modal */}
      <Sheet open={gpaModalOpen} onOpenChange={setGpaModalOpen}>
        <SheetTrigger asChild>
          <Button className="w-full" onClick={openGpaModal}>
            <Calculator className="h-4 w-4 mr-2" /> GPA Increase
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>GPA Increase Calculator</SheetTitle>
            <SheetDescription>
              Calculate the GPA needed in your next semester to reach your target
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Cumulative GPA</Label>
              <Input type="number" value={cumulativeGpa.toFixed(2)} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Desired GPA</Label>
              <Input
                type="number"
                value={desiredGpa}
                onChange={e => setDesiredGpa(Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
            <Button className="w-full" onClick={handleGpaIncrease}>
              Calculate Required GPA
            </Button>
            {requiredGpa !== null && (
              <div className="pt-4 text-center">
                <p className="text-lg">You need a semester GPA of</p>
                <p className="text-3xl font-bold">{requiredGpa.toFixed(2)}</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Semesters */}
      <div className="space-y-6">
        {semesters.map((semester) => (
          <Card key={semester.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Input
                value={semester.name}
                onChange={e => updateSemester(semester.id, { name: e.target.value })}
                className="max-w-[200px]"
                placeholder="Semester Name"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteSemester(semester.id)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Delete Semester</span>
              </Button>
            </div>
            <div className="space-y-4">
              {semester.courses.map((course, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-6">
                    <Label>Course Name</Label>
                    <Input
                      value={course.name}
                      onChange={e => updateCourse(semester.id, idx, { name: e.target.value })}
                      placeholder="e.g., Calculus I"
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <Label>Credits</Label>
                    <Input
                      type="number"
                      value={course.credit}
                      onChange={e => updateCourse(semester.id, idx, { credit: Number(e.target.value) })}
                      min={1}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <Label>Grade</Label>
                    <Input
                      type="number"
                      value={course.grade}
                      onChange={e => updateCourse(semester.id, idx, { grade: Number(e.target.value) })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteCourse(semester.id, idx)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Delete Course</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-4">
              <Button
                variant="outline"
                onClick={() => addCourse(semester.id)}
                className="w-full md:w-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Course
              </Button>
              {semester.gpa !== null && (
                <div className="text-center md:text-right">
                  <p className="text-sm text-muted-foreground">Semester GPA</p>
                  <p className="text-2xl font-bold">{semester.gpa.toFixed(2)}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Button onClick={addSemester} className="w-full">
          <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Semester
        </Button>
        <Button onClick={calculateAllGpas} className="w-full" variant="default">
          <Calculator className="h-4 w-4 mr-2" aria-hidden="true" />
          Calculate GPAs
        </Button>
      </div>
    </div>
  );
}
