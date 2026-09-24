'use client';

export type RuntimeListener = (eventType: string, payload: any) => void;
export type MemoryChangeListener = (key: string, newValue: any, oldValue: any) => void;
export type DomMutationListener = (elementId: string, mutationType: string, value: any) => void;

export interface RuntimeTraceFrame {
  id: string;
  nodeId?: string;
  action: string;
  target?: string;
  details: any;
  timestamp: number;
}

export class AtelierRuntime {
  private memories: Map<string, any> = new Map();
  private memoryListeners: Set<MemoryChangeListener> = new Set();
  private domMutationListeners: Set<DomMutationListener> = new Set();
  private traceListeners: Set<(frame: RuntimeTraceFrame) => void> = new Set();
  private activeTimers: Set<NodeJS.Timeout | number> = new Set();

  // Mode Débogage / Pas à pas
  private isDebugMode = false;
  private isPaused = false;
  private stepResolve: (() => void) | null = null;
  private traceHistory: RuntimeTraceFrame[] = [];

  // Données CMS réactives
  private collections: Map<string, any[]> = new Map();
  private collectionListeners: Set<(collectionId: string, action: string, data: any) => void> = new Set();

  constructor() {
    this.reset();
  }

  /**
   * Réinitialise l'ensemble de l'état runtime
   */
  public reset() {
    this.cleanupAllTimers();
    this.memories.clear();
    this.collections.clear();
    this.traceHistory = [];
    this.isPaused = false;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  // ==========================================
  // CMS & COLLECTIONS RÉACTIVES
  // ==========================================

  public registerCollection(collectionIdOrSlug: string, entries: any[]) {
    this.collections.set(collectionIdOrSlug, [...entries]);
  }

  public getCollectionEntries(collectionIdOrSlug: string): any[] {
    return this.collections.get(collectionIdOrSlug) || [];
  }

  public addCollectionEntry(collectionIdOrSlug: string, entryData: Record<string, any>): any {
    const current = this.getCollectionEntries(collectionIdOrSlug);
    const newEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
      ...entryData,
    };
    const updated = [newEntry, ...current];
    this.collections.set(collectionIdOrSlug, updated);
    this.recordTrace('add_collection_entry', collectionIdOrSlug, { entry: newEntry });
    this.collectionListeners.forEach((l) => l(collectionIdOrSlug, 'add', newEntry));
    return newEntry;
  }

  public updateCollectionEntry(collectionIdOrSlug: string, entryId: string, updates: Record<string, any>): any {
    const current = this.getCollectionEntries(collectionIdOrSlug);
    const updated = current.map((e) => (e.id === entryId ? { ...e, ...updates } : e));
    this.collections.set(collectionIdOrSlug, updated);
    this.recordTrace('update_collection_entry', collectionIdOrSlug, { entryId, updates });
    this.collectionListeners.forEach((l) => l(collectionIdOrSlug, 'update', { entryId, updates }));
  }

  public subscribeCollections(listener: (collectionId: string, action: string, data: any) => void): () => void {
    this.collectionListeners.add(listener);
    return () => this.collectionListeners.delete(listener);
  }

  // ==========================================
  // 1. MÉMOIRES RÉACTIVES (VARIABLES D'ÉTAT)
  // ==========================================

  public getMemory(key: string, defaultValue: any = undefined): any {
    if (!this.memories.has(key)) {
      return defaultValue;
    }
    return this.memories.get(key);
  }

  public setMemory(key: string, value: any) {
    const oldValue = this.memories.get(key);
    this.memories.set(key, value);

    this.recordTrace('set_memory', key, { value, oldValue });
    this.memoryListeners.forEach((listener) => listener(key, value, oldValue));
  }

  public subscribeMemory(listener: MemoryChangeListener): () => void {
    this.memoryListeners.add(listener);
    return () => this.memoryListeners.delete(listener);
  }

  // ==========================================
  // 2. INTERACTIONS DOM & ÉLÉMENTS VISUELS
  // ==========================================

