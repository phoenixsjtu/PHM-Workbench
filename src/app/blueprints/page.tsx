'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Handle,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  NodeTypes,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

type NodeKind = 'source' | 'transform' | 'train' | 'sink';

type StepData = {
  label: string;
  info: string;
  kind: NodeKind;
  config: Record<string, string>;
};

type LibraryItem = {
  type: string;
  label: string;
  info: string;
  kind: NodeKind;
};

type BlueprintVersion = {
  id: string;
  name: string;
  createdAt: string;
  nodes: Node<StepData>[];
  edges: Edge[];
};

const STORAGE_KEY = 'phm-workbench-blueprint-v1';

const nodeLibrary: LibraryItem[] = [
  { type: 'input', label: 'Signal Input', info: 'Synthetic vibration windows', kind: 'source' },
  { type: 'cleaning', label: 'Signal Cleaning', info: 'Missing samples and clipping', kind: 'transform' },
  { type: 'encoding', label: 'Windowing', info: '2,048 samples · 50% overlap', kind: 'transform' },
  { type: 'feature', label: 'Feature Engineering', info: 'RMS, kurtosis and spectral bands', kind: 'transform' },
  { type: 'train', label: 'Model Training', info: 'XGBoost / LightGBM', kind: 'train' },
  { type: 'evaluate', label: 'Evaluation', info: 'Macro F1 · split by equipment', kind: 'sink' },
];

