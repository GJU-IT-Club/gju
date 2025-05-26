import React, { useState, useEffect } from "react";
import GpaCalculator from "@/components/features/gpa/gpa-calculator";
import GpaTargetCalculator from "@/components/features/gpa/gpa-target-calculator";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Calculator, Target } from "lucide-react";

export function AddableGpaCalculators() {  const [calculators, setCalculators] = useState<number[]>([Date.now()]);
  const [activeTab, setActiveTab] = useState<string>("gpa");
  // Track GPA for each calculator by id
  const [gpaMap, setGpaMap] = useState<Record<number, number | null>>({});
  // Track total hours for each calculator by id
  const [hoursMap, setHoursMap] = useState<Record<number, number>>({});

  const addCalculator = () => {
    setCalculators((prev) => [...prev, Date.now()]);
  };  const deleteCalculator = (id: number) => {
    setCalculators((prev) =>
      prev.filter((calculatorId) => calculatorId !== id)
    );
    setGpaMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setHoursMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    // Also clean up the courses data from localStorage
    localStorage.removeItem(`gpa_courses_${id}`);
  };
  // Calculate cumulative GPA (average of all non-null semester GPAs)
  const semesterGpas = calculators
    .map((id) => gpaMap[id])
    .filter((g) => g !== null && g !== undefined) as number[];
  const cumulativeGpa =
    semesterGpas.length > 0
      ? semesterGpas.reduce((a, b) => a + b, 0) / semesterGpas.length
      : 0;

  // Calculate total hours across all semesters
  const totalHours = calculators
    .map((id) => hoursMap[id] || 0)
    .reduce((sum, hours) => sum + hours, 0);
  // Load calculators and gpaMap from localStorage on mount
  useEffect(() => {
    const savedCalculators = localStorage.getItem("gpa_calculators");
    const savedGpaMap = localStorage.getItem("gpa_map");
    const savedHoursMap = localStorage.getItem("hours_map");
    if (savedCalculators) {
      try {
        setCalculators(JSON.parse(savedCalculators));
      } catch {}
    }
    if (savedGpaMap) {
      try {
        setGpaMap(JSON.parse(savedGpaMap));
      } catch {}
    }
    if (savedHoursMap) {
      try {
        setHoursMap(JSON.parse(savedHoursMap));
      } catch {}
    }
  }, []);
  // Save calculators and gpaMap to localStorage on change
  useEffect(() => {
    localStorage.setItem("gpa_calculators", JSON.stringify(calculators));
    localStorage.setItem("gpa_map", JSON.stringify(gpaMap));
    localStorage.setItem("hours_map", JSON.stringify(hoursMap));
  }, [calculators, gpaMap, hoursMap]);

  return (
    <div className="min-h-screen w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="">
        {" "}
        {/* Tab Navigation with Cumulative GPA */}
        <div className="sticky top-15 index-60 ml-16 bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2 h-8">
              <TabsTrigger
                value="gpa"
                className="flex items-center gap-2 h-7 px-3"
              >
                <Calculator className="h-3 w-3" />
                <span className="hidden sm:inline text-sm">GPA Calculator</span>
                <span className="sm:hidden text-sm">GPA</span>
              </TabsTrigger>
              <TabsTrigger
                value="target"
                className="flex items-center gap-2 h-7 px-3"
              >
                <Target className="h-3 w-3" />
                <span className="hidden sm:inline text-sm">Target GPA</span>
                <span className="sm:hidden text-sm">Target</span>
              </TabsTrigger>
            </TabsList>            {/* Cumulative GPA Card - Always visible */}
            <Card className="p-3 text-center min-w-[160px]">
              <h3 className="text-xs font-semibold text-gray-700">
                Cumulative GPA
              </h3>
              <p className="text-xl font-bold text-blue-600 mb-0">
                {cumulativeGpa > 0 ? cumulativeGpa.toFixed(2) : "-"}
              </p>
              <p className="text-xs text-gray-600 mb-1">
                {cumulativeGpa > 0
                  ? getGradeCategory(cumulativeGpa)
                  : "No data"}
              </p>
              <p className="text-xs font-medium text-gray-700">
                Total Hours: <span className="text-gray-900">{totalHours}</span>
              </p>
            </Card>
          </div>
        </div>{" "}
        {/* Tab Content */}
        <div className="w-full ml-7 px-4 py-6 mt-10">
          <div className="w-full">
            <TabsContent value="gpa" className="space-y-6 mt-0">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Semester GPA Calculators
                </h1>
                <p className="text-gray-600">
                  Calculate your GPA for each semester
                </p>
              </div>              {/* Desktop: horizontal scroll, Mobile: vertical stack */}
              <div className="hidden lg:block overflow-x-auto pb-4 w-full">                <div className="flex gap-6 min-w-max items-start ml-7">
                  {calculators.map((id, idx) => (
                    <GpaCalculator
                      key={id}
                      id={id}
                      semesterName={`Semester ${idx + 1}`}
                      onDelete={() => deleteCalculator(id)}
                      showDelete={calculators.length > 1}
                      onGpaChange={(gpa) =>
                        setGpaMap((prev) => ({ ...prev, [id]: gpa }))
                      }
                      onHoursChange={(hours) =>
                        setHoursMap((prev) => ({ ...prev, [id]: hours }))
                      }
                    />
                  ))}
                  {/* Add Calculator Button */}
                  <div className="flex items-center justify-center min-w-[120px]">
                    <Button
                      onClick={addCalculator}
                      className="flex items-center justify-center w-16 h-16 text-white rounded-full shadow-lg transition-colors hover:shadow-xl"
                      aria-label="Add new calculator"
                    >
                      <PlusCircle className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
              </div>              {/* Mobile: vertical stack */}              <div className="lg:hidden flex flex-col gap-6 w-full max-w-xl mx-auto ml-7">
                {calculators.map((id, idx) => (
                  <GpaCalculator
                    key={id}
                    id={id}
                    semesterName={`Semester ${idx + 1}`}
                    onDelete={() => deleteCalculator(id)}
                    showDelete={calculators.length > 1}
                    onGpaChange={(gpa) =>
                      setGpaMap((prev) => ({ ...prev, [id]: gpa }))
                    }
                    onHoursChange={(hours) =>
                      setHoursMap((prev) => ({ ...prev, [id]: hours }))
                    }
                  />
                ))}
                <Button
                  onClick={addCalculator}
                  className="flex items-center justify-center w-full h-14 text-white rounded-xl shadow-lg transition-colors hover:shadow-xl mt-2"
                  aria-label="Add new calculator"
                >
                  <PlusCircle className="h-6 w-6 mr-2" />
                  Add Semester Calculator
                </Button>
              </div>
            </TabsContent>
          </div>

          <TabsContent value="target" className="mt-0">
            <div className="flex flex-col items-center justify-center min-h-[60vh] pt-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Target GPA Calculator
                </h1>
                <p className="text-gray-600">
                  Calculate what GPA you need to reach your target
                </p>
              </div>
              <GpaTargetCalculator currentGpa={cumulativeGpa} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// GPA grade categories helper function
function getGradeCategory(gpa: number): string {
  if (gpa >= 84) return "Excellent";
  if (gpa >= 74) return "Very Good";
  if (gpa >= 64) return "Good";
  return "Poor";
}
