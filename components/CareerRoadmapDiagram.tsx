'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeProps,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  generateRoadmapGraph,
  type RoadmapPhases,
} from '@/lib/roadmapGraph';

export type DiagramDetailSelection =
  | {
      type: 'topic';
      phaseKey: string;
      topicIndex: number;
      source: 'learning_path' | 'goal';
      title: string;
      meta: string;
    }
  | {
      type: 'milestone';
      phaseKey: string;
      milestoneIndex: number;
      title: string;
    };

interface PhaseNodeData {
  phaseKey: string;
  title: string;
  duration: string;
  goalsCount: number;
  milestonesCount: number;
  index: number;
  accent: string;
  isExpanded: boolean;
}

interface TopicNodeData {
  phaseKey: string;
  title: string;
  meta: string;
  source: 'learning_path' | 'goal';
  topicIndex: number;
  resources: string[];
  projects: string[];
  isActive?: boolean;
  milestone: string | null;
  milestoneIndex: number | null;
}

interface TerminalNodeData {
  label: string;
  variant: 'start' | 'end';
}

interface DetailNodeData {
  label: string;
  variant: 'milestone' | 'project';
  phaseKey: string;
  topicIndex: number;
  milestoneIndex?: number | null;
}

const topicBadgeColors = ['#e0e7ff', '#cffafe', '#fee2e2', '#fef9c3'];
const detailColors: Record<DetailNodeData['variant'], { border: string; fill: string }> = {
  milestone: { border: '#fcd34d', fill: '#fffbeb' },
  project: { border: '#fed7aa', fill: '#fff7ed' },
};

const DETAIL_NODE_X_OFFSET = 280;
const DETAIL_NODE_GAP_Y = 70;
const DETAIL_STACK_WIDTH = 230;
const DETAIL_VERTICAL_PADDING = 80;

