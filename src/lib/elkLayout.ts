/* Have Fun reading this */

import ELK from "elkjs/lib/elk.bundled.js";
import type { Node, Edge } from "@xyflow/react";

const elk = new ELK();

export interface ElkLayoutOptions {
  direction: "DOWN" | "UP" | "LEFT" | "RIGHT";
  nodeSpacing: number;
  layerSpacing: number;
  algorithm: string;
  alignment: string;
  smallComponentLayout: "vertical" | "grid";
  corequisiteLayout: "subgraph" | "adjacent";
}

const defaultOptions: ElkLayoutOptions = {
  direction: "DOWN",
  nodeSpacing: 50,
  layerSpacing: 100,
  algorithm: "layered",
  alignment: "CENTER",
  smallComponentLayout: "vertical",
  corequisiteLayout: "adjacent",
};

export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  options: Partial<ElkLayoutOptions> = {}
) => {
  const opts = { ...defaultOptions, ...options };

  const corequisitePairs = identifyCorequisitePairs(nodes, edges);

  const mainGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": opts.algorithm,
      "elk.direction": opts.direction,
      "elk.spacing.nodeNode": opts.nodeSpacing.toString(),
      "elk.layered.spacing.nodeNodeBetweenLayers": opts.layerSpacing.toString(),
      "elk.alignment": opts.alignment,
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      "elk.layered.nodePlacement.strategy": "SIMPLE",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.layered.mergeEdges": "true",
      "elk.spacing.componentComponent": "100",
      "elk.partitioning.activate": "true",
      "elk.layered.wrapping.strategy": "OFF",
      "elk.layered.compaction.connectedComponents": "true",
      "elk.layered.spacing.edgeNodeBetweenLayers": "30",
      "elk.layered.spacing.edgeEdgeBetweenLayers": "10",
    },
    children: [],
    edges: [],
  };

  const connectedComponents = findConnectedComponents(nodes, edges);

  const componentGraphs = await Promise.all(
    connectedComponents.map(async (component, index) => {
      const componentNodes = nodes.filter((node) =>
        component.nodes.has(node.id)
      );
      const componentEdges = edges.filter(
        (edge) =>
          component.nodes.has(edge.source) && component.nodes.has(edge.target)
      );
      const componentCorequisitePairs = new Map<string, string>();
      corequisitePairs.forEach((mainCourse, labCourse) => {
        if (component.nodes.has(labCourse) && component.nodes.has(mainCourse)) {
          componentCorequisitePairs.set(labCourse, mainCourse);
        }
      }); // subgraphs for corequisite pairs
      const corequisiteSubgraphs = new Map<string, string[]>();
      const processedNodes = new Set<string>();

      if (
        opts.corequisiteLayout === "subgraph" &&
        componentCorequisitePairs.size > 0
      ) {
        componentCorequisitePairs.forEach((mainCourse, labCourse) => {
          if (
            !processedNodes.has(mainCourse) &&
            !processedNodes.has(labCourse)
          ) {
            const subgraphId = `coreq-${mainCourse}`;
            corequisiteSubgraphs.set(subgraphId, [mainCourse, labCourse]);
            processedNodes.add(mainCourse);
            processedNodes.add(labCourse);
          }
        });
      }

      const children: any[] = [];
      const regularNodes = componentNodes.filter(
        (node) => !processedNodes.has(node.id)
      );

      regularNodes.forEach((node) => {
        children.push({
          id: node.id,
          width: 192,
          height: 120,
        });
      });

      if (opts.corequisiteLayout === "subgraph") {
        corequisiteSubgraphs.forEach((nodeIds, subgraphId) => {
          children.push({
            id: subgraphId,
            layoutOptions: {
              "elk.algorithm": "fixed",
              "elk.direction": "RIGHT",
              "elk.spacing.nodeNode": "20",
            },
            children: nodeIds.map((nodeId) => ({
              id: nodeId,
              width: 192,
              height: 120,
            })),
            width: 216 * nodeIds.length,
            height: 120,
          });
        });
      } else {
        // For adjacent layout, add all nodes normally and handle positioning later
        componentNodes
          .filter((node) => processedNodes.has(node.id))
          .forEach((node) => {
            children.push({
              id: node.id,
              width: 192,
              height: 120,
            });
          });
      }

      const graph = {
        id: `component-${index}`,
        layoutOptions: {
          "elk.algorithm": opts.algorithm,
          "elk.direction": opts.direction,
          "elk.spacing.nodeNode": opts.nodeSpacing.toString(),
          "elk.layered.spacing.nodeNodeBetweenLayers":
            opts.layerSpacing.toString(),
          "elk.alignment": opts.alignment,
          "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
          "elk.layered.cycleBreaking.strategy": "GREEDY",
          "elk.layered.nodePlacement.strategy": "SIMPLE",
          "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
          "elk.hierarchyHandling": "INCLUDE_CHILDREN",
        },
        children: children,
        edges: componentEdges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      const layoutResult = await elk.layout(graph);
      if (componentCorequisitePairs.size > 0) {
        console.info(
          `🌐🌐 Processing ${componentCorequisitePairs.size} corequisite pairs in component ${index}`
        );

        const doesOverlap = (
          x1: number,
          y1: number,
          w1: number,
          h1: number,
          x2: number,
          y2: number,
          w2: number,
          h2: number,
          padding: number = 20
        ): boolean => {
          return !(
            x1 + w1 + padding <= x2 ||
            x2 + w2 + padding <= x1 ||
            y1 + h1 + padding <= y2 ||
            y2 + h2 + padding <= y1
          );
        };

        // Create a list to track all positioned nodes (including lab courses)
        const positionedNodes: Array<{
          id: string;
          x: number;
          y: number;
          width: number;
          height: number;
        }> = [];
        // First pass: record all non-lab course positions
        layoutResult.children?.forEach((child) => {
          if (
            child.x !== undefined &&
            child.y !== undefined &&
            !componentCorequisitePairs.has(child.id)
          ) {
            positionedNodes.push({
              id: child.id,
              x: child.x,
              y: child.y,
              width: 192,
              height: 120,
            });
          }
        });

        console.log(
          `Found ${positionedNodes.length} main courses to avoid overlapping with`
        );

        // Second pass: position lab courses avoiding overlaps
        layoutResult.children?.forEach((child) => {
          const mainCourseId = componentCorequisitePairs.get(child.id);
          if (mainCourseId) {
            const mainCourseChild = layoutResult.children?.find(
              (c) => c.id === mainCourseId
            );
            if (
              mainCourseChild &&
              child.x !== undefined &&
              child.y !== undefined &&
              mainCourseChild.x !== undefined &&
              mainCourseChild.y !== undefined
            ) {
              console.log(
                `📰 Positioning lab course ${child.id} near main course ${mainCourseId}`
              );

              // Define possible positions around the main course
              const spacing = 280; // Horizontal spacing
              const verticalSpacing = 140; // Vertical spacing
              const positions = [
                { x: mainCourseChild.x + spacing, y: mainCourseChild.y }, // Right
                { x: mainCourseChild.x - spacing, y: mainCourseChild.y }, // Left
                {
                  x: mainCourseChild.x,
                  y: mainCourseChild.y + verticalSpacing,
                }, // Below
                {
                  x: mainCourseChild.x,
                  y: mainCourseChild.y - verticalSpacing,
                }, // Above
                {
                  x: mainCourseChild.x + spacing / 2,
                  y: mainCourseChild.y + verticalSpacing,
                }, // Bottom-right
                {
                  x: mainCourseChild.x - spacing / 2,
                  y: mainCourseChild.y + verticalSpacing,
                }, // Bottom-left
                {
                  x: mainCourseChild.x + spacing / 2,
                  y: mainCourseChild.y - verticalSpacing,
                }, // Top-right
                {
                  x: mainCourseChild.x - spacing / 2,
                  y: mainCourseChild.y - verticalSpacing,
                }, // Top-left
                {
                  x: mainCourseChild.x + spacing,
                  y: mainCourseChild.y + verticalSpacing,
                }, // Right-bottom
                {
                  x: mainCourseChild.x - spacing,
                  y: mainCourseChild.y + verticalSpacing,
                }, // Left-bottom
                {
                  x: mainCourseChild.x + spacing,
                  y: mainCourseChild.y - verticalSpacing,
                }, // Right-top
                {
                  x: mainCourseChild.x - spacing,
                  y: mainCourseChild.y - verticalSpacing,
                }, // Left-top
              ];

              // Find the first non-overlapping position
              let foundPosition = false;
              for (const pos of positions) {
                // Check if this position overlaps with any existing node
                let hasOverlap = false;
                for (const positioned of positionedNodes) {
                  if (
                    doesOverlap(
                      pos.x,
                      pos.y,
                      256,
                      120,
                      positioned.x,
                      positioned.y,
                      positioned.width,
                      positioned.height
                    )
                  ) {
                    hasOverlap = true;
                    break;
                  }
                }
                if (!hasOverlap) {
                  child.x = pos.x;
                  child.y = pos.y;
                  // Add this positioned lab course to the list for future overlap checks
                  positionedNodes.push({
                    id: child.id,
                    x: pos.x,
                    y: pos.y,
                    width: 192,
                    height: 120,
                  });
                  foundPosition = true;
                  console.log(
                    `Successfully positioned ${child.id} at (${pos.x.toFixed(
                      0
                    )}, ${pos.y.toFixed(0)})`
                  );
                  break;
                }
              }
              // If no position found, try positioning further away
              if (!foundPosition) {
                console.log(
                  `First pass failed for ${child.id}, trying larger spacing...`
                );

                const farSpacing = 420;
                const farPositions = [
                  { x: mainCourseChild.x + farSpacing, y: mainCourseChild.y },
                  { x: mainCourseChild.x - farSpacing, y: mainCourseChild.y },
                  {
                    x: mainCourseChild.x,
                    y: mainCourseChild.y + verticalSpacing * 2,
                  },
                  {
                    x: mainCourseChild.x + farSpacing,
                    y: mainCourseChild.y + verticalSpacing,
                  },
                  {
                    x: mainCourseChild.x - farSpacing,
                    y: mainCourseChild.y + verticalSpacing,
                  },
                ];

                for (const pos of farPositions) {
                  let hasOverlap = false;
                  for (const positioned of positionedNodes) {
                    if (
                      doesOverlap(
                        pos.x,
                        pos.y,
                        256,
                        120,
                        positioned.x,
                        positioned.y,
                        positioned.width,
                        positioned.height
                      )
                    ) {
                      hasOverlap = true;
                      break;
                    }
                  }
                  if (!hasOverlap) {
                    child.x = pos.x;
                    child.y = pos.y;
                    positionedNodes.push({
                      id: child.id,
                      x: pos.x,
                      y: pos.y,
                      width: 192,
                      height: 120,
                    });
                    foundPosition = true;
                    console.log(
                      `Successfully positioned ${
                        child.id
                      } with larger spacing at (${pos.x.toFixed(
                        0
                      )}, ${pos.y.toFixed(0)})`
                    );
                    break;
                  }
                }
              }

              if (!foundPosition) {
                console.log(
                  `Second pass failed for ${child.id}, trying spiral positioning...`
                );

                const spiralRadius = 350;
                const angleStep = Math.PI / 4;

                for (
                  let radius = spiralRadius;
                  radius <= spiralRadius * 3;
                  radius += 140
                ) {
                  for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
                    const spiralX =
                      mainCourseChild.x + Math.cos(angle) * radius;
                    const spiralY =
                      mainCourseChild.y + Math.sin(angle) * radius;

                    let hasOverlap = false;
                    for (const positioned of positionedNodes) {
                      if (
                        doesOverlap(
                          spiralX,
                          spiralY,
                          256,
                          120,
                          positioned.x,
                          positioned.y,
                          positioned.width,
                          positioned.height
                        )
                      ) {
                        hasOverlap = true;
                        break;
                      }
                    }
                    if (!hasOverlap) {
                      child.x = spiralX;
                      child.y = spiralY;
                      positionedNodes.push({
                        id: child.id,
                        x: spiralX,
                        y: spiralY,
                        width: 192,
                        height: 120,
                      });
                      foundPosition = true;
                      console.log(
                        `Successfully positioned ${
                          child.id
                        } with spiral at (${spiralX.toFixed(
                          0
                        )}, ${spiralY.toFixed(0)})`
                      );
                      break;
                    }
                  }
                  if (foundPosition) break;
                }
              } // Final fallback: keep original ELK position and warn
              if (!foundPosition) {
                console.warn(
                  `🟡 Could not find non-overlapping position for lab course ${
                    child.id
                  }, keeping ELK position at (${child.x.toFixed(
                    0
                  )}, ${child.y.toFixed(0)})`
                );
                positionedNodes.push({
                  id: child.id,
                  x: child.x,
                  y: child.y,
                  width: 192,
                  height: 120,
                });
              }
            }
          }
        });
      }

      return layoutResult;
    })
  ); // Position components: largest (main) component in the center-left, others on the right
  const sortedComponents = componentGraphs
    .map((graph, index) => ({
      graph,
      originalIndex: index,
      size: graph.children?.length || 0,
    }))
    .sort((a, b) => b.size - a.size);

  const layoutedNodes: Node[] = [];
  let rightSideX = 0;
  let mainComponentMaxX = 0;
  let currentRightSideY = 100;

  sortedComponents.forEach(({ graph, originalIndex }, componentIndex) => {
    const isMainComponent = componentIndex === 0; // Largest component

    let baseX = 0;
    let baseY = 0;

    if (isMainComponent) {
      baseX = 100;
      baseY = 100;
      graph.children?.forEach((child) => {
        if (child.x !== undefined) {
          mainComponentMaxX = Math.max(
            mainComponentMaxX,
            baseX + child.x + 256
          );
        }
      });
    } else {
      // Smaller components go to the right side
      if (rightSideX === 0) {
        rightSideX = mainComponentMaxX + 300; // 300px gap from main component
      }

      if (opts.smallComponentLayout === "grid" && componentIndex > 1) {
        const gridColumns = 2;
        const columnIndex = Math.floor((componentIndex - 1) / gridColumns);
        const rowIndex = (componentIndex - 1) % gridColumns;

        baseX = rightSideX + columnIndex * 400; // 400px between columns
        baseY = 100 + rowIndex * 400; // 400px between rows
      } else {
        baseX = rightSideX;
        baseY = currentRightSideY;

        let componentMaxY = 0;
        graph.children?.forEach((child) => {
          if (child.y !== undefined) {
            componentMaxY = Math.max(componentMaxY, child.y + 120);
          }
        });

        // spacing min 200px
        currentRightSideY = baseY + Math.max(componentMaxY, 200) + 100;
      }
    }
    graph.children?.forEach((child) => {
      if (child.children) {
        // This is a subgraph (corequisite pair), extract its children
        child.children.forEach((subChild: any) => {
          const originalNode = nodes.find((n) => n.id === subChild.id);
          if (
            originalNode &&
            subChild.x !== undefined &&
            subChild.y !== undefined &&
            child.x !== undefined &&
            child.y !== undefined
          ) {
            layoutedNodes.push({
              ...originalNode,
              position: {
                x: baseX + child.x + subChild.x,
                y: baseY + child.y + subChild.y,
              },
            });
          }
        });
      } else {
        const originalNode = nodes.find((n) => n.id === child.id);
        if (originalNode && child.x !== undefined && child.y !== undefined) {
          layoutedNodes.push({
            ...originalNode,
            position: {
              x: baseX + child.x,
              y: baseY + child.y,
            },
          });
        }
      }
    });
  });
  return {
    nodes: layoutedNodes,
    edges,
  };
};

