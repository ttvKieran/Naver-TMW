'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeProps,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import type { Node, DefaultEdgeOptions } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  generateRoadmapGraph,
  type RoadmapPhases,
} from '@/lib/roadmapGraph';

interface PhaseNodeData {
  phaseKey: string;
  title: string;
  duration: string;
  goalsCount: number;
  milestonesCount: number;
  index: number;
  keyTopics: string[];
  accent: string;
}

interface TopicNodeData {
  phaseKey: string;
  title: string;
  meta: string;
}

interface MilestoneNodeData {
  phaseKey: string;
  title: string;
  parentTitle: string;
}

interface TerminalNodeData {
  label: string;
  variant: 'start' | 'end';
}

const phasePalette = ['#eef2ff', '#e0f2fe', '#ecfccb', '#ffedd5'];
const topicBadgeColors = ['#e0e7ff', '#cffafe', '#fee2e2', '#fef9c3'];

function PhaseNode({ data }: NodeProps<PhaseNodeData>) {
  const bg = phasePalette[(data.index - 1) % phasePalette.length];

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
        <div className="flex flex-wrap gap-2">
          {data.keyTopics.map((topic, idx) => (
            <span
              key={topic}
              className="text-xs font-medium px-3 py-1 rounded-full border border-gray-200 text-gray-700"
              style={{ backgroundColor: bg }}
            >
              {topic}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-dashed border-gray-200">
          <span>{data.goalsCount} goals</span>
          <span>{data.milestonesCount} milestones</span>
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
    <div className="w-60 rounded-2xl border border-gray-200 bg-white shadow-md">
      <div className="px-4 py-3 space-y-2">
        <span
          className="inline-flex text-[11px] font-semibold uppercase tracking-wide text-gray-700 px-2 py-1 rounded-full"
          style={{ backgroundColor: badge }}
        >
          {data.meta}
        </span>
        <p className="text-sm font-semibold text-gray-800 leading-snug">
          {data.title}
        </p>
      </div>
    </div>
  );
}

function MilestoneNode({ data }: NodeProps<MilestoneNodeData>) {
  return (
    <div className="w-56 rounded-2xl border border-amber-200 bg-white shadow-sm">
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs font-semibold uppercase text-amber-600">
          Milestone
        </p>
        <p className="text-sm font-medium text-gray-800">{data.title}</p>
        <p className="text-xs text-gray-500">{data.parentTitle}</p>
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

const nodeTypes = {
  phase: PhaseNode,
  topic: TopicNode,
  milestone: MilestoneNode,
  terminal: TerminalNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#94a3b8', strokeWidth: 1.5 },
};

interface CareerRoadmapDiagramProps {
  phases: RoadmapPhases;
  onSelectPhase?: (phaseKey: string | null) => void;
}

export default function CareerRoadmapDiagram({
  phases,
  onSelectPhase,
}: CareerRoadmapDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  const graph = useMemo(() => generateRoadmapGraph(phases), [phases]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: Node<PhaseNodeData | TopicNodeData | MilestoneNodeData | TerminalNodeData>) => {
      if (!onSelectPhase) return;
      const phaseKey = (node?.data as { phaseKey?: string })?.phaseKey;
      if (phaseKey) {
        onSelectPhase(phaseKey);
      } else {
        onSelectPhase(null);
      }
    },
    [onSelectPhase]
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
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        panOnDrag
        panOnScroll
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
              case 'milestone':
                return '#f97316';
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
