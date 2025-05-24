
import React, { useState } from "react";
import { Calculator, Target } from "lucide-react";

// Define your tab types
type TabType = "gpa" | "target";

function TabBar() {
  // State to track active tab
  const [activeTab, setActiveTab] = useState<TabType>("gpa");

  return (
    <div>
      {/* 🎯 CHROME-STYLE TAB BAR - START */}
      <div className="fixed top-15 left-20 right-0 bg-gray-200 border-b border-gray-300 z-50">
        <div className="flex">
          {/* Tab 1: GPA Calculator */}
          <button
            onClick={() => setActiveTab("gpa")}
            className={`relative px-6 py-3 font-medium transition-all ${
              activeTab === "gpa"
                ? "bg-white text-gray-900 border-t-2 border-blue-500"
                : "bg-gray-100 text-gray-600 hover:bg-gray-50 border-t-2 border-transparent"
            } rounded-t-lg border-l border-r border-gray-300 -mb-px`}
            style={{
              clipPath: activeTab === "gpa" ? "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" : "none"
            }}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            GPA Calculator
          </button>
          
          {/* Tab 2: Target Calculator */}
          <button
            onClick={() => setActiveTab("target")}
            className={`relative px-6 py-3 font-medium transition-all ${
              activeTab === "target"
                ? "bg-white text-gray-900 border-t-2 border-blue-500"
                : "bg-gray-100 text-gray-600 hover:bg-gray-50 border-t-2 border-transparent"
            } rounded-t-lg border-l border-r border-gray-300 -mb-px -ml-px`}
            style={{
              clipPath: activeTab === "target" ? "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" : "none"
            }}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Target GPA Calculator
          </button>
        </div>
      </div>
      {/* 🎯 CHROME-STYLE TAB BAR - END */}

      {/* Your main content - add top padding to account for fixed tab bar */}
      <div className="pt-20">
        {/* Conditional content based on active tab */}
        {activeTab === "gpa" && (
          <div>
            {/* Your GPA Calculator content here */}
            <h2>GPA Calculator Content</h2>
          </div>
        )}
        
        {activeTab === "target" && (
          <div>
            {/* Your Target Calculator content here */}
            <h2>Target Calculator Content</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabBar;