import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import type { Course } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
} from "@/components/ui/sheet";
import ReactMarkdown from "react-markdown";
import { useCourseContent } from "@/hooks/use-course-content";

const categoryColors = {
  "Uni Req": "bg-gray-100 border-gray-500",
  "School Req": "bg-red-100 border-red-500",
  "Prog Req": "bg-indigo-100 border-indigo-500",
  "Track Req": "bg-sky-100 border-sky-500",
  Elective: "bg-green-100 border-green-500",
  "School Elective": "bg-lime-100 border-lime-500",
  Language: "bg-yellow-100 border-yellow-500",
};

export type CourseNode = Node<Course, "courseNode">;

function CourseNode({ data }: NodeProps<CourseNode>) {
  const [showDetails, setShowDetails] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const nodeStyle =
    categoryColors[data.category] || "bg-gray-100 border-gray-500";
  const showTopHandle = data.prerequisites && data.prerequisites.length > 0;
  const showBottomHandle = true;
  const showRightHandle = true;
  const showLeftHandle = data.corequisites && data.corequisites.length > 0;
  return (
    <>
      <div
        className={`rounded-md border-2 p-3 ${nodeStyle} w-64 cursor-pointer`}
        onClick={() => setSheetOpen(true)}
      >
        {showTopHandle && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-2 h-2"
            id="top"
          />
        )}{" "}
        {showLeftHandle && (
          <Handle
            type="source"
            position={Position.Left}
            className="w-2 h-2 bg-neutral-300"
            id="coreq-out"
            style={{ borderColor: "#d4d4d4" }}
          />
        )}
        {showRightHandle && (
          <Handle
            type="target"
            position={Position.Right}
            className="w-2 h-2 bg-neutral-300"
            id="coreq-in"
            style={{ borderColor: "#d4d4d4" }}
          />
        )}
        <div className="inline-flex items-center justify-between gap-2 w-full">
          <div className="font-bold">{data.id}</div>

          <div className="text-xs text-gray-600">{data.creditHours} cr.</div>
        </div>
        <div className="text-sm">{data.name}</div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent node click event
            setShowDetails(!showDetails);
          }}
          className="text-xs mt-2 text-blue-600 hover:underline"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
        {showDetails && (
          <div className="mt-2 text-xs border-t pt-2">
            <p>
              <strong>Prerequisites:</strong>{" "}
              {data.prerequisites?.join(", ") || "None"}
            </p>
            <p>
              <strong>Corequisites:</strong>{" "}
              {data.corequisites?.join(", ") || "None"}
            </p>
            <p>
              <strong>Year:</strong> {data.year}
            </p>
          </div>
        )}
        {showBottomHandle && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-2 h-2"
            id="bottom"
          />
        )}
      </div>{" "}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:w-[540px]">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  nodeStyle.includes("bg-")
                    ? nodeStyle.split(" ")[0]
                    : "bg-gray-100"
                }`}
              ></div>
              <h2 className="text-xl font-bold">{data.id}</h2>
            </div>
            {/* <h3 className="text-lg">{data.name}</h3> */}
          </SheetHeader>

          <CourseContentSection courseId={data.id} />

          <SheetFooter className="hidden md:block ">
            <div className="text-xs text-gray-500">Click outside to close</div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function CourseContentSection({ courseId }: { courseId: string }) {
  const { content, isLoading, error } = useCourseContent(courseId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading course content</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="px-4 max-w-none overflow-auto">
      <div className="markdown-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      {/* styling for markdown content */}
      <style jsx>{`
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content h1 {
          font-size: 1.5rem;
        }
        .markdown-content h2 {
          font-size: 1.25rem;
        }
        .markdown-content h3 {
          font-size: 1.125rem;
        }
        .markdown-content p {
          margin-bottom: 0.75rem;
        }
        .markdown-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
}

export default memo(CourseNode);
