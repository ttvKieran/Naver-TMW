import type { Edge, Node } from "reactflow";

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
const MILESTONE_GAP_Y = 100;
const MAX_TOPICS = 4;

const PHASE_ACCENTS = ["#6366f1", "#0ea5e9", "#f97316", "#10b981"];

function buildTopicList(phase: RoadmapPhase) {
  if (phase.learning_path && phase.learning_path.length > 0) {
    return phase.learning_path.slice(0, MAX_TOPICS).map((item) => ({
      title: item.topic,
      meta: `Tuần ${item.week}`,
    }));
  }

  return phase.goals.slice(0, MAX_TOPICS).map((goal, idx) => ({
    title: goal,
    meta: `Mục tiêu ${idx + 1}`,
  }));
}

export function generateRoadmapGraph(
  phases: RoadmapPhases
): RoadmapGraphResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

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
        keyTopics: topics.map((topic) => topic.title),
        accent,
      },
    });

    edges.push({
      id: `edge-${previousPhaseNodeId}-${phaseNodeId}`,
      source: previousPhaseNodeId,
      target: phaseNodeId,
      type: "smoothstep",
    });

    previousPhaseNodeId = phaseNodeId;

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
        },
        draggable: false,
      });

      edges.push({
        id: `edge-${phaseKey}-topic-${topicIndex}`,
        source: phaseNodeId,
        target: topicNodeId,
        type: "smoothstep",
      });
    });

    const milestoneStartY =
      TOPIC_START_Y + topics.length * TOPIC_GAP_Y + 50;

    phaseData.milestones.forEach((milestone, milestoneIndex) => {
      const milestoneNodeId = `milestone-${phaseKey}-${milestoneIndex}`;
      nodes.push({
        id: milestoneNodeId,
        type: "milestone",
        position: {
          x: baseX,
          y: milestoneStartY + milestoneIndex * MILESTONE_GAP_Y,
        },
        data: {
          phaseKey,
          title: milestone,
          parentTitle: phaseData.title,
        },
        draggable: false,
      });

      edges.push({
        id: `edge-${phaseKey}-milestone-${milestoneIndex}`,
        source: phaseNodeId,
        target: milestoneNodeId,
        type: "smoothstep",
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
    data: { label: "Career Ready", variant: "end" },
    draggable: false,
  });

  edges.push({
    id: `edge-${previousPhaseNodeId}-${endNodeId}`,
    source: previousPhaseNodeId,
    target: endNodeId,
    type: "smoothstep",
  });

  return { nodes, edges };
}
