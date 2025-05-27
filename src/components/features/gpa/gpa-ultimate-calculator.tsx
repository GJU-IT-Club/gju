import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  PlusCircle,
  Plus,
  Trash2,
  Calculator,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";

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
  const allCourses = semesters.flatMap((s) => s.courses);
  return calculateSemesterGpa(allCourses);
}

export default function GpaUltimateCalculator() {
  // State
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("gpaUltimate_semesters")
        : null;
    if (saved) {
      const loadedSemesters = JSON.parse(saved);
      setSemesters(loadedSemesters);
      // Auto-expand all semesters on load
      setExpandedSemesters(new Set(loadedSemesters.map((s: Semester) => s.id)));
    }
  }, []);

  const [cumulativeGpa, setCumulativeGpa] = useState<number>(0);
  const [targetGpaOpen, setTargetGpaOpen] = useState(false);
  const [desiredGpa, setDesiredGpa] = useState<number>(84);
  const [requiredGpa, setRequiredGpa] = useState<number | null>(null);

  // Persist semesters and auto-calculate GPAs
  useEffect(() => {
    localStorage.setItem("gpaUltimate_semesters", JSON.stringify(semesters));

    // Auto-calculate semester GPAs
    const updatedSemesters = semesters.map((semester) => ({
      ...semester,
      gpa: calculateSemesterGpa(semester.courses),
    }));

    setCumulativeGpa(calculateCumulativeGpa(updatedSemesters));
  }, [semesters]);

  // Toggle semester expansion
  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(semesterId)) {
        newSet.delete(semesterId);
      } else {
        newSet.add(semesterId);
      }
      return newSet;
    });
  };
  // Semester actions
  const addSemester = () => {
    const newSemester = {
      id: Date.now().toString(),
      name: `Semester ${semesters.length + 1}`,
      courses: [],
      gpa: null,
    };
    setSemesters((prev) => [...prev, newSemester]);
    // Auto-expand the new semester
    setExpandedSemesters((prev) => new Set([...prev, newSemester.id]));
  };

  const updateSemester = (id: string, updates: Partial<Semester>) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
    setExpandedSemesters((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Course actions
  const addCourse = (semesterId: string) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? {
              ...s,
              courses: [...s.courses, { name: "", credit: 3, grade: 85 }],
            }
          : s
      )
    );
  };
  const updateCourse = (
    semesterId: string,
    idx: number,
    updates: Partial<Course>
  ) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? {
              ...s,
              courses: s.courses.map((c, i) =>
                i === idx ? { ...c, ...updates } : c
              ),
            }
          : s
      )
    );
  };
  const deleteCourse = (semesterId: string, idx: number) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((_, i) => i !== idx) }
          : s
      )
    );
  };
  // Calculate all GPAs
  const calculateAllGpas = () => {
    setSemesters((prev) =>
      prev.map((s) => ({
        ...s,
        gpa: calculateSemesterGpa(s.courses),
      }))
    );
  };

  // Target GPA logic
  const openTargetGpaDialog = () => {
    setTargetGpaOpen(true);
    setRequiredGpa(null);
  };

  const handleTargetGpaCalculation = () => {
    const totalCredits = semesters.reduce(
      (sum, s) => sum + s.courses.reduce((cSum, c) => cSum + c.credit, 0),
      0
    );
    const nextSemesterCredits = 15; // User can adjust this if needed
    const totalPoints = cumulativeGpa * totalCredits;
    const targetPoints = desiredGpa * (totalCredits + nextSemesterCredits);
    const neededPoints = targetPoints - totalPoints;
    setRequiredGpa(neededPoints / nextSemesterCredits);
  };
  // UI
  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex p-5 items-center justify-between border-b border-border">
        {/* Target GPA Dialog Button */}
        <Dialog open={targetGpaOpen} onOpenChange={setTargetGpaOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openTargetGpaDialog}>
              <Target className="h-4 w-4 mr-2" />
              Target GPA
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Target GPA Calculator</DialogTitle>
              <DialogDescription>
                Calculate the GPA needed in your next semester to reach your
                target
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Cumulative GPA</Label>
                <Input
                  type="number"
                  value={cumulativeGpa.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Desired GPA</Label>
                <Input
                  type="number"
                  value={desiredGpa}
                  onChange={(e) => setDesiredGpa(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <Button className="w-full" onClick={handleTargetGpaCalculation}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Required GPA
              </Button>
              {requiredGpa !== null && (
                <div className="pt-4 text-center border-t">
                  <p className="text-sm text-muted-foreground">
                    You need a semester GPA of
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {requiredGpa.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getGradeCategory(requiredGpa)}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cumulative GPA Display */}
        <div className="text-right ">
          <p className="text-sm text-muted-foreground">Cumulative GPA</p>
          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <p className="text-3xl font-bold text-primary">
              {cumulativeGpa.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {getGradeCategory(cumulativeGpa)}
            </p>
          </div>
        </div>
      </div>

      {/* Semesters Container with Horizontal Scroll */}
      <div className="relative">
        <div className="flex gap-4 px-5 overflow-x-auto pb-4 md:pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {/* Semester Cards */}
          {semesters.map((semester) => {
            const isExpanded = expandedSemesters.has(semester.id);
            const semesterGpa = calculateSemesterGpa(semester.courses);

            return (
              <Card
                key={semester.id}
                className="min-w-[320px] md:min-w-[350px] flex-shrink-0"
              >
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleSemester(semester.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={semester.name}
                        onChange={(e) =>
                          updateSemester(semester.id, { name: e.target.value })
                        }
                        className="flex-1 mr-2 font-medium"
                        placeholder="Semester Name"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSemester(semester.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    {/* Semester GPA Display */}
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">
                        Semester GPA
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {semester.courses.length > 0
                          ? semesterGpa.toFixed(2)
                          : "--"}
                      </p>
                      {semester.courses.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {getGradeCategory(semesterGpa)}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {/* Courses */}
                      {semester.courses.map((course, idx) => (
                        <div
                          key={idx}
                          className="space-y-3 p-3 border rounded-md bg-muted/30"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              Course {idx + 1}
                            </Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCourse(semester.id, idx)}
                              className="h-6 w-6 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Course Name
                              </Label>
                              <Input
                                value={course.name}
                                onChange={(e) =>
                                  updateCourse(semester.id, idx, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="e.g., Calculus I"
                                className="mt-1"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  Credits
                                </Label>
                                <Input
                                  type="number"
                                  value={course.credit}
                                  onChange={(e) =>
                                    updateCourse(semester.id, idx, {
                                      credit: Number(e.target.value),
                                    })
                                  }
                                  min={1}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">
                                  Grade
                                </Label>
                                <Input
                                  type="number"
                                  value={course.grade}
                                  onChange={(e) =>
                                    updateCourse(semester.id, idx, {
                                      grade: Number(e.target.value),
                                    })
                                  }
                                  min={0}
                                  max={100}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Course Button */}
                      <Button
                        variant="outline"
                        onClick={() => addCourse(semester.id)}
                        className="w-full"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}

          {/* Add Semester Button */}
          <div className="flex items-center pt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={addSemester}
              className="min-w-[64px] h-16 rounded-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