  public setText(elementId: string, text: any) {
    this.recordTrace('set_text', elementId, { text });
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'text', String(text))
    );
  }

  public setStyle(elementId: string, styleObject: Record<string, any>) {
    this.recordTrace('set_style', elementId, { styleObject });
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'style', styleObject)
    );
  }

  public toggleVisibility(elementId: string, mode: 'toggle' | 'show' | 'hide' = 'toggle') {
    this.recordTrace('toggle_visibility', elementId, { mode });
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'visibility', mode)
    );
  }

  public async playAnimation(elementId: string, animationType = 'bounce'): Promise<void> {
    this.recordTrace('play_animation', elementId, { animationType });
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'animation', animationType)
    );
    await this.wait(400);
  }

  public getFieldValue(elementId: string): any {
    // Si l'élément a une mémoire associée, on la retourne
    return this.getMemory(`input_${elementId}`, '');
  }

  public subscribeDomMutations(listener: DomMutationListener): () => void {
    this.domMutationListeners.add(listener);
    return () => this.domMutationListeners.delete(listener);
  }

  // ==========================================
  // 3. ACTIONS SYSTÈME (MESSAGES, NAVIGATION, URL)
  // ==========================================

  public showMessage(messageText: string, messageType: 'success' | 'info' | 'warning' | 'error' = 'success') {
    this.recordTrace('show_message', 'toast', { messageText, messageType });
    this.domMutationListeners.forEach((listener) =>
      listener('system_toast', 'toast', { text: messageText, type: messageType })
    );
  }

  public navigateToPage(pageId: string) {
    this.recordTrace('navigate_page', pageId, {});
    this.domMutationListeners.forEach((listener) =>
      listener('system_nav', 'navigate', pageId)
    );
  }

  public openUrl(url: string, newTab = true) {
    this.recordTrace('open_url', url, { newTab });
    if (typeof window !== 'undefined') {
      if (newTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    }
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    this.recordTrace('copy_clipboard', 'system', { text });
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        this.showMessage('Copié dans le presse-papier !', 'success');
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public scrollTo(elementId: string, behavior: 'smooth' | 'instant' = 'smooth') {
    this.recordTrace('scroll_to', elementId, { behavior });
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'scroll_to', { behavior })
    );
  }

  public setInputValue(elementId: string, value: any) {
    this.recordTrace('set_input_value', elementId, { value });
    this.setMemory(`input_${elementId}`, value);
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'set_input_value', value)
    );
  }

  public resetForm(elementId: string) {
    this.recordTrace('reset_form', elementId, {});
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'reset_form', true)
    );
  }

  public focusElement(elementId: string) {
    this.recordTrace('focus_element', elementId, {});
    this.domMutationListeners.forEach((listener) =>
      listener(elementId, 'focus_element', true)
    );
  }

  public playSound(soundType = 'success') {
    this.recordTrace('play_sound', soundType, {});
    if (typeof window !== 'undefined' && (window as any).AudioContext) {
      try {
        const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (soundType === 'success') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        } else {
          osc.frequency.setValueAtTime(440, ctx.currentTime);
        }
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // audio context ignored if browser blocked
      }
    }
  }

  public triggerConfetti(durationSeconds = 3) {
    this.recordTrace('trigger_confetti', `${durationSeconds}s`, { duration: durationSeconds });
    this.domMutationListeners.forEach((listener) =>
      listener('system_confetti', 'confetti', { duration: durationSeconds })
    );
  }

  public downloadFile(fileName: string, content: any) {
    this.recordTrace('download_file', fileName, { length: String(content).length });
    if (typeof document !== 'undefined') {
      const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  public setDocumentTitle(title: string) {
    this.recordTrace('set_document_title', title, {});
    if (typeof document !== 'undefined') {
      document.title = title;
    }
  }

  public toggleDarkMode(): boolean {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.toggle('dark');
      this.recordTrace('toggle_dark_mode', isDark ? 'dark' : 'light', { isDark });
      return isDark;
    }
    return false;
  }

  public getLocalStorage(key: string, defaultValue: any = null): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return window.localStorage.getItem(key) || defaultValue;
      }
    }
    return defaultValue;
  }

  public setLocalStorage(key: string, value: any) {
    this.recordTrace('set_localstorage', key, { value });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        window.localStorage.setItem(key, String(value));
      }
    }
  }

  // ==========================================
  // 4. TEMPS, INTERVALLES & DÉLAIS ASYNCHRONES
  // ==========================================

  public async wait(milliseconds: number): Promise<void> {
    this.recordTrace('wait_delay', `${milliseconds}ms`, { ms: milliseconds });
    if (this.isDebugMode && this.isPaused) {
      await this.waitForStep();
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.activeTimers.delete(timer);
        resolve();
      }, milliseconds);
      this.activeTimers.add(timer);
    });
  }

  public registerInterval(callback: () => void, intervalMs: number): number {
    const timer = setInterval(async () => {
      if (this.isDebugMode && this.isPaused) {
        await this.waitForStep();
      }
      callback();
    }, intervalMs);
    this.activeTimers.add(timer);
    return timer as any;
  }

  public cleanupAllTimers() {
    this.activeTimers.forEach((timer) => {
      clearTimeout(timer as any);
      clearInterval(timer as any);
    });
    this.activeTimers.clear();
  }

  // ==========================================
  // 5. MOTEUR DE DÉBOGAGE & TRACEUR D'EXÉCUTION
  // ==========================================

  public setDebugMode(enabled: boolean) {
    this.isDebugMode = enabled;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  public stepNext() {
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  public subscribeTrace(listener: (frame: RuntimeTraceFrame) => void): () => void {
    this.traceListeners.add(listener);
    return () => this.traceListeners.delete(listener);
  }

  public getTraceHistory(): RuntimeTraceFrame[] {
    return [...this.traceHistory];
  }

  private async waitForStep(): Promise<void> {
    return new Promise((resolve) => {
      this.stepResolve = resolve;
    });
  }

  private recordTrace(action: string, target: string, details: any, nodeId?: string) {
    const frame: RuntimeTraceFrame = {
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nodeId,
      action,
      target,
      details,
      timestamp: Date.now(),
    };
    this.traceHistory.push(frame);
    if (this.traceHistory.length > 200) {
      this.traceHistory.shift();
    }
    this.traceListeners.forEach((listener) => listener(frame));
  }
}

// Instance Singleton globale du runtime
export const runtime = new AtelierRuntime();
