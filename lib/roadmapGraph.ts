import type { Edge, Node } from "reactflow";
import { MarkerType } from "reactflow";

export interface RoadmapItem {
  itemId: string;
  type: 'skill' | 'concept' | 'project' | 'course';
  category: 'skill' | 'concept' | 'project' | 'course';
  title: string;
  subtitle?: string;
  status?: 'locked' | 'available' | 'completed';
  description?: string;
  skillTags?: string[];
  prerequisites?: string[];
  requiredSkills?: Array<{ tag: string; min_level: number }>;
  estimatedHours?: number;
  
  // Personalization fields
  personalization?: {
    status?: 'already_mastered' | 'high_priority' | 'medium_priority' | 'low_priority' | 'optional' | 'not_assigned' | 'review_needed' | 'new_topic';
    priority?: string;
    reason?: string;
    personalizedDescription?: string;
  };
  check?: boolean;
}

export interface RoadmapArea {
  areaId: string;
  title: string;
  description?: string;
  items: RoadmapItem[];
}

export interface RoadmapStage {
  stageId: string;
  title: string;
  description?: string;
  index: number;
  areas: RoadmapArea[];
}

export type RoadmapData = RoadmapStage[];

export interface RoadmapGraphResult {
  nodes: Node[];
  edges: Edge[];
}

const STAGE_GAP_X = 600;
const AREA_GAP_Y = 130;
const ITEM_GAP_Y = 120;

const PHASE_ACCENTS = ["#6366f1", "#0ea5e9", "#f97316", "#10b981"];
const PRIMARY_EDGE_STROKE = "#4338ca";
const DETAIL_EDGE_STROKE = "#94a3b8";

function primaryEdgeStyle() {
  return {
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: PRIMARY_EDGE_STROKE,
      width: 16,
      height: 16,
    },
    style: {
      stroke: PRIMARY_EDGE_STROKE,
      strokeWidth: 2,
    },
    animated: true,
  } as const;
}

function detailEdgeStyle() {
  return {
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: DETAIL_EDGE_STROKE,
      width: 12,
      height: 12,
    },
    style: {
      stroke: DETAIL_EDGE_STROKE,
      strokeWidth: 1.3,
      strokeDasharray: "4 2",
    },
  } as const;
}

export function generateRoadmapGraph(
  stages: RoadmapData,
  expandedStageIds: string[] = [],
  expandedAreaIds: string[] = []
): RoadmapGraphResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const expandedStageSet = new Set(expandedStageIds);
  const expandedAreaSet = new Set(expandedAreaIds);
  const startNodeId = "terminal-start";
  const endNodeId = "terminal-end";

  nodes.push({
    id: startNodeId,
    type: "terminal",
    position: { x: -200, y: 50 },
    data: { label: "Start", variant: "start" },
    draggable: false,
  });

  let previousStageLastNodeId: string = startNodeId;
  let currentX = 0;

  stages.forEach((stage, stageIndex) => {
    const stageNodeId = `stage-${stage.stageId}`;
    const isStageExpanded = expandedStageSet.has(stage.stageId);
    
    // Stage Node
    nodes.push({
      id: stageNodeId,
      type: "stage",
      position: { x: currentX, y: 0 },
      data: { 
        stageId: stage.stageId,
        title: stage.title,
        description: stage.description,
        index: stage.index || stageIndex + 1,
        isExpanded: isStageExpanded
      },
      draggable: false,
    });

    // Connect from previous stage/start to this stage
    edges.push({
      id: `edge-${previousStageLastNodeId}-${stageNodeId}`,
      source: previousStageLastNodeId,
      target: stageNodeId,
      type: "smoothstep",
      ...primaryEdgeStyle(),
    });

    previousStageLastNodeId = stageNodeId;

    if (isStageExpanded) {
      let currentY = 150; // Start areas below stage node
      
      stage.areas.forEach((area, areaIndex) => {
        const areaNodeId = `area-${area.areaId}`;
        const isAreaExpanded = expandedAreaSet.has(area.areaId);

        // Area Node
        nodes.push({
          id: areaNodeId,
          type: "phase", // Using 'phase' type for Area as per component mapping
          position: { x: currentX + 50, y: currentY + 100 }, // Indented relative to stage
          data: {
            areaId: area.areaId,
            title: area.title,
            description: area.description,
            stageId: stage.stageId,
            isExpanded: isAreaExpanded
          },
          draggable: false,
        });

        // Connect Stage to Area
        edges.push({
          id: `edge-${stageNodeId}-${areaNodeId}`,
          source: stageNodeId,
          target: areaNodeId,
          type: "smoothstep",
          ...detailEdgeStyle(),
        });

        if (isAreaExpanded) {
          let itemY = currentY + 100;
          area.items.forEach((item, itemIndex) => {
            const itemNodeId = item.itemId || `item-${area.areaId}-${itemIndex}`;
            
            nodes.push({
              id: itemNodeId,
              type: "topic",
              position: { x: currentX + 100, y: itemY + 100 }, // Further indented
              data: {
                itemId: item.itemId,
                title: item.title,
                category: item.category || item.type,
                description: item.description,
                stageId: stage.stageId,
                areaId: area.areaId,
                skillTags: item.skillTags,
                prerequisites: item.prerequisites,
                requiredSkills: item.requiredSkills,
                estimatedHours: item.estimatedHours,
                personalization: item.personalization,
                check: item.check
              },
              draggable: false,
            });

            // Connect Area to Item
            edges.push({
              id: `edge-${areaNodeId}-${itemNodeId}`,
              source: areaNodeId,
              target: itemNodeId,
              type: "smoothstep",
              ...detailEdgeStyle(),
            });

            itemY += ITEM_GAP_Y;
          });
          currentY = itemY;
        } else {
          currentY += AREA_GAP_Y;
        }
      });
    }

    currentX += STAGE_GAP_X;
  });

  nodes.push({
    id: endNodeId,
    type: "terminal",
    position: {
      x: currentX,
      y: 50,
    },
    data: { label: "Ready", variant: "end" },
    draggable: false,
  });

  edges.push({
    id: `edge-${previousStageLastNodeId}-${endNodeId}`,
    source: previousStageLastNodeId,
    target: endNodeId,
    type: "smoothstep",
    ...primaryEdgeStyle(),
  });

  return { nodes, edges };
}
