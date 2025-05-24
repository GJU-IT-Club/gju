import React, { useState, useEffect } from "react";
import GpaCalculator from "@/components/ui/gpa-calculator";
import GpaTargetCalculator from "@/components/ui/gpa-target-calculator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Calculator, Target } from "lucide-react";

export function AddableGpaCalculators() {
  const [calculators, setCalculators] = useState<number[]>([Date.now()]);
  type TabType = "gpa" | "target";
  const [activeTab, setActiveTab] = useState<TabType>("gpa");
  // Track GPA for each calculator by id
  const [gpaMap, setGpaMap] = useState<Record<number, number | null>>({});

  const addCalculator = () => {
    setCalculators((prev) => [...prev, Date.now()]);
  };

  const deleteCalculator = (id: number) => {
    setCalculators((prev) => prev.filter((calculatorId) => calculatorId !== id));
    setGpaMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Calculate total GPA (average of all non-null semester GPAs)
  const semesterGpas = calculators.map((id) => gpaMap[id]).filter((g) => g !== null && g !== undefined) as number[];
  const totalGpa = semesterGpas.length > 0 ? (semesterGpas.reduce((a, b) => a + b, 0) / semesterGpas.length).toFixed(2) : "-";

  // Load calculators and gpaMap from localStorage on mount
  useEffect(() => {
    const savedCalculators = localStorage.getItem("gpa_calculators");
    const savedGpaMap = localStorage.getItem("gpa_map");
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
  }, []);

  // Save calculators and gpaMap to localStorage on change
  useEffect(() => {
    localStorage.setItem("gpa_calculators", JSON.stringify(calculators));
    localStorage.setItem("gpa_map", JSON.stringify(gpaMap));
  }, [calculators, gpaMap]);

  return (
    <div>
      {/* Fixed Tab Bar at the very top */}
      <div className="fixed top-0 left-15 sm:top-[3.875rem] sm:left-[3.875rem] right-0 bg-gray-100 border-b border-gray-200 z-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-2 sm:px-4 h-16
">
        <div className="flex w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("gpa")}
            className={`flex-1 sm:flex-none relative px-2 sm:px-6 py-3 font-medium transition-all text-xs sm:text-base ${
              activeTab === "gpa"
                ? "bg-white text-gray-900 border-t-2 border-blue-500"
                : "bg-gray-100 text-gray-600 hover:bg-gray-50 border-t-2 border-transparent"
            } rounded-t-lg border-l border-r border-gray-300 -mb-px`}
            style={{
              clipPath:
                activeTab === "gpa"
                  ? "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)"
                  : "none",
            }}
          >
            <Calculator className="w-4 h-4 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">GPA Calculator</span>
            <span className="inline xs:hidden">GPA</span>
          </button>
          <button
            onClick={() => setActiveTab("target")}
            className={`flex-1 sm:flex-none relative px-2 sm:px-6 py-3 font-medium transition-all text-xs sm:text-base ${
              activeTab === "target"
                ? "bg-white text-gray-900 border-t-2 border-blue-500"
                : "bg-gray-100 text-gray-600 hover:bg-gray-50 border-t-2 border-transparent"
            } rounded-t-lg border-l border-r border-gray-300 -mb-px -ml-px`}
            style={{
              clipPath:
                activeTab === "target"
                  ? "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)"
                  : "none",
            }}
          >
            <Target className="w-4 h-4 inline mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Target GPA Calculator</span>
            <span className="inline xs:hidden">Target</span>
          </button>
        </div>
        {/* Total GPA at top right */}
        {activeTab === "gpa" && (
          <div className="hidden sm:block text-right text-lg font-semibold text-blue-700 whitespace-nowrap">
            Total GPA: <span className="font-bold">{totalGpa}</span>
          </div>
        )}
      </div>

      {/* Main content, with top padding for fixed tab bar */}
      <div className="pt-20 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {activeTab === "gpa" && (
            <>
              {/* Mobile: show Total GPA headline instead of GPA Calculators */}
              <div className="md:hidden text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-700 mb-4">
                  Total GPA: <span className="font-bold">{totalGpa}</span>
                </h1>
              </div>
              {/* Desktop: show GPA Calculators headline */}
              <div className="hidden md:block text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">GPA Calculators</h1>
              </div>
              {/* Desktop: horizontal scroll, Mobile: vertical stack with add button at bottom */}
              <div className="hidden md:block overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max px-4 pl-15 items-start">
                  {calculators.map((id, idx) => (
                    <GpaCalculator
                      key={id}
                      semesterName={`Semester ${idx + 1}`}
                      onDelete={() => deleteCalculator(id)}
                      showDelete={calculators.length > 1}
                      onGpaChange={(gpa) => setGpaMap((prev) => ({ ...prev, [id]: gpa }))}
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
              </div>
              {/* Mobile: vertical stack, add button at bottom */}
              <div className="md:hidden flex flex-col gap-6 w-full max-w-xl mx-auto">
                {calculators.map((id, idx) => (
                  <GpaCalculator
                    key={id}
                    semesterName={`Semester ${idx + 1}`}
                    onDelete={() => deleteCalculator(id)}
                    showDelete={calculators.length > 1}
                    onGpaChange={(gpa) => setGpaMap((prev) => ({ ...prev, [id]: gpa }))}
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
            </>
          )}
          {activeTab === "target" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] pt-8">
              <GpaTargetCalculator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
