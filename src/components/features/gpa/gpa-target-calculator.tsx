import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

function GpaTargetCalculator({ 
  onDelete, 
  showDelete, 
  currentGpa: initialCurrentGpa 
}: { 
  onDelete?: () => void; 
  showDelete?: boolean;
  currentGpa?: number;
}) {
  const [currentGpa, setCurrentGpa] = useState(initialCurrentGpa || 80);
  const [hoursPassed, setHoursPassed] = useState(90);
  const [semesterHours, setSemesterHours] = useState(15);
  const [desiredGpa, setDesiredGpa] = useState(84);
  const [requiredGpa, setRequiredGpa] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Load target calculator state from localStorage on mount
  useEffect(() => {
    try {
      const savedHoursPassed = localStorage.getItem("gpa_target_hours_passed");
      const savedSemesterHours = localStorage.getItem("gpa_target_semester_hours");
      const savedDesiredGpa = localStorage.getItem("gpa_target_desired_gpa");
      const savedRequiredGpa = localStorage.getItem("gpa_target_required_gpa");
      
      if (savedHoursPassed) setHoursPassed(Number(savedHoursPassed));
      if (savedSemesterHours) setSemesterHours(Number(savedSemesterHours));
      if (savedDesiredGpa) setDesiredGpa(Number(savedDesiredGpa));
      if (savedRequiredGpa) setRequiredGpa(Number(savedRequiredGpa));
    } catch (error) {
      console.error("Error loading target calculator state from localStorage:", error);
    }
  }, []);
  // Save target calculator state to localStorage when values change
  useEffect(() => {
    try {
      localStorage.setItem("gpa_target_hours_passed", hoursPassed.toString());
      localStorage.setItem("gpa_target_semester_hours", semesterHours.toString());
      localStorage.setItem("gpa_target_desired_gpa", desiredGpa.toString());
    } catch (error) {
      console.error("Error saving target calculator state to localStorage:", error);
    }
  }, [hoursPassed, semesterHours, desiredGpa]);

  // Update currentGpa when initialCurrentGpa changes
  useEffect(() => {
    if (initialCurrentGpa && initialCurrentGpa > 0) {
      setCurrentGpa(initialCurrentGpa);
    }
  }, [initialCurrentGpa]);

  const calculateRequiredGpa = () => {
    setError(null);
    const hPassed = Number(hoursPassed);
    const cGpa = Number(currentGpa);
    const sHours = Number(semesterHours);
    const dGpa = Number(desiredGpa);    if (hPassed < 0 || sHours <= 0 || dGpa < 0 || cGpa < 0) {
      setError("All values must be positive and semester hours > 0.");
      setRequiredGpa(null);
      try {
        localStorage.removeItem("gpa_target_required_gpa");
      } catch (error) {
        console.error("Error removing required GPA from localStorage:", error);
      }
      return;
    }
    
    const totalHours = hPassed + sHours;
    const totalPointsNeeded = dGpa * totalHours;
    const currentPoints = cGpa * hPassed;
    const neededSemesterPoints = totalPointsNeeded - currentPoints;
    const reqGpa = neededSemesterPoints / sHours;      if (reqGpa > 100) {
      setError("Desired GPA is not achievable with the given inputs.");
      setRequiredGpa(null);
      try {
        localStorage.removeItem("gpa_target_required_gpa");
      } catch (error) {
        console.error("Error removing required GPA from localStorage:", error);
      }
      return;
    }
      setRequiredGpa(reqGpa);    // Save the calculation result to localStorage
    try {
      localStorage.setItem("gpa_target_required_gpa", reqGpa.toString());
    } catch (error) {
      console.error("Error saving required GPA to localStorage:", error);
    }
  };
  // Load required GPA result from localStorage on mount
  useEffect(() => {
    try {
      const savedRequiredGpa = localStorage.getItem("gpa_target_required_gpa");
      if (savedRequiredGpa) {
        setRequiredGpa(Number(savedRequiredGpa));
      }
    } catch (error) {
      console.error("Error loading required GPA from localStorage:", error);
    }
  }, []);

  return (
    <div className="relative rounded-xl border bg-white shadow-lg p-6 space-y-4 w-full max-w-[500px] min-w-[350px]">
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
          aria-label="Delete calculator"
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
      
      <h2 className="text-xl font-bold mb-4">Target GPA Calculator</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Current Cumulative GPA
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentGpa}
            onChange={(e) => setCurrentGpa(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 80"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Hours Passed</label>
          <input
            type="number"
            min={0}
            value={hoursPassed}
            onChange={(e) => setHoursPassed(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 90"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Semester Hours</label>
          <input
            type="number"
            min={1}
            value={semesterHours}
            onChange={(e) => setSemesterHours(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 15"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Desired GPA</label>
          <input
            type="number"
            min={0}
            max={100}
            value={desiredGpa}
            onChange={(e) => setDesiredGpa(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. 84"
          />
        </div>
      </div>
      
      <Button 
        onClick={calculateRequiredGpa} 
        className="w-full mt-2 text-white"
      >
        Calculate Required GPA This Semester
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {requiredGpa !== null && !error && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-lg font-semibold">
            You need a semester GPA of{" "}
            <span className="text-blue-600">{requiredGpa.toFixed(2)}</span>{" "}
            to reach your desired cumulative GPA.
          </div>
        </div>
      )}
    </div>
  );
}

type TabType = "gpa" | "target";

export default GpaTargetCalculator;