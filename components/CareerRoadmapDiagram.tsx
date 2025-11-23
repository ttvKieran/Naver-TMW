'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  generateRoadmapGraph,
  type RoadmapStage,
} from '@/lib/roadmapGraph';

export type DiagramDetailSelection =
  {
    type: 'topic';
    stageId: string;
    areaId: string;
    itemId: string;
    title: string;
    category: string;
    description?: string;
    skillTags?: string[];
    prerequisites?: string[];
    requiredSkills?: any[];
    estimatedHours?: number;
    personalization?: {
      status?: string;
      priority?: string;
      reason?: string;
      description?: string;
    };
    check?: boolean;
  };

interface StageNodeData {
  stageId: string;
  title: string;
  description: string;
  index: number;
  isExpanded: boolean;
}

interface PhaseNodeData { // Represents an Area now
  areaId: string;
  title: string;
  description: string;
  stageId: string;
  isExpanded: boolean;
}

interface TopicNodeData {
  itemId: string;
  title: string;
  category: 'skill' | 'concept' | 'project' | 'course';
  description: string;
  stageId: string;
  areaId: string;
  isActive?: boolean;
  skillTags?: string[];
  prerequisites?: string[];
  requiredSkills?: any[];
  estimatedHours?: number;
  personalization?: {
    status?: string;
    priority?: string;
    reason?: string;
    description?: string;
  };
  check?: boolean;
}

interface TerminalNodeData {
  label: string;
  variant: 'start' | 'end';
}

function StageNode({ data }: NodeProps<StageNodeData>) {
  return (
    <div className="w-[500px] rounded-3xl border-2 border-primary/20 bg-card/50 shadow-xl backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-colors group">
      <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Stage {data.index}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {data.isExpanded ? 'Collapse' : 'Expand'}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">{data.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      </div>
    </div>
  );
}

