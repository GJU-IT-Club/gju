import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from "@xyflow/react";
import type { Roadmap, Course } from "@/lib/types";
import { getLayoutedElements } from "@/lib/elkLayout";

import "@xyflow/react/dist/style.css";
import CourseNode from "./CourseNode";

interface PlansFlowProps {
  roadmap: Roadmap | null;
  courses: { [key: string]: Course };
}

const PlansFlow: React.FC<PlansFlowProps> = ({ roadmap, courses }) => {
  const [isLayouting, setIsLayouting] = useState(false);

  const { initialNodes, initialEdges } = useMemo(() => {
    if (!roadmap) return { initialNodes: [], initialEdges: [] };

    const nodes: any[] = [];
    const edges: any[] = [];

    roadmap.courseIds.forEach((courseId, index) => {
      const course = courses[courseId];
      if (!course) return;

      nodes.push({
        id: courseId,
        position: { x: 0, y: 0 }, // Will be set by ELK
        type: "courseNode",
        data: {
          id: courseId,
          name: course.name,
          creditHours: course.creditHours,
          category: course.category,
          prerequisites: course.prerequisites || [],
          corequisites: course.corequisites || [],
          year: course.year,
        },
      });
    });

    Object.keys(courses).forEach((courseId) => {
      const course = courses[courseId];
      if (!course) return;

      course.prerequisites.forEach((prereqId) => {
        if (!prereqId) return;

        if (courses[prereqId]) {
          edges.push({
            id: `e-prereq-${prereqId}-${courseId}`,
            source: prereqId,
            target: courseId,
            sourceHandle: "bottom",
            targetHandle: "top",
            type: "smoothstep",
            animated: true,
          });
        }
      });

      course.corequisites?.forEach((coreqId) => {
        if (!coreqId) return;

        if (courses[coreqId]) {
          edges.push({
            id: `e-coreq-${courseId}-${coreqId}`,
            source: courseId,
            target: coreqId,
            sourceHandle: "coreq-out",
            targetHandle: "coreq-in",
            type: "straight",
            style: { stroke: "#d4d4d4" },
            animated: true,
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [roadmap, courses]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Apply ELK layout when initialNodes and initialEdges change
  useEffect(() => {
    const applyLayout = async () => {
      if (initialNodes.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }

      setIsLayouting(true);
      try {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          await getLayoutedElements(initialNodes, initialEdges, {
            direction: "DOWN",
            alignment: "CENTER",
            algorithm: "layered",
            nodeSpacing: 80,
            layerSpacing: 150,
          });

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error("Layout error:", error);
        // Fallback to original positions if layout fails
        setNodes(initialNodes);
        setEdges(initialEdges);
      } finally {
        setIsLayouting(false);
      }
    };

    applyLayout();
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = {
    courseNode: CourseNode,
  };

  if (isLayouting) {
    return (
      <div
        style={{
          width: "100%",
          height: "85dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-primary-foreground">
            Organizing course layout...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "85dvh",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnDoubleClick={true}
        zoomOnScroll={true}
      >
        <Controls />
        <MiniMap
          // nodeColor={(node) => {
          //   const course = courses[node.id];
          //   return course ? course.category : "#eee";
          // }}
          nodeStrokeWidth={2}
          zoomable={false}
          pannable={false}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default PlansFlow;