const initialNodes: Node<StepData>[] = [
  {
    id: '1',
    type: 'step',
    position: { x: 60, y: 180 },
    data: { label: 'Signal Input', info: 'Synthetic vibration windows', kind: 'source', config: { source: 'demo://bearing-vibration', mapping: 'auto' } },
  },
  {
    id: '2',
    type: 'step',
    position: { x: 330, y: 180 },
    data: { label: 'Signal Cleaning', info: 'Missing samples and clipping', kind: 'transform', config: { missing: 'median', outlier: 'clip' } },
  },
  {
    id: '3',
    type: 'step',
    position: { x: 600, y: 180 },
    data: { label: 'Windowing', info: '2,048 samples · 50% overlap', kind: 'transform', config: { strategy: 'auto', note: '2048 samples with 50% overlap' } },
  },
  {
    id: '4',
    type: 'step',
    position: { x: 870, y: 180 },
    data: { label: 'Feature Engineering', info: 'RMS, kurtosis and spectral bands', kind: 'transform', config: { strategy: 'auto', note: 'RMS, kurtosis and spectral band energy' } },
  },
  {
    id: '5',
    type: 'step',
    position: { x: 1140, y: 180 },
    data: { label: 'Model Training', info: 'XGBoost / LightGBM', kind: 'train', config: { algorithm: 'xgboost', maxDepth: '6', learningRate: '0.05' } },
  },
  {
    id: '6',
    type: 'step',
    position: { x: 1410, y: 180 },
    data: { label: 'Evaluation', info: 'Macro F1 · split by equipment', kind: 'sink', config: { metric: 'F1', validation: 'grouped by asset', compare: 'enabled' } },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-4', source: '3', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4-5', source: '4', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5-6', source: '5', target: '6', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
];

const initialVersions: BlueprintVersion[] = [
  { id: 'v12', name: 'Bearing fault baseline', createdAt: '2026-04-21 09:30', nodes: initialNodes, edges: initialEdges },
];

function StepNode({ data, selected }: NodeProps<StepData>) {
  return (
    <div
      className={`min-w-[210px] rounded-3xl border px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur transition ${
        selected ? 'border-cyan-400/50 bg-slate-950/95' : 'border-white/10 bg-slate-950/85'
      }`}
    >
      {data.kind !== 'source' && <Handle type="target" position={Position.Left} />}
      {data.kind !== 'sink' && <Handle type="source" position={Position.Right} />}
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-400/10 text-xs font-semibold text-cyan-100">●</span>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-200">{data.kind}</span>
      </div>
      <p className="text-sm font-semibold text-white">{data.label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">{data.info}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
        <span className="rounded-full border border-white/10 px-2 py-1">Editable</span>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = { step: StepNode };

function createNodeFromLibrary(type: LibraryItem, index: number) {
  const id = `${type.type}-${Math.random().toString(36).slice(2, 8)}`;
  const defaults: Record<NodeKind, Record<string, string>> = {
    source: { source: 'demo://bearing-vibration', mapping: 'auto' },
    transform: { strategy: 'auto' },
    train: { algorithm: 'xgboost', maxDepth: '6', learningRate: '0.05' },
    sink: { metric: 'F1', validation: 'grouped by asset' },
  };

  return {
    id,
    type: 'step',
    position: { x: 120 + index * 80, y: 420 },
    data: { label: type.label, info: type.info, kind: type.kind, config: defaults[type.kind] },
  } satisfies Node<StepData>;
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/25 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BlueprintEditor() {
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('3');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [versions, setVersions] = useState<BlueprintVersion[]>(initialVersions);
  const [compareId, setCompareId] = useState<string>('v12');
  const [versionName, setVersionName] = useState('Bearing fault baseline');
  const [toast, setToast] = useState('');

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const comparisonTarget = versions.find((version) => version.id === compareId) ?? versions[0];

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { nodes: Node<StepData>[]; edges: Edge[]; versions?: BlueprintVersion[] };
      if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
      if (Array.isArray(parsed.edges)) setEdges(parsed.edges);
      if (parsed.versions?.length) setVersions(parsed.versions);
      setToast('Loaded saved blueprint from local storage.');
    } catch {
      setToast('Saved blueprint could not be restored.');
    }
  }, [setEdges, setNodes]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        handleDeleteSelected();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd' && selectedNodeId) {
        event.preventDefault();
        handleDuplicateSelected();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const selectedConfig = useMemo(() => selectedNode?.data.config ?? {}, [selectedNode]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const onConnect = (connection: Connection) =>
    setEdges((current) =>
      addEdge(
        { ...connection, animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
        current,
      ),
    );

  const appendNode = (libraryItem: LibraryItem) => {
    const nextNode = createNodeFromLibrary(libraryItem, nodes.length);
    setNodes((current) => [...current, nextNode]);
    setSelectedNodeId(nextNode.id);
    notify(`Added ${libraryItem.label}.`);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/reactflow');
    if (!raw) return;
    const item = JSON.parse(raw) as LibraryItem;
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = `${item.type}-${Math.random().toString(36).slice(2, 8)}`;
    const droppedNode: Node<StepData> = {
      id,
      type: 'step',
      position,
      data: { label: item.label, info: item.info, kind: item.kind, config: createNodeFromLibrary(item, 0).data.config },
    };
    setNodes((current) => [...current, droppedNode]);
    setSelectedNodeId(id);
    notify(`Dropped ${item.label} onto the canvas.`);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleLibraryDragStart = (event: React.DragEvent<HTMLButtonElement>, item: LibraryItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleSave = () => {
    const nextVersion: BlueprintVersion = {
      id: `v${versions.length + 12}`,
      name: versionName.trim() || `Version ${versions.length + 1}`,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    };
    const nextVersions = [nextVersion, ...versions];
    setVersions(nextVersions);
    setCompareId(nextVersion.id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, versions: nextVersions }));
    notify('Blueprint saved locally.');
  };

  const handleRun = () => {
    notify('Run simulated. The preview does not execute a model.');
  };

  function handleDeleteSelected() {
    if (!selectedNodeId || !selectedNode) return;
    void deleteElements({ nodes: [{ id: selectedNodeId }] });
    setNodes((current) => current.filter((node) => node.id !== selectedNodeId));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId((current) => current === selectedNodeId ? nodes.find((node) => node.id !== selectedNodeId)?.id ?? '' : current);
    notify(`Deleted ${selectedNode.data.label}.`);
  }

  function handleDuplicateSelected() {
    if (!selectedNode) return;
    const duplicateId = `${selectedNode.id}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const duplicate: Node<StepData> = {
      ...selectedNode,
      id: duplicateId,
      position: { x: selectedNode.position.x + 40, y: selectedNode.position.y + 40 },
      data: { ...selectedNode.data, label: `${selectedNode.data.label} Copy` },
    };
    setNodes((current) => [...current, duplicate]);
    setSelectedNodeId(duplicateId);
    notify(`Duplicated ${selectedNode.data.label}.`);
  }

  const updateSelectedNode = (field: 'label' | 'info', value: string) => {
    setNodes((current) => current.map((node) => (node.id === selectedNodeId ? { ...node, data: { ...node.data, [field]: value } } : node)));
  };

  const updateConfig = (field: string, value: string) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId ? { ...node, data: { ...node.data, config: { ...node.data.config, [field]: value } } } : node,
      ),
    );
  };

  const restoreVersion = (version: BlueprintVersion) => {
    setNodes(structuredClone(version.nodes));
    setEdges(structuredClone(version.edges));
    setSelectedNodeId(version.nodes[0]?.id ?? '');
    notify(`Rolled back to ${version.name}.`);
  };

  const compareNodes = nodes.length - (comparisonTarget?.nodes.length ?? 0);
  const compareEdges = edges.length - (comparisonTarget?.edges.length ?? 0);

  return (
    <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-900 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Blueprints</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Bearing diagnosis blueprint</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={versionName}
              onChange={(event) => setVersionName(event.target.value)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              aria-label="Version name"
              placeholder="Version name"
            />
            <button onClick={handleSave} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200" type="button">
              Save version
            </button>
            <button onClick={handleRun} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100" type="button">
              Simulate run
            </button>
          </div>
        </div>

        {toast ? <div role="status" className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{toast}</div> : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-[260px_1fr_340px]">
          <aside className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
            <PanelSection title="Node palette">
              <div className="space-y-2">
                {nodeLibrary.map((item) => (
                  <button
                    key={item.type}
                    draggable
                    onDragStart={(event) => handleLibraryDragStart(event, item)}
                    onClick={() => appendNode(item)}
                    className="w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/10"
                    type="button"
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="mt-1 text-xs text-slate-400">Drag or click to add</div>
                  </button>
                ))}
              </div>
            </PanelSection>

            <PanelSection title="Version history">
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{version.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{version.createdAt}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">{version.id}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => restoreVersion(version)}
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100"
                        type="button"
                      >
                        Roll back
                      </button>
                      <button
                        onClick={() => setCompareId(version.id)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                        type="button"
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </PanelSection>
          </aside>

          <section
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative min-h-[760px] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(122,162,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
            <div className="relative h-[760px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                onPaneClick={() => setSelectedNodeId('')}
                fitView
                className="text-slate-100"
              >
                <Background gap={42} size={1} color="rgba(255,255,255,0.08)" />
                <MiniMap zoomable pannable nodeColor={() => 'rgba(122,162,255,0.8)'} maskColor="rgba(4, 8, 16, 0.55)" />
                <Controls />
              </ReactFlow>
            </div>
          </section>

          <aside className="space-y-4">
            <PanelSection title="Inspector">
              <h2 className="text-lg font-semibold text-white">{selectedNode?.data.label || 'No node selected'}</h2>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs text-slate-400">Node label</span>
                  <input
                    value={selectedNode?.data.label ?? ''}
                    onChange={(event) => updateSelectedNode('label', event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-cyan-400/30"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">Description</span>
                  <textarea
                    value={selectedNode?.data.info ?? ''}
                    onChange={(event) => updateSelectedNode('info', event.target.value)}
                    className="mt-1 min-h-[92px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-cyan-400/30"
                  />
                </label>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-slate-400">Type</div>
                  <div className="mt-1 text-sm text-white">{selectedNode?.data.kind ?? 'transform'}</div>
                </div>
              </div>
            </PanelSection>

            <PanelSection title="Node config">
              <div className="space-y-3">
                {selectedNode?.data.kind === 'source' && (
                  <>
                    <label className="block">
                      <span className="text-xs text-slate-400">Data source</span>
                      <input
                        value={selectedConfig.source ?? ''}
                        onChange={(event) => updateConfig('source', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-slate-400">Field mapping</span>
                      <input
                        value={selectedConfig.mapping ?? ''}
                        onChange={(event) => updateConfig('mapping', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  </>
                )}

                {selectedNode?.data.kind === 'transform' && (
                  <>
                    <label className="block">
                      <span className="text-xs text-slate-400">Missing value strategy</span>
                      <select
                        value={selectedConfig.strategy ?? 'auto'}
                        onChange={(event) => updateConfig('strategy', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="median">Median</option>
                        <option value="mean">Mean</option>
                        <option value="drop">Drop rows</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs text-slate-400">Transform note</span>
                      <input
                        value={selectedConfig.note ?? 'standard'}
                        onChange={(event) => updateConfig('note', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  </>
                )}

                {selectedNode?.data.kind === 'train' && (
                  <>
                    <label className="block">
                      <span className="text-xs text-slate-400">Algorithm</span>
                      <select
                        value={selectedConfig.algorithm ?? 'xgboost'}
                        onChange={(event) => updateConfig('algorithm', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="xgboost">XGBoost</option>
                        <option value="lightgbm">LightGBM</option>
                        <option value="catboost">CatBoost</option>
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs text-slate-400">Max depth</span>
                        <input
                          value={selectedConfig.maxDepth ?? ''}
                          onChange={(event) => updateConfig('maxDepth', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-slate-400">Learning rate</span>
                        <input
                          value={selectedConfig.learningRate ?? ''}
                          onChange={(event) => updateConfig('learningRate', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                    </div>
                  </>
                )}

                {selectedNode?.data.kind === 'sink' && (
                  <>
                    <label className="block">
                      <span className="text-xs text-slate-400">Metric</span>
                      <select
                        value={selectedConfig.metric ?? 'F1'}
                        onChange={(event) => updateConfig('metric', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="AUC">AUC</option>
                        <option value="F1">Macro F1</option>
                        <option value="LogLoss">LogLoss</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs text-slate-400">Validation</span>
                      <input
                        value={selectedConfig.validation ?? ''}
                        onChange={(event) => updateConfig('validation', event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                      />
                    </label>
                  </>
                )}
              </div>
            </PanelSection>

            <PanelSection title="Actions">
              <div className="flex flex-wrap gap-2">
                <button onClick={handleDuplicateSelected} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200" type="button">
                  Duplicate
                </button>
                <button onClick={handleDeleteSelected} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-100" type="button">
                  Delete
                </button>
              </div>
            </PanelSection>
          </aside>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/25 p-5 text-sm text-slate-300">
          Compare against {comparisonTarget?.name ?? 'latest'} · Δ nodes {compareNodes >= 0 ? `+${compareNodes}` : compareNodes} · Δ edges {compareEdges >= 0 ? `+${compareEdges}` : compareEdges}
        </div>
      </div>
    </main>
  );
}

export default function BlueprintsPage() {
  return (
    <ReactFlowProvider>
      <BlueprintEditor />
    </ReactFlowProvider>
  );
}
