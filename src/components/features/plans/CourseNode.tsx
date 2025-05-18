import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";

const categoryColors = {
  Core: "bg-blue-100 border-blue-500",
  Elective: "bg-green-100 border-green-500",
  Math: "bg-red-100 border-red-500",
  Language: "bg-yellow-100 border-yellow-500",
};

export type CourseNode = Node<
  {
    id: string;
    name: string;
    creditHours: number;
    prerequisites: string[];
    corequisites: string[];
    category: "Core" | "Elective" | "Math" | "Language";
    year: number;
  },
  "courseNode"
>;

function CourseNode({ data }: NodeProps<CourseNode>) {
  const [showDetails, setShowDetails] = useState(false);

  const nodeStyle =
    categoryColors[data.category] || "bg-gray-100 border-gray-500";

  return (
    <div className={`rounded-md border-2 p-3 ${nodeStyle} max-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />

      <div className="font-bold">{data.id}</div>
      <div className="text-sm">{data.name}</div>
      <div className="text-xs text-gray-600">{data.creditHours} cr.</div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs mt-2 text-blue-600 hover:underline"
      >
        {showDetails ? "Hide Details" : "Show Details"}
      </button>

      {showDetails && (
        <div className="mt-2 text-xs border-t pt-2">
          <p>
            <strong>Prerequisites:</strong>{" "}
            {data.prerequisites.join(", ") || "None"}
          </p>
          <p>
            <strong>Corequisites:</strong>{" "}
            {data.corequisites.join(", ") || "None"}
          </p>
          <p>
            <strong>Year:</strong> {data.year}
          </p>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}

export default memo(CourseNode);
