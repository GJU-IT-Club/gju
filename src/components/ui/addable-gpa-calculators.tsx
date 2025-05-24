import React, { useState } from "react";
import GpaCalculator from "@/components/ui/gpa-calculator";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function AddableGpaCalculators() {
  const [calculators, setCalculators] = useState<number[]>([Date.now()]);
  
  const addCalculator = () => {
    setCalculators((prev) => [...prev, Date.now()]);
  };

  const deleteCalculator = (id: number) => {
    setCalculators((prev) => prev.filter(calculatorId => calculatorId !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">GPA Calculators</h1>
        </div>

        {/* Horizontal scrolling container */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max px-4 pl-15 items-start">
            {calculators.map((id) => (
              <GpaCalculator
                key={id}
                onDelete={() => deleteCalculator(id)}
                showDelete={calculators.length > 1}
              />
            ))}
            
            {/* Add Calculator Button */}
            <div className="flex items-center justify-center min-w-[120px]">
              <button
                onClick={addCalculator}
                className="flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors hover:shadow-xl"
                aria-label="Add new calculator"
              >
                <PlusCircle className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-friendly vertical layout for smaller screens */}
        <div className="md:hidden space-y-6 mt-8">
          {calculators.map((id) => (
            <div key={`mobile-${id}`} className="w-full">
              <GpaCalculator
                onDelete={() => deleteCalculator(id)}
                showDelete={calculators.length > 1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}