function identifyCorequisitePairs(nodes: Node[], edges: Edge[]) {
  const corequisitePairs: Map<string, string> = new Map(); // lab -> main course

  const corequisiteEdges = edges.filter(
    (edge) =>
      edge.sourceHandle === "coreq-out" || edge.targetHandle === "coreq-in"
  );

  corequisiteEdges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceData = sourceNode.data as any;
      const targetData = targetNode.data as any;

      // lab courses have "Lab" in the name and fewer credit hours - peak engineering
      const isSourceLab =
        sourceData.name?.toLowerCase().includes("lab") ||
        sourceData.creditHours === 1;
      const isTargetLab =
        targetData.name?.toLowerCase().includes("lab") ||
        targetData.creditHours === 1;

      if (isSourceLab && !isTargetLab) {
        corequisitePairs.set(edge.source, edge.target); // source is lab, target is main
      } else if (isTargetLab && !isSourceLab) {
        corequisitePairs.set(edge.target, edge.source); // target is lab, source is main
      }
    }
  });

  return corequisitePairs;
}

function findConnectedComponents(nodes: Node[], edges: Edge[]) {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const adjacencyList = new Map<string, Set<string>>();

  nodeIds.forEach((id) => adjacencyList.set(id, new Set()));

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  });

  const visited = new Set<string>();
  const components: { nodes: Set<string> }[] = [];

  nodeIds.forEach((nodeId) => {
    if (!visited.has(nodeId)) {
      const component = new Set<string>();
      dfs(nodeId, adjacencyList, visited, component);
      components.push({ nodes: component });
    }
  });

  return components;
}

function dfs(
  nodeId: string,
  adjacencyList: Map<string, Set<string>>,
  visited: Set<string>,
  component: Set<string>
) {
  visited.add(nodeId);
  component.add(nodeId);

  adjacencyList.get(nodeId)?.forEach((neighbor) => {
    if (!visited.has(neighbor)) {
      dfs(neighbor, adjacencyList, visited, component);
    }
  });
}
