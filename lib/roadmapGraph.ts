import type { Edge, Node } from "reactflow";
import { MarkerType } from "reactflow";

export interface RoadmapPhase {
  title: string;
  duration: string;
  goals: string[];
  learning_path?: Array<{
    week: string;
    topic: string;
    resources: string[];
    projects: string[];
  }>;
  milestones: string[];
}

export type RoadmapPhases = Record<string, RoadmapPhase>;

export interface RoadmapGraphResult {
  nodes: Node[];
  edges: Edge[];
}

const COLUMN_WIDTH = 320;
const PHASE_Y = -40;
const TOPIC_START_Y = 140;
const TOPIC_GAP_Y = 110;
const MAX_TOPICS = 4;

const PHASE_ACCENTS = ["#6366f1", "#0ea5e9", "#f97316", "#10b981"];
const PRIMARY_EDGE_STROKE = "#4338ca";
const DETAIL_EDGE_STROKE = "#94a3b8";

type TopicListItem = {
  title: string;
  meta: string;
  source: "learning_path" | "goal";
  index: number;
  resources: string[];
  projects: string[];
};

function buildTopicList(phase: RoadmapPhase): TopicListItem[] {
  if (phase.learning_path && phase.learning_path.length > 0) {
    return phase.learning_path.slice(0, MAX_TOPICS).map((item, index) => ({
      title: item.topic,
      meta: `Week ${item.week}`,
      source: "learning_path",
      index,
      resources: item.resources ?? [],
      projects: item.projects ?? [],
    }));
  }

  return phase.goals.slice(0, MAX_TOPICS).map((goal, idx) => ({
    title: goal,
    meta: `Goal ${idx + 1}`,
    source: "goal",
    index: idx,
    resources: [],
    projects: [],
  }));
}

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
  phases: RoadmapPhases,
  expandedPhaseKeys: string[] = []
): RoadmapGraphResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const expandedSet = new Set(expandedPhaseKeys);
  const phaseEntries = Object.entries(phases);
  const startNodeId = "terminal-start";
  const endNodeId = "terminal-end";

  nodes.push({
    id: startNodeId,
    type: "terminal",
    position: { x: -200, y: 20 },
    data: { label: "Start", variant: "start" },
    draggable: false,
  });

  let previousPhaseNodeId: string = startNodeId;

  phaseEntries.forEach(([phaseKey, phaseData], phaseIndex) => {
    const baseX = phaseIndex * COLUMN_WIDTH;
    const phaseNodeId = `phase-${phaseKey}`;
    const accent =
      PHASE_ACCENTS[phaseIndex % PHASE_ACCENTS.length] ?? PHASE_ACCENTS[0];
    const topics = buildTopicList(phaseData);
    const isExpanded =
      expandedSet.size === 0 ? false : expandedSet.has(phaseKey);

    nodes.push({
      id: phaseNodeId,
      type: "phase",
      position: { x: baseX, y: PHASE_Y },
      data: {
        phaseKey,
        title: phaseData.title,
        duration: phaseData.duration,
        goalsCount: phaseData.goals.length,
        milestonesCount: phaseData.milestones.length,
        index: phaseIndex + 1,
        accent,
        isExpanded,
      },
    });

    edges.push({
      id: `edge-${previousPhaseNodeId}-${phaseNodeId}`,
      source: previousPhaseNodeId,
      target: phaseNodeId,
      type: "smoothstep",
      ...primaryEdgeStyle(),
    });

    previousPhaseNodeId = phaseNodeId;

    if (!isExpanded) {
      return;
    }

    topics.forEach((topic, topicIndex) => {
      const topicNodeId = `topic-${phaseKey}-${topicIndex}`;
      nodes.push({
        id: topicNodeId,
        type: "topic",
        position: {
          x: baseX,
          y: TOPIC_START_Y + topicIndex * TOPIC_GAP_Y,
        },
        data: {
          phaseKey,
          title: topic.title,
          meta: topic.meta,
          source: topic.source,
          topicIndex: topic.index,
          resources: topic.resources,
          projects: topic.projects,
          milestone: phaseData.milestones[topic.index] ?? null,
          milestoneIndex: phaseData.milestones[topic.index]
            ? topic.index
            : null,
        },
        draggable: false,
      });

      edges.push({
        id: `edge-${phaseKey}-topic-${topicIndex}`,
        source: phaseNodeId,
        target: topicNodeId,
        type: "smoothstep",
        ...detailEdgeStyle(),
      });
    });
  });

  nodes.push({
    id: endNodeId,
    type: "terminal",
    position: {
      x: phaseEntries.length * COLUMN_WIDTH,
      y: 20,
    },
    data: { label: "Ready", variant: "end" },
    draggable: false,
  });

  edges.push({
    id: `edge-${previousPhaseNodeId}-${endNodeId}`,
    source: previousPhaseNodeId,
    target: endNodeId,
    type: "smoothstep",
    ...primaryEdgeStyle(),
  });

  return { nodes, edges };
}
