'use client';

import * as React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge as XYEdge,
  Node as XYNode,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  LayoutGrid,
  MousePointer2,
  Hand,
  Grid3x3,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Plus,
  Layers,
  Activity,
  Download,
} from 'lucide-react';

import { useAppStore } from '@/src/core/store';
import { nodeTypes } from './customNodes';
import { getNodeDefinition } from './catalog';
import { LogicNodeDefinition, RecipeDefinition } from './types';
import { AddNodeModal } from './AddNodeModal';
import { RecipesDrawer } from './RecipesDrawer';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { LogicTopBar } from './LogicTopBar';
import { DebugBar } from './DebugBar';
import { CodeViewerModal } from '@/src/features/codeViewer';
import { Node as CoreNode, Edge as CoreEdge } from '@/src/core/types';

function LogicEditorInner() {
  const { project, activePageId, theme, addToast } = useAppStore();

  const reactFlowInstance = useReactFlow();
  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  // État local des nœuds et des liens du graphe
  const [nodes, setNodes, onNodesChange] = useNodesState<XYNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<XYEdge>([]);

  // Modales et tiroirs
  const [isAddNodeOpen, setAddNodeOpen] = React.useState(false);
  const [isRecipesOpen, setRecipesOpen] = React.useState(false);
  const [isDiagnosticsOpen, setDiagnosticsOpen] = React.useState(false);
  const [isCodeViewerOpen, setCodeViewerOpen] = React.useState(false);
  const [isDebugOpen, setDebugOpen] = React.useState(false);
  const [selectedNodeForCode, setSelectedNodeForCode] = React.useState<string | undefined>(undefined);
  const [pendingNodePosition, setPendingNodePosition] = React.useState<{ x: number; y: number }>({ x: 100, y: 100 });
  const [isTesting, setIsTesting] = React.useState(false);

  // Pro Canva States
  const [isPanMode, setIsPanMode] = React.useState(false);
  const [snapToGrid, setSnapToGrid] = React.useState(true);
  const [boundedToCanvas, setBoundedToCanvas] = React.useState(true);
  const [bgVariant, setBgVariant] = React.useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [zoomLevel, setZoomLevel] = React.useState<number>(100);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar hold for temporary panning
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        setIsPanMode(true);
      }
      // Ctrl+D or Cmd+D to duplicate selected nodes
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const selected = nodes.filter((n) => n.selected);
        if (selected.length > 0) {
          selected.forEach((n) => handleNodeDuplicate(n.id));
        }
      }
      // Delete or Backspace to delete selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        const selected = nodes.filter((n) => n.selected);
        if (selected.length > 0) {
          selected.forEach((n) => handleNodeDelete(n.id));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nodes]);

  // Synchronisation avec le store lors des modifications
  const syncToStore = React.useCallback(
    (currentNodes: XYNode[], currentEdges: XYEdge[]) => {
      const coreNodes: CoreNode[] = currentNodes.map((n) => {
        const def = getNodeDefinition(n.type || '');
        const { onChange, onDelete, onDuplicate, ...cleanData } = n.data || {};
        return {
          id: n.id,
          type: n.type || 'action_show_message',
          category: (def?.category as any) || 'action',
          position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
          data: cleanData,
          inputs: def?.inputs.map((i) => i.id) || [],
          outputs: def?.outputs.map((o) => o.id) || [],
        };
      });

      const coreEdges: CoreEdge[] = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
      }));

      useAppStore.setState((state) => {
        const p = state.project.pages.find((page) => page.id === state.activePageId);
        if (p) {
          if (!p.graphs || p.graphs.length === 0) {
            p.graphs = [{ id: 'graph-main', name: 'Logique Principale', nodes: coreNodes, edges: coreEdges }];
          } else {
            p.graphs[0].nodes = coreNodes;
            p.graphs[0].edges = coreEdges;
          }
        }
      });
    },
    []
  );

  const handleNodeDataChange = React.useCallback(
    (nodeId: string, newData: Record<string, any>) => {
      setNodes((nds) => {
        const updated = nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        });
        setEdges((eds) => {
          syncToStore(updated, eds);
          return eds;
        });
        return updated;
      });
    },
    [syncToStore]
  );

  const handleNodeDelete = React.useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const updated = nds.filter((n) => n.id !== nodeId);
        setEdges((eds) => {
          const updatedEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
          syncToStore(updated, updatedEdges);
          return updatedEdges;
        });
        return updated;
      });
      addToast({
        type: 'info',
        title: 'Bloc supprimé',
        duration: 2000,
      });
    },
    [addToast, syncToStore]
  );

  const handleNodeDuplicate = React.useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const target = nds.find((n) => n.id === nodeId);
        if (!target) return nds;
        const newId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newNode: XYNode = {
          ...target,
          id: newId,
          position: { x: target.position.x + 40, y: target.position.y + 40 },
          data: {
            ...target.data,
            label: `${target.data.label || 'Bloc'} (copie)`,
          },
          selected: true,
        };
        const updated = [...nds.map((n) => ({ ...n, selected: false })), newNode];
        setEdges((eds) => {
          syncToStore(updated, eds);
          return eds;
        });
        return updated;
      });
      addToast({
        type: 'success',
        title: 'Bloc dupliqué',
        duration: 2000,
      });
    },
    [addToast, syncToStore]
  );

  // Initialisation du graphe
  React.useEffect(() => {
    if (!activePage) return;

    const pageGraph = activePage.graphs?.[0];
    if (pageGraph && pageGraph.nodes && pageGraph.nodes.length > 0) {
      const xyNodes: XYNode[] = pageGraph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.position?.x ?? 100, y: n.position?.y ?? 100 },
        data: {
          ...n.data,
          onChange: handleNodeDataChange,
          onDelete: handleNodeDelete,
          onDuplicate: handleNodeDuplicate,
        },
      }));

      const xyEdges: XYEdge[] = (pageGraph.edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        animated: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle,
        style: {
          strokeWidth: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle ? 2.5 : 2,
          stroke: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle ? '#3B82F6' : '#14B8A6',
        },
      }));

      setNodes(xyNodes);
      setEdges(xyEdges);
    } else {
      const defaultNodes: XYNode[] = [
        {
          id: 'node-start-1',
          type: 'event_page_load',
          position: { x: 80, y: 160 },
          data: {
            label: 'Au chargement de la page',
            onChange: handleNodeDataChange,
            onDelete: handleNodeDelete,
            onDuplicate: handleNodeDuplicate,
          },
        },
        {
          id: 'node-action-1',
          type: 'action_show_message',
          position: { x: 420, y: 160 },
          data: {
            label: 'Message de bienvenue',
            messageText: 'Bienvenue sur notre application interactive ! ✨',
            messageType: 'success',
            onChange: handleNodeDataChange,
            onDelete: handleNodeDelete,
            onDuplicate: handleNodeDuplicate,
          },
        },
        {
          id: 'node-js-1',
          type: 'js_script_custom',
          position: { x: 420, y: 340 },
          data: {
            label: 'Traitement JS',
            code: '// Script JS exécutable\nreturn "Données traitées: " + (input_a || "OK");',
            onChange: handleNodeDataChange,
            onDelete: handleNodeDelete,
            onDuplicate: handleNodeDuplicate,
          },
        },
        {
          id: 'node-note-1',
          type: 'comment_sticky',
          position: { x: 80, y: 20 },
          data: {
            label: 'Note Pro',
            commentText: '👋 Canevas Pro : Glissez pour déplacer les blocs, double-cliquez pour ajouter un nœud, ou cliquez sur « Organiser le graphe » pour un rangement automatique !',
            colorTheme: 'yellow',
            onChange: handleNodeDataChange,
            onDelete: handleNodeDelete,
            onDuplicate: handleNodeDuplicate,
          },
        },
      ];

      const defaultEdges: XYEdge[] = [
        {
          id: 'e-start-msg',
          source: 'node-start-1',
          target: 'node-action-1',
          sourceHandle: 'flow_out',
          targetHandle: 'flow_in',
          animated: true,
          style: { strokeWidth: 2.5, stroke: '#3B82F6' },
        },
      ];

      setNodes(defaultNodes);
      setEdges(defaultEdges);
    }
  }, [activePageId]);

  // Validation des connexions
  const isValidConnection = React.useCallback(
    (connection: Connection | XYEdge): boolean => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;

      const sourceHandle = connection.sourceHandle || '';
      const targetHandle = connection.targetHandle || '';

      const isSourceFlow = sourceHandle.startsWith('flow_') || sourceHandle === 'flow';
      const isTargetFlow = targetHandle.startsWith('flow_') || targetHandle === 'flow';

      if (isSourceFlow && !isTargetFlow) return false;
      if (!isSourceFlow && isTargetFlow) return false;

      return true;
    },
    []
  );

  const onConnect = React.useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) {
        addToast({
          type: 'warning',
          title: 'Connexion incompatible',
          message: 'Reliez les flèches de flux entre elles et les ronds de données aux ports correspondants.',
        });
        return;
      }

      const isFlow = params.sourceHandle?.startsWith('flow_') || params.sourceHandle === 'flow';
      const newEdge: XYEdge = {
        ...params,
        id: `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        animated: isFlow,
        style: {
          strokeWidth: isFlow ? 2.5 : 2,
          stroke: isFlow ? '#3B82F6' : '#14B8A6',
        },
      };

      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        syncToStore(nodes, updated);
        return updated;
      });

      addToast({
        type: 'success',
        title: isFlow ? 'Flux relié ✨' : 'Donnée transmise 🔗',
        duration: 1500,
      });
    },
    [isValidConnection, nodes, syncToStore, addToast]
  );

  // Double-clic pour ajouter un bloc
  const onPaneDoubleClick = React.useCallback(
    (event: React.MouseEvent) => {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setPendingNodePosition(position);
      setAddNodeOpen(true);
    },
    [reactFlowInstance]
  );

  // Ajout d'un nœud
  const handleSelectNode = React.useCallback(
    (definition: LogicNodeDefinition) => {
      const newId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newNode: XYNode = {
        id: newId,
        type: definition.type,
        position: pendingNodePosition,
        data: {
          ...definition.defaultData,
          label: definition.name,
          onChange: handleNodeDataChange,
          onDelete: handleNodeDelete,
          onDuplicate: handleNodeDuplicate,
        },
        selected: true,
      };

      setNodes((nds) => {
        const updated = [...nds.map((n) => ({ ...n, selected: false })), newNode];
        syncToStore(updated, edges);
        return updated;
      });

      addToast({
        type: 'success',
        title: `Bloc « ${definition.name} » ajouté`,
        duration: 2000,
      });
    },
    [pendingNodePosition, edges, syncToStore, addToast]
  );

  // Auto-Layout du Graphe (DAG Layout)
  const handleAutoLayout = React.useCallback(() => {
    if (!nodes.length) return;

    const categoryOrder: Record<string, number> = {
      comment: 0,
      event: 0,
      data: 1,
      logic: 2,
      action: 3,
      tool: 4,
      group: 5,
    };

    const columns: Record<number, XYNode[]> = {};

    nodes.forEach((n) => {
      const def = getNodeDefinition(n.type || '');
      const colIndex = categoryOrder[def?.category || 'action'] ?? 2;
      if (!columns[colIndex]) columns[colIndex] = [];
      columns[colIndex].push(n);
    });

    const columnWidth = 360;
    const rowHeight = 240;
    const startX = 80;
    const startY = 80;

    const newNodes = nodes.map((node) => {
      const def = getNodeDefinition(node.type || '');
      const colIndex = categoryOrder[def?.category || 'action'] ?? 2;
      const colNodes = columns[colIndex] || [node];
      const itemIndex = colNodes.findIndex((cn) => cn.id === node.id);

      return {
        ...node,
        position: {
          x: startX + colIndex * columnWidth,
          y: startY + itemIndex * rowHeight,
        },
      };
    });

    setNodes(newNodes);
    syncToStore(newNodes, edges);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
    }, 100);

    addToast({
      type: 'success',
      title: 'Graphe réorganisé proprement ✨',
      duration: 2000,
    });
  }, [nodes, edges, syncToStore, reactFlowInstance, addToast]);

  // Vider le canevas
  const handleClearCanvas = React.useCallback(() => {
    if (window.confirm('Voulez-vous vraiment effacer tous les blocs du canevas ?')) {
      setNodes([]);
      setEdges([]);
      syncToStore([], []);
      addToast({
        type: 'info',
        title: 'Canevas réinitialisé',
        duration: 2000,
      });
    }
  }, [syncToStore, addToast]);

  // Application de recette
  const handleApplyRecipe = React.useCallback(
    (recipe: RecipeDefinition) => {
      const extractElements = (el: any): Array<{ id: string; name: string; type: string }> => {
        if (!el) return [];
        let list = [{ id: el.id, name: el.customName || el.props?.text || el.type, type: el.type }];
        if (el.children) {
          for (const c of el.children) {
            list = list.concat(extractElements(c));
          }
        }
        return list;
      };

      const pageElements = activePage?.root ? extractElements(activePage.root) : [];
      const recipeGraph = recipe.createGraph(pageElements);

      const xyNodes: XYNode[] = recipeGraph.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.position?.x ?? 100, y: n.position?.y ?? 100 },
        data: {
          ...n.data,
          onChange: handleNodeDataChange,
          onDelete: handleNodeDelete,
          onDuplicate: handleNodeDuplicate,
        },
      }));

      const xyEdges: XYEdge[] = recipeGraph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        animated: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle,
        style: {
          strokeWidth: 2.5,
          stroke: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle ? '#3B82F6' : '#14B8A6',
        },
      }));

      setNodes(xyNodes);
      setEdges(xyEdges);
      syncToStore(xyNodes, xyEdges);

      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
      }, 100);

      addToast({
        type: 'success',
        title: `Recette appliquée : « ${recipe.name} »`,
        message: 'Vous pouvez personnaliser les éléments et paramètres cibles.',
        duration: 4000,
      });
    },
    [activePage, syncToStore, reactFlowInstance, addToast]
  );

  // Test du flux
  const handleRunTest = React.useCallback(() => {
    setIsTesting(true);
    addToast({
      type: 'info',
      title: 'Simulation du flux en cours…',
      message: 'Les actions s’exécutent dans l’ordre des connexions.',
      duration: 3000,
    });

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: true,
        style: { ...e.style, stroke: '#F59E0B', strokeWidth: 3.5 },
      }))
    );

    setTimeout(() => {
      setIsTesting(false);
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle,
          style: {
            strokeWidth: 2.5,
            stroke: e.sourceHandle?.startsWith('flow_') || !e.sourceHandle ? '#3B82F6' : '#14B8A6',
          },
        }))
      );
      addToast({
        type: 'success',
        title: 'Simulation terminée avec succès ! ✨',
        message: 'Tous les blocs ont réagi correctement.',
      });
    }, 2500);
  }, [addToast]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-[#F7F7FA] dark:bg-[#12121B]">
      {/* 1. Top Bar */}
      <LogicTopBar
        onOpenAddNode={() => {
          setPendingNodePosition({ x: 250, y: 200 });
          setAddNodeOpen(true);
        }}
        onOpenRecipes={() => setRecipesOpen(true)}
        onToggleDiagnostics={() => setDiagnosticsOpen(!isDiagnosticsOpen)}
        isDiagnosticsOpen={isDiagnosticsOpen}
        onOpenCodeViewer={() => setCodeViewerOpen(true)}
        onToggleDebug={() => setDebugOpen(!isDebugOpen)}
        isDebugOpen={isDebugOpen}
        onRunTest={handleRunTest}
        isTesting={isTesting}
      />

      {/* 2. Zone du Canvas */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <div className="flex-1 h-full w-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onDoubleClick={onPaneDoubleClick}
            nodeTypes={nodeTypes}
            colorMode={theme === 'dark' ? 'dark' : 'light'}
            snapToGrid={snapToGrid}
            snapGrid={[15, 15]}
            nodeExtent={boundedToCanvas ? [[-50, -50], [3200, 2400]] : undefined}
            translateExtent={boundedToCanvas ? [[-300, -300], [3500, 2700]] : undefined}
            panOnScroll={true}
            panOnDrag={isPanMode ? true : [1, 2]}
            selectionOnDrag={!isPanMode}
            selectionMode={SelectionMode.Partial}
            defaultEdgeOptions={{
              type: 'smoothstep',
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className="bg-[#F7F7FA] dark:bg-[#12121B]"
          >
            {/* Fond personnalisable (Points / Lignes / Croix) */}
            <Background
              variant={bgVariant}
              gap={snapToGrid ? 15 : 20}
              size={bgVariant === BackgroundVariant.Cross ? 6 : 1.5}
              color={theme === 'dark' ? '#28283C' : '#D1D1DE'}
            />

            {/* Barre de Contrôles Pro Flottante (Haut Gauche) */}
            <Panel position="top-left" className="m-3 flex items-center gap-1.5 p-1 bg-white/90 dark:bg-[#181824]/90 backdrop-blur-md border border-[#E6E6EE] dark:border-[#28283C] rounded-xl shadow-lg select-none">
              <button
                type="button"
                onClick={() => setIsPanMode(false)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  !isPanMode
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title="Mode Sélection par rectangle"
              >
                <MousePointer2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sélection</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPanMode(true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPanMode
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title="Mode Pan / Navigation fluide (Espace maintenu)"
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déplacement</span>
              </button>

              <div className="w-px h-4 bg-[#E6E6EE] dark:bg-[#28283C] mx-0.5" />

              <button
                type="button"
                onClick={handleAutoLayout}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-all"
                title="Ranger et aligner tous les nœuds automatiquement"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden md:inline">Organiser</span>
              </button>

              <button
                type="button"
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  snapToGrid
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={snapToGrid ? 'Grille d’aimantation active (15px)' : 'Grille d’aimantation désactivée'}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setBoundedToCanvas(!boundedToCanvas)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  boundedToCanvas
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={boundedToCanvas ? 'Limites de canevas actives (empêche le dépassement)' : 'Limites de canevas désactivées'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (bgVariant === BackgroundVariant.Dots) setBgVariant(BackgroundVariant.Lines);
                  else if (bgVariant === BackgroundVariant.Lines) setBgVariant(BackgroundVariant.Cross);
                  else setBgVariant(BackgroundVariant.Dots);
                }}
                className="p-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                title="Changer le style de la grille de fond (Points / Lignes / Croix)"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleClearCanvas}
                className="p-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ml-auto"
                title="Effacer tout le canevas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Panel>

            {/* Zoom Controls & MiniMap Standard */}
            <Controls className="!bg-white dark:!bg-[#181824] !border !border-[#E6E6EE] dark:!border-[#28283C] !rounded-xl !shadow-md" />
            <MiniMap
              className="!bg-white dark:!bg-[#181824] !border !border-[#E6E6EE] dark:!border-[#28283C] !rounded-xl !shadow-md hidden md:block"
              nodeColor={(n) => {
                const def = getNodeDefinition(n.type || '');
                if (def?.category === 'event') return '#FF2D20';
                if (def?.category === 'action') return '#0047FF';
                if (def?.category === 'logic') return '#059669';
                if (def?.category === 'data') return '#D97706';
                return '#475569';
              }}
            />

            {/* Astuce de Navigation & Raccourcis Pro */}
            <Panel position="bottom-center" className="mb-4 pointer-events-none">
              <div className="bg-white/90 dark:bg-[#181824]/90 backdrop-blur-md border border-[#E6E6EE] dark:border-[#28283C] px-3.5 py-1.5 rounded-full shadow-lg text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] flex items-center gap-3 pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Espace + Glisser = Déplacer • Double-clic = Ajouter un nœud • Suppr = Supprimer • Ctrl+D = Dupliquer</span>
              </div>
            </Panel>
          </ReactFlow>

          {/* Débogueur Pas à Pas Flottant */}
          {isDebugOpen && (
            <DebugBar
              onStepHighlight={(nodeId) => {
                if (!nodeId) return;
                setNodes((nds) =>
                  nds.map((n) => ({
                    ...n,
                    selected: n.id === nodeId,
                  }))
                );
              }}
              onClose={() => setDebugOpen(false)}
            />
          )}
        </div>

        {/* Panneau latéral de diagnostic */}
        {isDiagnosticsOpen && (
          <DiagnosticsPanel
            nodes={nodes as any}
            edges={edges as any}
            onSelectNode={(nodeId) => {
              setNodes((nds) =>
                nds.map((n) => ({
                  ...n,
                  selected: n.id === nodeId,
                }))
              );
              const targetNode = nodes.find((n) => n.id === nodeId);
              if (targetNode) {
                reactFlowInstance.setCenter(targetNode.position.x + 120, targetNode.position.y + 100, {
                  duration: 500,
                  zoom: 1.2,
                });
              }
            }}
          />
        )}
      </div>

      {/* Modales */}
      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setAddNodeOpen(false)}
        onSelectNode={handleSelectNode}
      />

      <RecipesDrawer
        isOpen={isRecipesOpen}
        onClose={() => setRecipesOpen(false)}
        onApplyRecipe={handleApplyRecipe}
      />

      <CodeViewerModal
        isOpen={isCodeViewerOpen}
        onClose={() => setCodeViewerOpen(false)}
        selectedNodeId={selectedNodeForCode}
        onSelectNode={(nodeId) => {
          setSelectedNodeForCode(nodeId);
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              selected: n.id === nodeId,
            }))
          );
          const targetNode = nodes.find((n) => n.id === nodeId);
          if (targetNode) {
            reactFlowInstance.setCenter(targetNode.position.x + 120, targetNode.position.y + 100, {
              duration: 500,
              zoom: 1.2,
            });
          }
        }}
      />
    </div>
  );
}

export function LogicEditorCanvas() {
  return (
    <ReactFlowProvider>
      <LogicEditorInner />
    </ReactFlowProvider>
  );
}
