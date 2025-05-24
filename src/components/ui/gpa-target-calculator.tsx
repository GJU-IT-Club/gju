import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export function GpaTargetCalculator() {
  const [currentGpa, setCurrentGpa] = useState(80);
  const [hoursPassed, setHoursPassed] = useState(90);
  const [semesterHours, setSemesterHours] = useState(15);
  const [desiredGpa, setDesiredGpa] = useState(84);
  const [requiredGpa, setRequiredGpa] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateRequiredGpa = () => {
    setError(null);
    const hPassed = Number(hoursPassed);
    const cGpa = Number(currentGpa);
    const sHours = Number(semesterHours);
    const dGpa = Number(desiredGpa);
    if (hPassed < 0 || sHours <= 0 || dGpa < 0 || cGpa < 0) {
      setError("All values must be positive and semester hours > 0.");
      setRequiredGpa(null);
      return;
    }
    const totalHours = hPassed + sHours;
    const totalPointsNeeded = dGpa * totalHours;
    const currentPoints = cGpa * hPassed;
    const neededSemesterPoints = totalPointsNeeded - currentPoints;
    const reqGpa = neededSemesterPoints / sHours;
    if (reqGpa > 100) {
      setError("Desired GPA is not achievable with the given inputs.");
      setRequiredGpa(null);
      return;
    }
    setRequiredGpa(reqGpa);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-2xl shadow-xl mt-10">
      <h2 className="text-xl font-bold mb-4">Target GPA Calculator</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">
            Current Cumulative GPA
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentGpa}
            onChange={e => setCurrentGpa(Number(e.target.value))}
            className="border p-2 rounded"
            placeholder="e.g. 80"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Hours Passed</label>
          <input
            type="number"
            min={0}
            value={hoursPassed}
            onChange={e => setHoursPassed(Number(e.target.value))}
            className="border p-2 rounded"
            placeholder="e.g. 90"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Semester Hours</label>
          <input
            type="number"
            min={1}
            value={semesterHours}
            onChange={e => setSemesterHours(Number(e.target.value))}
            className="border p-2 rounded"
            placeholder="e.g. 15"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Desired GPA</label>
          <input
            type="number"
            min={0}
            max={100}
            value={desiredGpa}
            onChange={e => setDesiredGpa(Number(e.target.value))}
            className="border p-2 rounded"
            placeholder="e.g. 84"
          />
        </div>
      </div>
      <Button onClick={calculateRequiredGpa} className="w-full mt-2">
        Calculate Required GPA This Semester
      </Button>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {requiredGpa !== null && !error && (
        <div className="mt-4 text-lg font-semibold text-center">
          You need a semester GPA of
          <span className="text-blue-600"> {requiredGpa.toFixed(2)} </span>
          to reach your desired cumulative GPA.
        </div>
      )}
    </div>
  );
}

export default GpaTargetCalculator; 
