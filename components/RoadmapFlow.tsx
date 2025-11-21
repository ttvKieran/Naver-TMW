'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    Edge,
    Node,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Component
const RoadmapNode = ({ data }: { data: any }) => {
    return (
        <div className={`px-4 py-3 shadow-lg rounded-xl border-2 min-w-[200px] bg-white ${data.isTarget ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
            }`}>
            <Handle type="target" position={Position.Left} className="!bg-gray-400" />

            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${data.phase === 'phase1' ? 'bg-green-100 text-green-700' :
                            data.phase === 'phase2' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'
                        }`}>
                        {data.duration}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{data.label}</h3>
                <ul className="text-xs text-gray-500 space-y-1 list-disc pl-3">
                    {data.goals.slice(0, 2).map((goal: string, i: number) => (
                        <li key={i}>{goal}</li>
                    ))}
                    {data.goals.length > 2 && <li>+{data.goals.length - 2} more...</li>}
                </ul>
            </div>

            <Handle type="source" position={Position.Right} className="!bg-blue-500" />
        </div>
    );
};

const nodeTypes = {
    roadmapNode: RoadmapNode,
};

interface RoadmapFlowProps {
    roadmapData: any;
}

export default function RoadmapFlow({ roadmapData }: RoadmapFlowProps) {
    // Transform roadmap data into nodes and edges
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        if (!roadmapData?.roadmap) return { nodes: [], edges: [] };

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let xPos = 0;
        const xGap = 300;

        // Sort phases to ensure order
        const phases = ['phase1', 'phase2', 'phase3'];

        phases.forEach((phaseKey, index) => {
            const phase = roadmapData.roadmap[phaseKey];
            if (!phase) return;

            nodes.push({
                id: phaseKey,
                type: 'roadmapNode',
                position: { x: xPos, y: 100 },
                data: {
                    label: phase.title,
                    duration: phase.duration,
                    goals: phase.goals,
                    phase: phaseKey,
                    isTarget: index === 0 // Highlight first phase as current/start
                },
            });

            if (index > 0) {
                edges.push({
                    id: `e-${phases[index - 1]}-${phaseKey}`,
                    source: phases[index - 1],
                    target: phaseKey,
                    animated: true,
                    style: { stroke: '#3b82f6', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#3b82f6',
                    },
                });
            }

            xPos += xGap;
        });

        return { nodes, edges };
    }, [roadmapData]);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    if (!roadmapData) {
        return (
            <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500">Select a career to view its roadmap</p>
            </div>
        );
    }

    return (
        <div className="h-[500px] w-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#e5e7eb" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
