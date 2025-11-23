'use client';

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface RoadmapFlowProps {
  roadmap: any;
  onToggleItem?: (stageIdx: number, areaIdx: number, itemIdx: number) => void;
}

// Custom node styles with glassmorphism effect
const getStageGradient = (idx: number) => {
  const gradients = [
    'from-purple-500 via-purple-600 to-indigo-600',
    'from-blue-500 via-blue-600 to-cyan-600',
    'from-pink-500 via-rose-600 to-red-600',
    'from-emerald-500 via-green-600 to-teal-600',
    'from-amber-500 via-orange-600 to-red-600',
  ];
  return gradients[idx % gradients.length];
};

export default function RoadmapFlow({ roadmap, onToggleItem }: RoadmapFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Transform roadmap data to React Flow nodes and edges
  useEffect(() => {
    if (!roadmap?.stages) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let yOffset = 0;
    const stageSpacing = 400;
    const areaSpacing = 250;
    const itemSpacing = 120;

    roadmap.stages.forEach((stage: any, stageIdx: number) => {
      // Add stage node (parent) with enhanced design
      const stageNodeId = `stage-${stageIdx}`;
      const stageGradient = getStageGradient(stageIdx);
      newNodes.push({
        id: stageNodeId,
        type: 'default',
        position: { x: 50, y: yOffset },
        data: {
          label: (
            <div className={`relative p-6 bg-gradient-to-br ${stageGradient} text-white rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -z-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/40 shadow-lg">
                    {stageIdx + 1}
                  </div>
                  <div className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full border border-white/30">
                    GIAI ĐOẠN
                  </div>
                </div>
                <div className="font-bold text-xl mb-2 drop-shadow-lg">{stage.name}</div>
                {stage.recommendedSemesters && stage.recommendedSemesters.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-xs bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/40 font-semibold flex items-center gap-1">
                      <span>📅</span> Kỳ {stage.recommendedSemesters.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ),
        },
        style: {
          width: 320,
          background: 'transparent',
          border: 'none',
        },
      });

      // Connect to previous stage (using sourceHandle and targetHandle to avoid overlap)
      if (stageIdx > 0) {
        const prevStageNodeId = `stage-${stageIdx - 1}`;
        newEdges.push({
          id: `${prevStageNodeId}-${stageNodeId}`,
          source: prevStageNodeId,
          target: stageNodeId,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: ConnectionLineType.SmoothStep,
          animated: true,
          style: { 
            stroke: '#7c3aed', 
            strokeWidth: 5,
            filter: 'drop-shadow(0 2px 8px rgba(124, 58, 237, 0.6))',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#7c3aed',
            width: 30,
            height: 30,
          },
          zIndex: 1000,
        });
      }

      let areaYOffset = yOffset + 150;

      stage.areas?.forEach((area: any, areaIdx: number) => {
        // Add area node with enhanced design
        const areaNodeId = `stage-${stageIdx}-area-${areaIdx}`;
        const areaItemCount = area.items?.length || 0;
        const completedCount = area.items?.filter((item: any) => item.check).length || 0;
        const progressPercent = areaItemCount > 0 ? (completedCount / areaItemCount) * 100 : 0;
        
        newNodes.push({
          id: areaNodeId,
          type: 'default',
          position: { x: 450, y: areaYOffset },
          data: {
            label: (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-purple-900 flex-1">{area.name}</div>
                  <div className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold">
                    {areaItemCount} items
                  </div>
                </div>
                {areaItemCount > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-purple-700 mb-1">
                      <span className="font-medium">Tiến độ</span>
                      <span className="font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
          style: {
            width: 280,
            background: 'transparent',
            border: 'none',
          },
        });

        // Connect stage to area with gradient
        newEdges.push({
          id: `${stageNodeId}-${areaNodeId}`,
          source: stageNodeId,
          target: areaNodeId,
          type: ConnectionLineType.SmoothStep,
          animated: true,
          style: { 
            stroke: '#9333ea', 
            strokeWidth: 3,
            filter: 'drop-shadow(0 1px 3px rgba(147, 51, 234, 0.3))',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#9333ea',
            width: 20,
            height: 20,
          },
        });

        let itemYOffset = areaYOffset;

        area.items?.forEach((item: any, itemIdx: number) => {
          const itemNodeId = `stage-${stageIdx}-area-${areaIdx}-item-${itemIdx}`;
          const statusColors = {
            already_mastered: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900' },
            review_needed: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900' },
            new_topic: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900' },
          };
          const status = item.personalization?.status || 'new_topic';
          const colors = statusColors[status as keyof typeof statusColors] || statusColors.new_topic;

          // Status badges and icons
          const statusIcons = {
            already_mastered: '✅',
            review_needed: '🔄',
            new_topic: '🆕',
          };
          const statusIcon = statusIcons[status as keyof typeof statusIcons] || '🆕';
          
          newNodes.push({
            id: itemNodeId,
            type: 'default',
            position: { x: 850, y: itemYOffset },
            data: {
              label: (
                <div
                  className={`relative p-4 ${colors.bg} border-2 ${colors.border} rounded-xl shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 group ${item.check ? 'opacity-75' : ''}`}
                  onClick={() => onToggleItem?.(stageIdx, areaIdx, itemIdx)}
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.check || false}
                        onChange={() => onToggleItem?.(stageIdx, areaIdx, itemIdx)}
                        className="w-5 h-5 mt-0.5 text-purple-600 rounded cursor-pointer accent-purple-600 transform hover:scale-110 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className={`text-sm font-bold ${colors.text} ${item.check ? 'line-through opacity-60' : ''} flex-1`}>
                            {item.title}
                          </div>
                          <div className="text-lg flex-shrink-0">{statusIcon}</div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          {item.estimatedHours > 0 && (
                            <div className="text-xs bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-300 font-semibold flex items-center gap-1">
                              <span>⏱️</span>
                              <span>{item.estimatedHours}h</span>
                            </div>
                          )}
                          {item.check && (
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-300 font-semibold">
                              Hoàn thành
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            style: {
              width: 320,
              background: 'transparent',
              border: 'none',
            },
          });

          // Connect area to item with style
          newEdges.push({
            id: `${areaNodeId}-${itemNodeId}`,
            source: areaNodeId,
            target: itemNodeId,
            type: ConnectionLineType.SmoothStep,
            animated: false,
            style: { 
              stroke: '#a855f7', 
              strokeWidth: 2,
              filter: 'drop-shadow(0 1px 2px rgba(168, 85, 247, 0.2))',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#a855f7',
              width: 18,
              height: 18,
            },
          });

          // Connect items sequentially within same area (dependency flow)
          if (itemIdx > 0) {
            const prevItemNodeId = `stage-${stageIdx}-area-${areaIdx}-item-${itemIdx - 1}`;
            newEdges.push({
              id: `${prevItemNodeId}-${itemNodeId}`,
              source: prevItemNodeId,
              target: itemNodeId,
              type: ConnectionLineType.SmoothStep,
              animated: true,
              style: { 
                stroke: '#94a3b8', 
                strokeWidth: 2, 
                strokeDasharray: '8,4',
              },
              markerEnd: {
                type: MarkerType.Arrow,
                color: '#94a3b8',
              },
            });
          }

          itemYOffset += itemSpacing;
        });

        areaYOffset = Math.max(areaYOffset + areaSpacing, itemYOffset);
      });

      yOffset = areaYOffset + stageSpacing - 150;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [roadmap, onToggleItem, setNodes, setEdges]);

  return (
    <div className="w-full h-[800px] bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.4, maxZoom: 1.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          color="#c084fc" 
          gap={20}
          size={1.5}
          style={{ opacity: 0.3 }}
        />
        <Controls 
          className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-purple-200"
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.id.startsWith('stage-') && !node.id.includes('area')) return '#7c3aed';
            if (node.id.includes('area') && !node.id.includes('item')) return '#a855f7';
            return '#c084fc';
          }}
          maskColor="rgba(124, 58, 237, 0.1)"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #e9d5ff',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
          nodeBorderRadius={8}
        />
      </ReactFlow>
    </div>
  );
}