function PhaseNode({ data }: NodeProps<PhaseNodeData>) {
  return (
    <div className="w-96 rounded-2xl border border-border bg-card shadow-lg overflow-hidden hover:shadow-xl transition-all group">
      <div className="px-5 py-4 border-l-4 border-secondary">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-bold text-foreground group-hover:text-secondary transition-colors">
            {data.title}
          </h4>
          <span className="text-xs text-muted-foreground">
            {data.isExpanded ? '▼' : '▶'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {data.description}
        </p>
      </div>
    </div>
  );
}

function TopicNode({ data }: NodeProps<TopicNodeData>) {
  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'skill': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'project': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'concept': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'already_mastered': return 'bg-green-100 text-green-700 border-green-200';
      case 'high_priority': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium_priority': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low_priority': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'new_topic': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return null;
    }
  };

  const statusColor = getStatusColor(data.personalization?.status);

  return (
    <div
      className={`w-80 rounded-xl border bg-card shadow-sm transition-all ${
        data.isActive 
          ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-105' 
          : 'border-border hover:border-primary/30 hover:shadow-md'
      } ${data.check ? 'opacity-60' : ''}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getBadgeColor(data.category)}`}>
              {data.category}
            </span>
            {statusColor && (
               <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusColor}`}>
                 {data.personalization?.status?.replace('_', ' ')}
               </span>
             )}
          </div>
          {data.estimatedHours && (
             <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {data.estimatedHours}h
             </span>
           )}
        </div>
        <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-foreground leading-snug mb-2">
              {data.title}
            </p>
            {data.check && (
                <div className="text-green-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
            )}
        </div>
        
        {data.personalization?.reason && (
            <p className="text-xs text-muted-foreground italic mb-2 border-l-2 border-primary/20 pl-2 line-clamp-3">
                "{data.personalization.reason}"
            </p>
        )}
        {/* {data.skillTags && data.skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {data.skillTags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted/50 border border-border rounded text-muted-foreground">
                {tag}
              </span>
            ))}
            {data.skillTags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{data.skillTags.length - 3}</span>
            )}
          </div>
        )} */}
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
        className="h-24 w-24 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg border-4 border-white ring-2 ring-border uppercase tracking-wider"
        style={{ backgroundColor: color }}
      >
        {data.label}
      </div>
    </div>
  );
}

const nodeTypes = {
  stage: StageNode,
  phase: PhaseNode, // This is actually "Area" in the new data model
  topic: TopicNode,
  terminal: TerminalNode,
};

interface CareerRoadmapDiagramProps {
  roadmapData: RoadmapStage[];
  onSelectDetail?: (detail: DiagramDetailSelection | null) => void;
  selectedItemId?: string | null;
}

export default function CareerRoadmapDiagram({
  roadmapData,
  onSelectDetail,
  selectedItemId,
}: CareerRoadmapDiagramProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Track expanded states
  const [expandedStageIds, setExpandedStageIds] = useState<string[]>([]);
  const [expandedAreaIds, setExpandedAreaIds] = useState<string[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Sync activeItemId with selectedItemId prop and ensure visibility
  useEffect(() => {
    if (selectedItemId !== undefined) {
      setActiveItemId(selectedItemId);

      if (selectedItemId) {
        // Find the item in roadmapData to get its stageId and areaId
        for (const stage of roadmapData) {
          for (const area of stage.areas) {
            const item = area.items.find(i => i.itemId === selectedItemId);
            if (item) {
              // Expand stage if not already expanded
              setExpandedStageIds(prev => 
                prev.includes(stage.stageId) ? prev : [...prev, stage.stageId]
              );
              // Expand area if not already expanded
              setExpandedAreaIds(prev => 
                prev.includes(area.areaId) ? prev : [...prev, area.areaId]
              );
              return;
            }
          }
        }
      }
    }
  }, [selectedItemId, roadmapData]);

  // Initialize expansion
  useEffect(() => {
    if (roadmapData.length > 0) {
      // Expand first stage by default
      setExpandedStageIds([roadmapData[0].stageId]);
      // Expand first area of first stage by default
      if (roadmapData[0].areas.length > 0) {
        setExpandedAreaIds([roadmapData[0].areas[0].areaId]);
      }
    }
  }, [roadmapData]);

  const graph = useMemo(
    () => generateRoadmapGraph(roadmapData, expandedStageIds, expandedAreaIds),
    [roadmapData, expandedStageIds, expandedAreaIds]
  );

  useEffect(() => setIsMounted(true), []);

  const nodes = useMemo(() => {
    return graph.nodes.map((node) => {
      if (node.type === 'topic') {
        return {
          ...node,
          data: { 
            ...(node.data as TopicNodeData), 
            isActive: node.id === activeItemId 
          },
        };
      }
      return node;
    });
  }, [graph.nodes, activeItemId]);

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type === 'stage') {
        const stageId = (node.data as StageNodeData).stageId;
        setExpandedStageIds(prev => 
          prev.includes(stageId) 
            ? prev.filter(id => id !== stageId)
            : [...prev, stageId]
        );
        return;
      }

      if (node.type === 'phase') { // Area node
        const areaId = (node.data as PhaseNodeData).areaId;
        setExpandedAreaIds(prev => 
          prev.includes(areaId) 
            ? prev.filter(id => id !== areaId)
            : [...prev, areaId]
        );
        return;
      }

      if (node.type === 'topic') {
        const data = node.data as TopicNodeData;
        if (node.id === activeItemId) {
          setActiveItemId(null);
          onSelectDetail?.(null);
          return;
        }
        setActiveItemId(node.id);
        onSelectDetail?.({
          type: 'topic',
          stageId: data.stageId,
          areaId: data.areaId,
          itemId: data.itemId,
          title: data.title,
          category: data.category,
          description: data.description,
          skillTags: data.skillTags,
          prerequisites: data.prerequisites,
          requiredSkills: data.requiredSkills,
          estimatedHours: data.estimatedHours,
          personalization: data.personalization,
          check: data.check
        });
        return;
      }
    },
    [activeItemId, onSelectDetail]
  );

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] rounded-2xl border border-border bg-muted/10 animate-pulse" />
    );
  }

  return (
    <div className="w-full h-[800px] rounded-2xl border border-border bg-slate-50/50 shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        panOnDrag
        panOnScroll
        onNodeClick={handleNodeClick}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <MiniMap
          pannable
          zoomable
          nodeBorderRadius={8}
          nodeColor={(node) => {
            switch (node.type) {
              case 'stage': return '#e2e8f0';
              case 'phase': return '#cbd5e1';
              case 'topic': return '#94a3b8';
              default: return '#64748b';
            }
          }}
        />
        <Controls />
        <Background gap={24} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
