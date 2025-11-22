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
  {
    type: 'topic';
    phaseKey: string;
    topicIndex: number;
    source: 'learning_path' | 'goal';
    title: string;
    meta: string;
    milestone?: string | null;
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

const topicBadgeColors = ['#e0e7ff', '#cffafe', '#fee2e2', '#fef9c3'];

function PhaseNode({ data }: NodeProps<PhaseNodeData>) {
  return (
    <div className="w-80 rounded-3xl border border-border bg-card shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
      <div
        className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: data.accent }}
      >
        Phase {data.index}
      </div>
      <div className="px-5 py-4 space-y-3">
        <div>
          <h4 className="text-lg font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
            {data.title}
          </h4>
          <p className="text-sm text-muted-foreground font-medium">{data.duration}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-dashed border-border">
          <div className="flex items-center gap-4 font-medium">
            <span>{data.goalsCount} goals</span>
            <span>{data.milestonesCount} milestones</span>
          </div>
          <span className="inline-flex items-center gap-1 font-bold text-primary">
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
      className={`w-80 rounded-xl border bg-card shadow-sm transition-all ${data.isActive ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
        }`}
    >
      <div className="px-4 py-3 space-y-2">
        <span
          className="inline-flex text-[10px] font-bold uppercase tracking-wide text-foreground px-2.5 py-1 rounded-full bg-muted"
        >
          {data.meta}
        </span>
        <p className="text-sm font-bold text-foreground leading-snug break-words">
          {data.title}
        </p>
      </div>
    </div>
  );
}

function TerminalNode({ data }: NodeProps<TerminalNodeData>) {
  const isStart = data.variant === 'start';
  const color = isStart ? 'var(--primary)' : 'var(--secondary)';
  return (
    <div className="flex items-center justify-center">
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white ring-2 ring-border"
        style={{ backgroundColor: color }}
      >
        {data.label}
      </div>
    </div>
  );
}

const nodeTypes = {
  phase: PhaseNode,
  topic: TopicNode,
  terminal: TerminalNode,
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

  const nodes = useMemo(() => {
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

  const edges = useMemo(() => {
    return graph.edges;
  }, [graph.edges]);

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
          milestone: data.milestone,
        });
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
