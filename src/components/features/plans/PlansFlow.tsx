import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import type { Roadmap, Course } from "@/lib/types";

import "@xyflow/react/dist/style.css";

interface PlansFlowProps {
  roadmap: Roadmap | null;
  courses: { [key: string]: Course };
}

const PlansFlow: React.FC<PlansFlowProps> = ({ roadmap, courses }) => {
  // Generate nodes and edges based on the roadmap data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!roadmap) return { initialNodes: [], initialEdges: [] };

    const nodes: any[] = [];
    const edges: any[] = [];
    const coursePositions: Record<string, { x: number; y: number }> = {};

    // First, create nodes with positions
    roadmap.courseIds.forEach((courseId, index) => {
      const course = courses[courseId];
      if (!course) return;

      // Calculate position based on year and some offset to prevent overlapping
      const year = course.year || 1;
      const xOffset = (index % 3) * 250;
      const yOffset = year * 150;

      // Store position for edge creation
      coursePositions[courseId] = { x: xOffset, y: yOffset };

      nodes.push({
        id: courseId,
        position: { x: xOffset, y: yOffset },
        data: {
          label: (
            <div>
              <div style={{ fontWeight: "bold" }}>{courseId}</div>
              <div>{course.name}</div>
              <div>{course.creditHours} Credits</div>
            </div>
          ),
        },
        style: {
          width: 200,
          border: "1px solid #ddd",
          borderRadius: "5px",
          padding: "10px",
        },
      });
    });

    // Then create edges based on prerequisites
    roadmap.courseIds.forEach((courseId) => {
      const course = courses[courseId];
      if (!course) return;

      course.prerequisites.forEach((prereqId) => {
        // Skip empty prerequisites
        if (!prereqId) return;

        // Only create edges for prerequisites that exist in this roadmap
        if (roadmap.courseIds.includes(prereqId)) {
          edges.push({
            id: `e-${prereqId}-${courseId}`,
            source: prereqId,
            target: courseId,
            type: "smoothstep",
            animated: true,
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [roadmap, courses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "85dvh",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
      //   className="min-h-[calc(100vh-4rem)]"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default PlansFlow;
