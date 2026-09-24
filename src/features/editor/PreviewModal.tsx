'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Modal, Button } from '@/src/shared/ui';
import { ViewportMode, Element, ProjectTheme, Collection, Page } from '@/src/core/types';
import { Monitor, Tablet, Smartphone, Sparkles, CheckCircle2, Play, Check, RotateCcw, Database, ArrowLeft, Share2 } from 'lucide-react';
import { runtime } from '@/src/core/runtime';
import { applyItemDataBindings } from './ElementRenderer';

export function PreviewModal() {
  const { isPreviewModalOpen } = useAppStore();
  if (!isPreviewModalOpen) return null;
  return <PreviewModalInner />;
}

function PreviewModalInner() {
  const { isPreviewModalOpen, setPreviewModalOpen, project, activePageId, setActivePageId, addToast } = useAppStore();
  const [viewport, setViewport] = React.useState<ViewportMode>('desktop');
  const [domOverrides, setDomOverrides] = React.useState<Record<string, { text?: string; style?: any; hidden?: boolean; animation?: string }>>({});
  const [currentPreviewPageId, setCurrentPreviewPageId] = React.useState<string>(activePageId);
  const [previewEntryIndex, setPreviewEntryIndex] = React.useState<number>(0);

  const currentPreviewPage = project.pages.find((p) => p.id === currentPreviewPageId) || project.pages[0];
  const activeGraph = currentPreviewPage?.graphs?.[0];

  const dynamicCollection = React.useMemo(() => {
    if (!currentPreviewPage?.isDynamic) return null;
    return (
      project.collections?.find((c) => c.id === currentPreviewPage.dynamicCollectionId) ||
      project.collections?.[0] ||
      null
    );
  }, [currentPreviewPage, project.collections]);

  const currentDynamicEntry = React.useMemo(() => {
    if (!dynamicCollection?.entries?.length) return null;
    return dynamicCollection.entries[previewEntryIndex] || dynamicCollection.entries[0];
  }, [dynamicCollection, previewEntryIndex]);

  const displayRoot = React.useMemo(() => {
    if (!currentPreviewPage?.root) return null;
    if (!currentPreviewPage.isDynamic || !currentDynamicEntry) return currentPreviewPage.root;
    return applyItemDataBindings(currentPreviewPage.root, currentDynamicEntry, dynamicCollection?.slug || '');
  }, [currentPreviewPage, currentDynamicEntry, dynamicCollection]);

  // Moteur d'exécution direct du flux dans le runtime (parcours en file d'attente)
  const executeNodeFlow = React.useCallback(async (startNodeId: string, nodes: any[], edges: any[]) => {
    const queue: string[] = [startNodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const outEdges = edges.filter(
        (e) => e.source === currentId && (e.sourceHandle === 'flow_out' || !e.sourceHandle || e.sourceHandle === 'flow')
      );

      for (const edge of outEdges) {
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!targetNode) continue;

        if (targetNode.type === 'action_show_message') {
          const msg = targetNode.data?.messageText || 'Opération réussie !';
          const type = targetNode.data?.messageType || 'success';
          runtime.showMessage(msg, type);
        } else if (targetNode.type === 'action_set_text') {
          const elId = targetNode.data?.targetElementId;
          const newText = targetNode.data?.newText || '';
          if (elId) runtime.setText(elId, newText);
        } else if (targetNode.type === 'action_toggle_visibility') {
          const elId = targetNode.data?.targetElementId;
          const mode = targetNode.data?.visibilityMode || 'toggle';
          if (elId) runtime.toggleVisibility(elId, mode);
        } else if (targetNode.type === 'action_set_style') {
          const elId = targetNode.data?.targetElementId;
          const prop = targetNode.data?.styleProperty || 'backgroundColor';
          const val = targetNode.data?.styleValue || '#5B5BF0';
          if (elId) runtime.setStyle(elId, { [prop]: val });
        } else if (targetNode.type === 'action_navigate') {
          const pageId = targetNode.data?.targetPageId;
          if (pageId) setCurrentPreviewPageId(pageId);
        } else if (targetNode.type === 'action_open_url') {
          const url = targetNode.data?.url;
          const newTab = targetNode.data?.newTab;
          if (url) runtime.openUrl(url, newTab);
        } else if (targetNode.type === 'action_play_animation') {
          const elId = targetNode.data?.targetElementId;
          const anim = targetNode.data?.animationType || 'bounce';
          if (elId) await runtime.playAnimation(elId, anim);
        } else if (targetNode.type === 'data_set_memory') {
          const memKey = targetNode.data?.memoryId || targetNode.data?.variableName || 'compteur';
          const op = targetNode.data?.operation || 'set';
          const val = targetNode.data?.value ?? 1;
          if (op === 'set') runtime.setMemory(memKey, val);
          else if (op === 'increment') runtime.setMemory(memKey, (runtime.getMemory(memKey) || 0) + Number(val));
          else if (op === 'decrement') runtime.setMemory(memKey, (runtime.getMemory(memKey) || 0) - Number(val));
        } else if (targetNode.type === 'data_create_entry') {
          const colId = targetNode.data?.collectionId || project.collections?.[0]?.id || 'col-produits';
          const entryData = targetNode.data?.entryData || { nom: 'Nouveau Produit', prix: 49 };
          runtime.addCollectionEntry(colId, entryData);
          runtime.showMessage(`Nouvelle entrée ajoutée au CMS !`, 'success');
        } else if (targetNode.type === 'logic_wait' || targetNode.type === 'logic_delay') {
          const sec = parseFloat(targetNode.data?.seconds || '1');
          await runtime.wait(sec * 1000);
        } else if (targetNode.type === 'action_copy_clipboard') {
          const text = targetNode.data?.textToCopy || 'Texte';
          await runtime.copyToClipboard(text);
        } else if (targetNode.type === 'action_scroll_to') {
          const elId = targetNode.data?.targetElementId;
          const beh = targetNode.data?.behavior || 'smooth';
          if (elId) runtime.scrollTo(elId, beh);
        } else if (targetNode.type === 'action_set_input_value') {
          const elId = targetNode.data?.targetElementId;
          const val = targetNode.data?.inputValue || '';
          if (elId) runtime.setInputValue(elId, val);
        } else if (targetNode.type === 'action_reset_form') {
          const elId = targetNode.data?.targetElementId;
          if (elId) runtime.resetForm(elId);
        } else if (targetNode.type === 'action_focus_element') {
          const elId = targetNode.data?.targetElementId;
          if (elId) runtime.focusElement(elId);
        } else if (targetNode.type === 'action_play_sound') {
          runtime.playSound(targetNode.data?.soundType || 'success');
        } else if (targetNode.type === 'action_confetti') {
          runtime.triggerConfetti(targetNode.data?.durationSeconds || 3);
          runtime.showMessage('🎉 Félicitations !', 'success');
        } else if (targetNode.type === 'action_download_file') {
          const fName = targetNode.data?.fileName || 'export.csv';
          runtime.downloadFile(fName, 'id,nom,valeur\n1,Exemple,100');
          runtime.showMessage(`Fichier ${fName} téléchargé avec succès.`, 'success');
        } else if (targetNode.type === 'action_set_document_title') {
          runtime.setDocumentTitle(targetNode.data?.newTitle || 'Aperçu du site');
        } else if (targetNode.type === 'action_toggle_dark_mode') {
          runtime.toggleDarkMode();
        } else if (targetNode.type === 'action_localstorage_set') {
          runtime.setLocalStorage(targetNode.data?.storageKey || 'pref', targetNode.data?.value || true);
        } else if (targetNode.type === 'action_stripe_checkout') {
          runtime.showMessage(`Redirection vers Stripe Checkout sécurisé (${targetNode.data?.productName || 'Achat'} : ${targetNode.data?.amount || 29} €)...`, 'info');
        } else if (targetNode.type === 'action_airtable_fetch') {
          runtime.showMessage(`Synchronisation avec la table Airtable "${targetNode.data?.tableName || 'Clients'}" en cours...`, 'info');
        } else if (targetNode.type === 'action_supabase_query') {
          runtime.showMessage(`Interrogation de la table PostgreSQL Supabase "${targetNode.data?.tableName || 'users'}"...`, 'info');
        } else if (targetNode.type === 'action_googlesheets_append') {
          runtime.showMessage(`Nouvelle ligne ajoutée à Google Sheets ("${targetNode.data?.sheetName || 'Feuille1'}") !`, 'success');
        }

        // Enchaîner avec les blocs suivants
        queue.push(targetNode.id);
      }
    }
  }, [project.collections]);

  // Réinitialiser et brancher le runtime lors de l'ouverture de l'aperçu
  React.useEffect(() => {
    runtime.reset();

    // Enregistrer les collections dans le runtime pour que les scripts & nodes puissent y accéder
    if (project.collections) {
      project.collections.forEach((col) => {
        runtime.registerCollection(col.id, col.entries || []);
      });
    }

    const unsubDom = runtime.subscribeDomMutations((elementId, mutationType, value) => {
      if (elementId === 'system_toast') {
        addToast({
          type: value.type || 'info',
          title: value.text,
          duration: 3000,
        });
        return;
      }

      if (elementId === 'system_nav') {
        setCurrentPreviewPageId(value);
        return;
      }

      setDomOverrides((prev) => {
        const current = prev[elementId] || {};
        if (mutationType === 'text') {
          return { ...prev, [elementId]: { ...current, text: value } };
        }
        if (mutationType === 'style') {
          return { ...prev, [elementId]: { ...current, style: { ...current.style, ...value } } };
        }
        if (mutationType === 'visibility') {
          const isHidden = value === 'hide' ? true : value === 'show' ? false : !current.hidden;
          return { ...prev, [elementId]: { ...current, hidden: isHidden } };
        }
        if (mutationType === 'animation') {
          return { ...prev, [elementId]: { ...current, animation: value } };
        }
        return prev;
      });
    });

    // Exécution de l'événement Au Chargement de la page (event_page_load)
    let loadTimer: NodeJS.Timeout | null = null;
    if (activeGraph) {
      const loadNode = activeGraph.nodes.find((n) => n.type === 'event_page_load');
      if (loadNode) {
        loadTimer = setTimeout(() => {
          executeNodeFlow(loadNode.id, activeGraph.nodes, activeGraph.edges);
        }, 0);
      }
    }

    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      unsubDom();
      runtime.cleanupAllTimers();
    };
  }, [currentPreviewPageId, activeGraph, addToast, project.collections, executeNodeFlow]);

  const handleElementEvent = (elementId: string, eventType: 'click' | 'change' | 'submit' | 'hover', payload?: any) => {
    if (!activeGraph) return;

    let targetNodeType = 'event_click';
    if (eventType === 'change') targetNodeType = 'event_input_change';
    if (eventType === 'submit') targetNodeType = 'event_form_submit';
    if (eventType === 'hover') targetNodeType = 'event_hover';

    const matchingEvents = activeGraph.nodes.filter(
      (n) => n.type === targetNodeType && n.data?.targetElementId === elementId
    );

    matchingEvents.forEach((evtNode) => {
      executeNodeFlow(evtNode.id, activeGraph.nodes, activeGraph.edges);
    });
  };

  const handleResetPreview = () => {
    runtime.reset();
    setDomOverrides({});
    if (project.collections) {
      project.collections.forEach((col) => {
        runtime.registerCollection(col.id, col.entries || []);
      });
    }
    addToast({
      type: 'info',
      title: 'Aperçu réinitialisé',
      duration: 1500,
    });
    if (activeGraph) {
      const loadNode = activeGraph.nodes.find((n) => n.type === 'event_page_load');
      if (loadNode) {
        executeNodeFlow(loadNode.id, activeGraph.nodes, activeGraph.edges);
      }
    }
  };

  const handleNavigatePage = (pageId: string, entryIndex?: number) => {
    setCurrentPreviewPageId(pageId);
    if (entryIndex !== undefined) {
      setPreviewEntryIndex(entryIndex);
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/preview?project=${encodeURIComponent(project.name)}&page=${currentPreviewPage?.slug || 'home'}`;
    navigator.clipboard.writeText(shareUrl);
    addToast({
      type: 'success',
      title: 'Lien d’aperçu copié !',
      message: 'Le lien de partage local a été copié dans votre presse-papier.',
    });
  };

  const getWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      case 'desktop':
      default:
        return 'w-full max-w-[1200px]';
    }
  };

  return (
    <Modal
      isOpen={isPreviewModalOpen}
      onClose={() => setPreviewModalOpen(false)}
      title={`Aperçu interactif : ${project.name}`}
      size="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Barre de commutation viewport & simulation & pages */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F7F7FA] dark:bg-[#1C1C2A] p-2.5 rounded-xl border border-[#E6E6EE] dark:border-[#28283C]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sélecteur de Page */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#62627A] dark:text-[#A5A5BC]">
                Page :
              </span>
              <select
                value={currentPreviewPageId}
                onChange={(e) => {
                  setCurrentPreviewPageId(e.target.value);
                  setPreviewEntryIndex(0);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#12121B] border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
              >
                {project.pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.isHome ? '🏠 ' : p.isDynamic ? '🗄️ ' : '📄 '}
                    {p.name} (/{p.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Sélecteur d'entrée pour page dynamique CMS */}
            {currentPreviewPage?.isDynamic && dynamicCollection && (
              <div className="flex items-center gap-1.5 bg-[#5B5BF0]/10 px-2 py-1 rounded-lg border border-[#5B5BF0]/25">
                <Database className="w-3.5 h-3.5 text-[#5B5BF0]" />
                <span className="text-[11px] font-bold text-[#5B5BF0]">
                  Fiche CMS :
                </span>
                <select
                  value={previewEntryIndex}
                  onChange={(e) => setPreviewEntryIndex(Number(e.target.value))}
                  className="text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-[#181824] border border-[#5B5BF0]/30 text-[#1B1B2F] dark:text-[#F4F4F9] outline-none"
                >
                  {(dynamicCollection.entries || []).map((ent, idx) => (
                    <option key={ent.id || idx} value={idx}>
                      {ent.nom || ent.titre || `Fiche #${idx + 1}`} {ent.prix ? `(${ent.prix} €)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sélecteur de format viewport */}
            <div className="flex items-center p-0.5 rounded-lg bg-white dark:bg-[#12121B] border border-[#E6E6EE] dark:border-[#28283C]">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewport === 'desktop'
                    ? 'bg-[#5B5BF0] text-white shadow-xs'
                    : 'text-[#62627A] dark:text-[#A5A5BC]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Bureau</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewport === 'tablet'
                    ? 'bg-[#5B5BF0] text-white shadow-xs'
                    : 'text-[#62627A] dark:text-[#A5A5BC]'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablette</span>
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewport === 'mobile'
                    ? 'bg-[#5B5BF0] text-white shadow-xs'
                    : 'text-[#62627A] dark:text-[#A5A5BC]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShareLink}
              leftIcon={<Share2 className="w-3.5 h-3.5 text-[#5B5BF0]" />}
            >
              Partager l’aperçu
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPreview}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Réinitialiser
            </Button>

            <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Runtime actif
            </span>
          </div>
        </div>

        {/* Zone de prévisualisation */}
        <div
          style={{ backgroundColor: project.theme?.backgroundColor || '#FAFAFC' }}
          className="w-full h-[65vh] overflow-y-auto p-4 flex justify-center rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] transition-colors"
        >
          <div
            style={{
              backgroundColor: project.theme?.surfaceColor || '#FFFFFF',
              fontFamily: project.theme?.bodyFont || 'Inter',
            }}
            className={`${getWidthClass()} p-6 rounded-2xl shadow-sm transition-all duration-300 min-h-full`}
          >
            {displayRoot && (
              <PreviewElementNode
                element={displayRoot}
                viewport={viewport}
                theme={project.theme}
                overrides={domOverrides}
                onTriggerEvent={handleElementEvent}
                collections={project.collections}
                pages={project.pages}
                onNavigatePage={handleNavigatePage}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
            Fermer l’aperçu
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PreviewElementNode({
  element,
  viewport,
  theme,
  overrides,
  onTriggerEvent,
  collections,
  pages,
  onNavigatePage,
}: {
  element: Element;
  viewport: ViewportMode;
  theme?: ProjectTheme;
  overrides: Record<string, { text?: string; style?: any; hidden?: boolean; animation?: string }>;
  onTriggerEvent: (elementId: string, eventType: 'click' | 'change' | 'submit' | 'hover', payload?: any) => void;
  collections?: Collection[];
  pages?: Page[];
  onNavigatePage?: (pageId: string, entryIndex?: number) => void;
}) {
  const elOverride = overrides[element.id] || {};
  if (element.hidden || elOverride.hidden) return null;

  const styleDesktop = element.style?.desktop || {};
  const styleTablet = element.style?.tablet || {};
  const styleMobile = element.style?.mobile || {};

  const effectiveStyle: React.CSSProperties = {
    ...styleDesktop,
    ...(viewport === 'tablet' || viewport === 'mobile' ? styleTablet : {}),
    ...(viewport === 'mobile' ? styleMobile : {}),
    ...(elOverride.style || {}),
  };

  if (!effectiveStyle.fontFamily) {
    if (element.type === 'heading') {
      effectiveStyle.fontFamily = theme?.headingFont || 'Plus Jakarta Sans';
    } else {
      effectiveStyle.fontFamily = theme?.bodyFont || 'Inter';
    }
  }

  const getAnimationClass = () => {
    const anim = elOverride.animation || element.props?.animationType;
    switch (anim) {
      case 'fade-in':
        return 'animate-in fade-in';
      case 'slide-up':
        return 'animate-in fade-in slide-in-from-bottom-6';
      case 'slide-left':
        return 'animate-in fade-in slide-in-from-left-6';
      case 'zoom-in':
        return 'animate-in fade-in zoom-in-95';
      case 'bounce':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  const textContent = elOverride.text !== undefined ? elOverride.text : element.props?.text;

  switch (element.type) {
    case 'dynamic_list': {
      const colId = element.props?.collectionId;
      const col = (collections || []).find((c) => c.id === colId) || (collections || [])[0];
      const entries = col?.entries || [];
      const template = element.children?.[0];

      // Vérifier si une page dynamique existe pour cette collection
      const dynamicPage = (pages || []).find(
        (p) => p.isDynamic && (p.dynamicCollectionId === col?.id || !p.dynamicCollectionId)
      );

      if (!template || entries.length === 0) {
        return (
          <div
            style={effectiveStyle}
            className="p-8 border border-dashed border-[#5B5BF0]/40 rounded-2xl text-center text-xs text-[#8E8EA6]"
          >
            {entries.length === 0
              ? `Aucune entrée dans la collection « ${col?.name || 'Produits'} »`
              : 'Glissez un composant carte modèle à l’intérieur de la liste dynamique'}
          </div>
        );
      }

      return (
        <div id={element.id} style={effectiveStyle} className={getAnimationClass()}>
          {entries.map((item, idx) => {
            const hydrated = applyItemDataBindings(template, item, col?.slug || '');
            return (
              <div
                key={item.id || idx}
                onClick={(e) => {
                  if (dynamicPage && onNavigatePage) {
                    e.stopPropagation();
                    onNavigatePage(dynamicPage.id, idx);
                  }
                }}
                className={
                  dynamicPage
                    ? 'cursor-pointer hover:scale-[1.01] transition-transform'
                    : ''
                }
              >
                <PreviewElementNode
                  element={hydrated}
                  viewport={viewport}
                  theme={theme}
                  overrides={overrides}
                  onTriggerEvent={onTriggerEvent}
                  collections={collections}
                  pages={pages}
                  onNavigatePage={onNavigatePage}
                />
              </div>
            );
          })}
        </div>
      );
    }

    case 'heading': {
      const Tag = (element.props?.tag || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <Tag
          id={element.id}
          style={{
            color: effectiveStyle.color || theme?.textColor || '#1B1B2F',
            ...effectiveStyle,
          }}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={`${getAnimationClass()} cursor-pointer`}
        >
          {textContent || 'Titre'}
        </Tag>
      );
    }

    case 'text':
      return (
        <p
          id={element.id}
          style={{
            color: effectiveStyle.color || theme?.textColor || '#62627A',
            ...effectiveStyle,
          }}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={`whitespace-pre-wrap ${getAnimationClass()} cursor-pointer`}
        >
          {textContent || ''}
        </p>
      );

    case 'button':
      return (
        <button
          id={element.id}
          type="button"
          style={{
            backgroundColor: effectiveStyle.backgroundColor || theme?.primaryColor || '#5B5BF0',
            borderRadius: effectiveStyle.borderRadius || `${theme?.buttonRadius ?? 12}px`,
            fontFamily: effectiveStyle.fontFamily || theme?.bodyFont || 'Inter',
            ...effectiveStyle,
          }}
          onClick={() => {
            onTriggerEvent(element.id, 'click');
            if (element.props?.linkUrl) {
              const url = element.props.linkUrl;
              if (url === '/' || url.startsWith('/')) {
                const cleanSlug = url.replace(/^\//, '');
                const targetPage = (pages || []).find(
                  (p) => p.slug === cleanSlug || (cleanSlug === '' && p.isHome)
                );
                if (targetPage && onNavigatePage) {
                  onNavigatePage(targetPage.id);
                  return;
                }
              }
              if (element.props.openInNewTab) {
                window.open(element.props.linkUrl, '_blank');
              } else {
                window.location.href = element.props.linkUrl;
              }
            }
          }}
          className={`transition-transform active:scale-95 text-white font-bold select-none cursor-pointer ${getAnimationClass()}`}
        >
          {textContent || element.props?.label || 'Bouton'}
        </button>
      );

    case 'image':
      return (
        <img
          id={element.id}
          src={element.props?.src || 'https://picsum.photos/seed/preview/800/400'}
          alt={element.props?.alt || ''}
          style={effectiveStyle}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={`max-w-full ${getAnimationClass()} cursor-pointer`}
        />
      );

    case 'input':
      return (
        <div style={effectiveStyle} className={`flex flex-col gap-1.5 w-full ${getAnimationClass()}`}>
          {element.props?.label && (
            <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              {element.props.label}
            </label>
          )}
          <input
            id={element.id}
            type="text"
            placeholder={element.props?.placeholder || ''}
            onChange={(e) => onTriggerEvent(element.id, 'change', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
          />
        </div>
      );

    case 'checkbox':
      return (
        <label style={effectiveStyle} className={`flex items-center gap-2 cursor-pointer ${getAnimationClass()}`}>
          <input
            id={element.id}
            type="checkbox"
            defaultChecked={element.props?.checked}
            onChange={(e) => onTriggerEvent(element.id, 'change', e.target.checked)}
            className="w-4 h-4 accent-[#5B5BF0]"
          />
          <span className="text-xs text-[#1B1B2F] dark:text-[#F4F4F9]">{element.props?.label}</span>
        </label>
      );

    case 'list':
      return (
        <ul id={element.id} style={effectiveStyle} className={`space-y-1.5 ${getAnimationClass()}`}>
          {(element.props?.items || ['Point 1', 'Point 2', 'Point 3']).map((it: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[#1B1B2F] dark:text-[#F4F4F9]">
              <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );

    case 'badge':
      return (
        <div
          id={element.id}
          style={effectiveStyle}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={`inline-flex items-center gap-1.5 transition-all select-none cursor-pointer ${getAnimationClass()}`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{textContent || element.props?.text || 'Balise active'}</span>
        </div>
      );

    case 'div':
    case 'header':
    case 'footer':
    case 'nav':
    case 'article':
    case 'aside':
    case 'main': {
      const Tag = (element.props?.tag || element.type) as any;
      return (
        <Tag
          id={element.id}
          style={effectiveStyle}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={getAnimationClass()}
        >
          {element.children?.map((child: Element) => (
            <PreviewElementNode
              key={child.id}
              element={child}
              viewport={viewport}
              theme={theme}
              overrides={overrides}
              onTriggerEvent={onTriggerEvent}
              collections={collections}
              pages={pages}
              onNavigatePage={onNavigatePage}
            />
          ))}
        </Tag>
      );
    }

    case 'span': {
      const SpanTag = (element.props?.tag || 'span') as any;
      return (
        <SpanTag
          id={element.id}
          style={effectiveStyle}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={getAnimationClass()}
        >
          {textContent || element.props?.text || 'Texte span'}
        </SpanTag>
      );
    }

    case 'link':
      return (
        <a
          id={element.id}
          href={element.props?.href || '#'}
          target={element.props?.target || '_blank'}
          rel="noopener noreferrer"
          style={effectiveStyle}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={getAnimationClass()}
        >
          {textContent || element.props?.text || 'Lien'}
        </a>
      );

    case 'blockquote':
      return (
        <blockquote
          id={element.id}
          style={effectiveStyle}
          onClick={() => onTriggerEvent(element.id, 'click')}
          className={getAnimationClass()}
        >
          <p className="italic">"{textContent || element.props?.text}"</p>
          {element.props?.author && (
            <cite className="block text-xs not-italic font-semibold text-[#8E8EA6] dark:text-[#A5A5BC] mt-2">
              — {element.props.author}
            </cite>
          )}
        </blockquote>
      );

    case 'hr':
      return <hr id={element.id} style={effectiveStyle} className={`w-full border-0 ${getAnimationClass()}`} />;

    case 'code':
      return (
        <pre
          id={element.id}
          style={effectiveStyle}
          className={`overflow-x-auto ${getAnimationClass()}`}
        >
          <code className="font-mono text-xs">{element.props?.code}</code>
        </pre>
      );

    case 'audio':
      return (
        <div id={element.id} style={effectiveStyle} className={getAnimationClass()}>
          <audio
            controls={element.props?.controls ?? true}
            autoPlay={element.props?.autoplay}
            loop={element.props?.loop}
            src={element.props?.audioUrl}
            className="w-full h-10"
          />
        </div>
      );

    case 'iframe':
      return (
        <div id={element.id} style={effectiveStyle} className={`relative overflow-hidden ${getAnimationClass()}`}>
          <iframe
            src={element.props?.src}
            title={element.props?.title || 'iframe'}
            allowFullScreen={element.props?.allowFullscreen}
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="w-full h-full border-0"
          />
        </div>
      );

    case 'custom_html':
      return (
        <div
          id={element.id}
          style={effectiveStyle}
          className={getAnimationClass()}
          dangerouslySetInnerHTML={{ __html: element.props?.html || '' }}
        />
      );

    case 'textarea':
      return (
        <div id={element.id} style={effectiveStyle} className={`flex flex-col gap-1 w-full ${getAnimationClass()}`}>
          {element.props?.label && (
            <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              {element.props.label}
            </label>
          )}
          <textarea
            placeholder={element.props?.placeholder || ''}
            rows={element.props?.rows || 4}
            onChange={(e) => onTriggerEvent(element.id, 'change', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9] resize-none"
          />
        </div>
      );

    case 'select':
      return (
        <div id={element.id} style={effectiveStyle} className={`flex flex-col gap-1 w-full ${getAnimationClass()}`}>
          {element.props?.label && (
            <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
              {element.props.label}
            </label>
          )}
          <select
            onChange={(e) => onTriggerEvent(element.id, 'change', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
          >
            {(element.props?.options || ['Option 1', 'Option 2']).map((opt: string, i: number) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return (
        <div id={element.id} style={effectiveStyle} className={getAnimationClass()}>
          {element.children?.map((child: Element) => (
            <PreviewElementNode
              key={child.id}
              element={child}
              viewport={viewport}
              theme={theme}
              overrides={overrides}
              onTriggerEvent={onTriggerEvent}
              collections={collections}
              pages={pages}
              onNavigatePage={onNavigatePage}
            />
          ))}
        </div>
      );
  }
}

