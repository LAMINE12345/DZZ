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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
  const {
    project,
    activePageId,
    theme,
    addToast,
  } = useAppStore();

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

  // Initialisation du graphe à partir de la page active
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
      // Graphe par défaut pour démarrer en toute clarté
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
          position: { x: 400, y: 160 },
          data: {
            label: 'Message de bienvenue',
            messageText: 'Bienvenue sur notre site interactif ! ✨',
            messageType: 'success',
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
            label: 'Note',
            commentText: '👋 Double-cliquez n’importe où pour ajouter un nouveau bloc, ou cliquez sur « Recettes » pour voir des exemples prêts à l’emploi.',
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

  // Validation des connexions entre ports (Fonction pure sans effet de bord)
  const isValidConnection = React.useCallback(
    (connection: Connection | XYEdge): boolean => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;

      const sourceHandle = connection.sourceHandle || '';
      const targetHandle = connection.targetHandle || '';

      const isSourceFlow = sourceHandle.startsWith('flow_') || sourceHandle === 'flow';
      const isTargetFlow = targetHandle.startsWith('flow_') || targetHandle === 'flow';

      // 1. Règle : Le flux d'exécution se connecte uniquement à un flux d'exécution
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
          message: 'Reliez les flèches blanches entre elles et les ronds colorés aux ports de données correspondants.',
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

  // Double-clic sur le fond du canvas -> ouvre l'ajout de bloc
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

  // Ajout effectif d'un nœud sélectionné dans le catalogue
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

  // Application d'une recette prête à l'emploi
  const handleApplyRecipe = React.useCallback(
    (recipe: RecipeDefinition) => {
      // Extraire tous les éléments de la page active
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
        message: 'Vous pouvez maintenant personnaliser les éléments et paramètres cibles.',
        duration: 4000,
      });
    },
    [activePage, syncToStore, reactFlowInstance, addToast]
  );

  // Simulateur / Test de flux en direct
  const handleRunTest = React.useCallback(() => {
    setIsTesting(true);
    addToast({
      type: 'info',
      title: 'Simulation du flux en cours…',
      message: 'Les actions s’exécutent dans l’ordre des connexions.',
      duration: 3000,
    });

    // Mettre les liens en surbrillance d'animation
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
        message: 'Tous les blocs ont bien réagi.',
      });
    }, 2500);
  }, [addToast]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-[#F7F7FA] dark:bg-[#12121B]">
      {/* 1. Barre d'outils supérieure de la Logique */}
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

      {/* 2. Zone du Canvas et du Panneau de Diagnostic */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <div className="flex-1 h-full w-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onPaneClick={() => {}}
            onDoubleClick={onPaneDoubleClick}
            nodeTypes={nodeTypes}
            colorMode={theme === 'dark' ? 'dark' : 'light'}
            defaultEdgeOptions={{
              type: 'smoothstep',
            }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className="bg-[#F7F7FA] dark:bg-[#12121B]"
          >
            {/* Fond à points */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.5}
              color={theme === 'dark' ? '#28283C' : '#D1D1DE'}
            />

            {/* Contrôles de zoom & Mini-carte */}
            <Controls className="!bg-white dark:!bg-[#181824] !border !border-[#E6E6EE] dark:!border-[#28283C] !rounded-xl !shadow-md" />
            <MiniMap
              className="!bg-white dark:!bg-[#181824] !border !border-[#E6E6EE] dark:!border-[#28283C] !rounded-xl !shadow-md hidden md:block"
              nodeColor={(n) => {
                const def = getNodeDefinition(n.type || '');
                if (def?.category === 'event') return '#D97706';
                if (def?.category === 'action') return '#2563EB';
                if (def?.category === 'logic') return '#7C3AED';
                if (def?.category === 'data') return '#059669';
                return '#475569';
              }}
            />

            {/* Bannière d'aide discrète flottante */}
            <Panel position="bottom-center" className="mb-4 pointer-events-none">
              <div className="bg-white/90 dark:bg-[#181824]/90 backdrop-blur-md border border-[#E6E6EE] dark:border-[#28283C] px-3.5 py-1.5 rounded-full shadow-lg text-[11px] font-semibold text-[#62627A] dark:text-[#A5A5BC] flex items-center gap-2 pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Double-clic sur le fond pour ajouter un bloc • Tirez une flèche blanche pour enchaîner une action</span>
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

        {/* Panneau latéral de diagnostic et conseils */}
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
