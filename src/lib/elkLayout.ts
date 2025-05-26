import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export interface ElkLayoutOptions {
  direction: 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';
  nodeSpacing: number;
  layerSpacing: number;
  algorithm: string;
  alignment: string;
}

const defaultOptions: ElkLayoutOptions = {
  direction: 'DOWN',
  nodeSpacing: 50,
  layerSpacing: 100,
  algorithm: 'layered',
  alignment: 'CENTER',
};

export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  options: Partial<ElkLayoutOptions> = {}
) => {
  const opts = { ...defaultOptions, ...options };
    // Create main graph for connected components
  const mainGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': opts.algorithm,
      'elk.direction': opts.direction,
      'elk.spacing.nodeNode': opts.nodeSpacing.toString(),
      'elk.layered.spacing.nodeNodeBetweenLayers': opts.layerSpacing.toString(),
      'elk.alignment': opts.alignment,
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.mergeEdges': 'true',
      'elk.spacing.componentComponent': '100',
      'elk.partitioning.activate': 'true',
      'elk.layered.wrapping.strategy': 'OFF',
      'elk.layered.compaction.connectedComponents': 'true',
      'elk.layered.spacing.edgeNodeBetweenLayers': '30',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '10',
    },
    children: [],
    edges: [],
  };

  // Find connected components
  const connectedComponents = findConnectedComponents(nodes, edges);
  
  // Create separate graphs for each component
  const componentGraphs = await Promise.all(
    connectedComponents.map(async (component, index) => {
      const componentNodes = nodes.filter(node => component.nodes.has(node.id));
      const componentEdges = edges.filter(edge => 
        component.nodes.has(edge.source) && component.nodes.has(edge.target)
      );

      const graph = {
        id: `component-${index}`,
        layoutOptions: {
          'elk.algorithm': opts.algorithm,
          'elk.direction': opts.direction,
          'elk.spacing.nodeNode': opts.nodeSpacing.toString(),
          'elk.layered.spacing.nodeNodeBetweenLayers': opts.layerSpacing.toString(),
          'elk.alignment': opts.alignment,
          'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
          'elk.layered.cycleBreaking.strategy': 'GREEDY',
          'elk.layered.nodePlacement.strategy': 'SIMPLE',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        },
        children: componentNodes.map(node => ({
          id: node.id,
          width: 256, // CourseNode width
          height: 120, // Estimated CourseNode height
        })),
        edges: componentEdges.map(edge => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      return await elk.layout(graph);
    })
  );

  // Position components: largest (main) component in the center-left, others on the right
  const sortedComponents = componentGraphs
    .map((graph, index) => ({ graph, originalIndex: index, size: graph.children?.length || 0 }))
    .sort((a, b) => b.size - a.size);

  const layoutedNodes: Node[] = [];
  let rightSideX = 0;
  let mainComponentMaxX = 0;

  sortedComponents.forEach(({ graph, originalIndex }, componentIndex) => {
    const isMainComponent = componentIndex === 0; // Largest component
    
    let baseX = 0;
    let baseY = 0;

    if (isMainComponent) {
      // Main component starts at origin
      baseX = 100;
      baseY = 100;
      // Track the maximum X position of the main component
      graph.children?.forEach(child => {
        if (child.x !== undefined) {
          mainComponentMaxX = Math.max(mainComponentMaxX, baseX + child.x + 256);
        }
      });
    } else {
      // Smaller components go to the right side
      if (rightSideX === 0) {
        rightSideX = mainComponentMaxX + 200; // 200px gap from main component
      }
      baseX = rightSideX;
      baseY = 100 + (componentIndex - 1) * 300; // Stack vertically with spacing
    }

    graph.children?.forEach(child => {
      const originalNode = nodes.find(n => n.id === child.id);
      if (originalNode && child.x !== undefined && child.y !== undefined) {
        layoutedNodes.push({
          ...originalNode,
          position: {
            x: baseX + child.x,
            y: baseY + child.y,
          },
        });
      }
    });
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

function findConnectedComponents(nodes: Node[], edges: Edge[]) {
  const nodeIds = new Set(nodes.map(n => n.id));
  const adjacencyList = new Map<string, Set<string>>();
  
  // Initialize adjacency list
  nodeIds.forEach(id => adjacencyList.set(id, new Set()));
  
  // Build adjacency list (undirected for component detection)
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.add(edge.target);
    adjacencyList.get(edge.target)?.add(edge.source);
  });
  
  const visited = new Set<string>();
  const components: { nodes: Set<string> }[] = [];
  
  // Find all connected components using DFS
  nodeIds.forEach(nodeId => {
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
  
  adjacencyList.get(nodeId)?.forEach(neighbor => {
    if (!visited.has(neighbor)) {
      dfs(neighbor, adjacencyList, visited, component);
    }
  });
}