function PhaseNode({ data }: NodeProps<PhaseNodeData>) {
  return (
    <div className="w-72 rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div
        className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white"
        style={{ backgroundColor: data.accent }}
      >
        Phase {data.index}
      </div>
      <div className="px-5 py-4 space-y-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 leading-tight">
            {data.title}
          </h4>
          <p className="text-sm text-gray-500">{data.duration}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-dashed border-gray-200">
          <div className="flex items-center gap-4">
            <span>{data.goalsCount} goals</span>
            <span>{data.milestonesCount} milestones</span>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-indigo-600">
            {data.isExpanded ? (
              <>
                Collapse
                <span aria-hidden="true">▴</span>
              </>
            ) : (
              <>
                Expand
                <span aria-hidden="true">▾</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function TopicNode({ data }: NodeProps<TopicNodeData>) {
  const badge =
    topicBadgeColors[
      Math.abs(data.title.length + data.meta.length) % topicBadgeColors.length
    ];

  return (
    <div
      className={`w-64 rounded-2xl border bg-white shadow-md transition-shadow ${
        data.isActive ? 'border-indigo-300 shadow-xl' : 'border-gray-200'
      }`}
    >
      <div className="px-4 py-3 space-y-2">
        <span
          className="inline-flex text-[11px] font-semibold uppercase tracking-wide text-gray-700 px-2 py-1 rounded-full"
          style={{ backgroundColor: badge }}
        >
          {data.meta}
        </span>
        <p className="text-sm font-semibold text-gray-800 leading-snug break-words">
          {data.title}
        </p>
        {data.isActive && (
          <div className="pt-3 border-t border-dashed border-gray-200 text-xs text-gray-600 space-y-2 max-h-32 overflow-y-auto">
            {data.resources.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 mb-1 text-[11px] uppercase tracking-wide">
                  Resources
                </p>
                <ul className="space-y-1">
                  {data.resources.slice(0, 3).map((resource, idx) => (
                    <li key={idx} className="text-[11.5px] break-words">
                      • {resource}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalNode({ data }: NodeProps<TerminalNodeData>) {
  const isStart = data.variant === 'start';
  const color = isStart ? '#22c55e' : '#6366f1';
  return (
    <div className="flex items-center justify-center">
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
        style={{ backgroundColor: color }}
      >
        {data.label}
      </div>
    </div>
  );
}

function DetailNode({ data }: NodeProps<DetailNodeData>) {
  if (data.variant === 'milestone') {
    return (
      <div className="w-52 rounded-xl border border-amber-300 bg-white shadow-sm px-4 py-3 text-xs text-gray-700">
        <p className="uppercase text-[10px] text-amber-600 font-semibold tracking-wide">
          Milestone
        </p>
        <p className="text-sm font-semibold text-gray-900 break-words">
          {data.label}
        </p>
      </div>
    );
  }

  const palette = detailColors.project;
  return (
    <div
      className="w-52 rounded-xl border px-3 py-2 text-xs font-medium text-gray-700 shadow-sm bg-white"
      style={{ borderColor: palette.border, backgroundColor: palette.fill }}
    >
      <p className="uppercase tracking-wide text-[10px] text-gray-500 mb-1">
        Project / Practice
      </p>
      <p className="text-[11px] leading-snug break-words line-clamp-2">
        {data.label}
      </p>
    </div>
  );
}

const nodeTypes = {
  phase: PhaseNode,
  topic: TopicNode,
  terminal: TerminalNode,
  detail: DetailNode,
};

interface CareerRoadmapDiagramProps {
  phases: RoadmapPhases;
  activePhaseKey?: string | null;
  onSelectPhase?: (phaseKey: string | null) => void;
  onSelectDetail?: (detail: DiagramDetailSelection | null) => void;
}

export default function CareerRoadmapDiagram({
  phases,
  activePhaseKey,
  onSelectPhase,
  onSelectDetail,
}: CareerRoadmapDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  const phaseKeys = useMemo(() => Object.keys(phases), [phases]);
  const [expandedPhaseKeys, setExpandedPhaseKeys] = useState<string[]>(() =>
    phaseKeys[0] ? [phaseKeys[0]] : []
  );
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const graph = useMemo(
    () => generateRoadmapGraph(phases, expandedPhaseKeys),
    [phases, expandedPhaseKeys]
  );

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    setExpandedPhaseKeys((prev) => {
      const filtered = prev.filter((key) => phaseKeys.includes(key));
      if (filtered.length === 0 && phaseKeys[0]) {
        return [phaseKeys[0]];
      }
      return filtered;
    });
  }, [phaseKeys]);

  useEffect(() => {
    if (!activePhaseKey || activePhaseKey === '') return;
    setExpandedPhaseKeys((prev) => {
      if (prev.includes(activePhaseKey)) {
        return prev;
      }
      return [...prev, activePhaseKey];
    });
  }, [activePhaseKey]);

  useEffect(() => {
    if (activePhaseKey !== '' && activePhaseKey !== null && activePhaseKey !== undefined) {
      return;
    }
    setActiveTopicId(null);
    onSelectDetail?.(null);
  }, [activePhaseKey, onSelectDetail]);

  useEffect(() => {
    if (!activeTopicId) return;
    const exists = graph.nodes.some((node) => node.id === activeTopicId);
    if (!exists) {
      setActiveTopicId(null);
      onSelectDetail?.(null);
    }
  }, [graph.nodes, activeTopicId, onSelectDetail]);

  const nodesWithActiveFlag = useMemo(() => {
    return graph.nodes.map((node) => {
      if (node.type === 'topic' && node.id === activeTopicId) {
        return {
          ...node,
          data: { ...(node.data as TopicNodeData), isActive: true },
        };
      }
      if (node.type === 'topic') {
        return {
          ...node,
          data: { ...(node.data as TopicNodeData), isActive: false },
        };
      }
      return node;
    });
  }, [graph.nodes, activeTopicId]);

  const activeTopicNode = useMemo(() => {
    if (!activeTopicId) return null;
    return nodesWithActiveFlag.find(
      (node) => node.id === activeTopicId && node.type === 'topic'
    ) as Node<TopicNodeData> | undefined | null;
  }, [nodesWithActiveFlag, activeTopicId]);

  const detailNodes = useMemo<Node<DetailNodeData>[]>(() => {
    if (!activeTopicNode) return [];
    const topicData = activeTopicNode.data as TopicNodeData;
    const nodes: Node<DetailNodeData>[] = [];
    const baseX = activeTopicNode.position.x + DETAIL_NODE_X_OFFSET;

    let rowIndex = 0;
    const nodeY = (index: number) =>
      activeTopicNode.position.y + index * DETAIL_NODE_GAP_Y;

    if (topicData.milestone) {
      nodes.push({
        id: `${activeTopicNode.id}-milestone`,
        type: 'detail',
        position: {
          x: baseX,
          y: nodeY(rowIndex),
        },
        data: {
          label: topicData.milestone,
          variant: 'milestone',
          phaseKey: topicData.phaseKey,
          topicIndex: topicData.topicIndex,
          milestoneIndex: topicData.milestoneIndex,
        },
        draggable: false,
      });
      rowIndex += 1;
    }

    topicData.projects.slice(0, 3).forEach((label, idx) => {
      nodes.push({
        id: `${activeTopicNode.id}-project-${idx}`,
        type: 'detail',
        position: {
          x: baseX,
          y: nodeY(rowIndex) + 20,
        },
        data: {
          label,
          variant: 'project',
          phaseKey: topicData.phaseKey,
          topicIndex: topicData.topicIndex,
        },
        draggable: false,
      });
      rowIndex += 1;
    });

    return nodes;
  }, [activeTopicNode]);

  const detailEdges = useMemo<Edge[]>(() => {
    if (!activeTopicNode) return [];
    return detailNodes.map((node) => {
      const palette = detailColors[node.data.variant];
      return {
        id: `edge-${activeTopicNode.id}-${node.id}`,
        source: activeTopicNode.id,
        target: node.id,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: palette.border,
          width: 12,
          height: 12,
        },
        style: {
          stroke: palette.border,
          strokeWidth: 1.2,
        },
      };
    });
  }, [activeTopicNode, detailNodes]);

  const responsiveNodes = useMemo(() => {
    if (!activeTopicNode || detailNodes.length === 0) {
      return nodesWithActiveFlag;
    }

    const detailWidth = DETAIL_STACK_WIDTH;
    const detailHeight =
      Math.max(detailNodes.length * (DETAIL_NODE_GAP_Y - 50), (DETAIL_NODE_GAP_Y - 100)) +
      DETAIL_VERTICAL_PADDING;
    const horizontalTrigger = activeTopicNode.position.x + 140;
    const verticalTrigger = activeTopicNode.position.y + 20;

    return nodesWithActiveFlag.map((node) => {
      if (node.id === activeTopicNode.id) {
        return node;
      }

      let nextX = node.position.x;
      let nextY = node.position.y;

      if (node.position.x >= horizontalTrigger) {
        nextX += detailWidth;
      }

      if (node.position.y >= verticalTrigger) {
        nextY += detailHeight;
      }

      if (nextX === node.position.x && nextY === node.position.y) {
        return node;
      }

      return {
        ...node,
        position: { x: nextX, y: nextY },
      };
    });
  }, [nodesWithActiveFlag, activeTopicNode, detailNodes.length]);

  const nodes = useMemo(() => {
    return [...responsiveNodes, ...detailNodes];
  }, [responsiveNodes, detailNodes]);

  const edges = useMemo(() => {
    return [...graph.edges, ...detailEdges];
  }, [graph.edges, detailEdges]);

  const togglePhaseExpansion = useCallback(
    (phaseKey: string) => {
      setExpandedPhaseKeys((prev) => {
        const exists = prev.includes(phaseKey);
        const next = exists
          ? prev.filter((key) => key !== phaseKey)
          : [...prev, phaseKey];

        if (!exists) {
          onSelectPhase?.(phaseKey);
        } else {
          onSelectPhase?.(null);
          if (activeTopicId && activeTopicId.startsWith(`topic-${phaseKey}`)) {
            setActiveTopicId(null);
            onSelectDetail?.(null);
          }
        }
        return next;
      });
    },
    [activeTopicId, onSelectDetail, onSelectPhase]
  );

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type === 'phase') {
        const phaseKey = (node.data as PhaseNodeData).phaseKey;
        togglePhaseExpansion(phaseKey);
        return;
      }

      if (node.type === 'topic') {
        const data = node.data as TopicNodeData;
        if (node.id === activeTopicId) {
          setActiveTopicId(null);
          onSelectDetail?.(null);
          return;
        }
        setActiveTopicId(node.id);
        onSelectDetail?.({
          type: 'topic',
          phaseKey: data.phaseKey,
          topicIndex: data.topicIndex,
          source: data.source,
          title: data.title,
          meta: data.meta,
        });
        return;
      }

      if (node.type === 'detail') {
        const detailData = node.data as DetailNodeData;
        if (detailData.variant === 'milestone') {
          onSelectDetail?.({
            type: 'milestone',
            phaseKey: detailData.phaseKey,
            milestoneIndex: detailData.milestoneIndex ?? 0,
            title: detailData.label,
          });
        }
        return;
      }
    },
    [activeTopicId, onSelectDetail, togglePhaseExpansion]
  );

  if (!isMounted) {
    return (
      <div className="w-full h-[620px] rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm animate-pulse" />
    );
  }

  return (
    <div className="w-full h-[620px] rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        panOnDrag
        panOnScroll
        onNodeClick={handleNodeClick}
        zoomOnDoubleClick={false}
      >
        <MiniMap
          pannable
          zoomable
          nodeBorderRadius={6}
          nodeColor={(node) => {
            switch (node.type) {
              case 'phase':
                return '#4f46e5';
              case 'topic':
                return '#14b8a6';
              case 'detail':
                return '#94a3b8';
              default:
                return '#64748b';
            }
          }}
        />
        <Controls />
        <Background gap={32} color="#e0e7ff" />
      </ReactFlow>
    </div>
  );
}
