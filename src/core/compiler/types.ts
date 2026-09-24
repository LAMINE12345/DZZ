export interface SourceMapping {
  nodeId: string;
  startLine: number;
  endLine: number;
  description?: string;
}

export interface CompileDiagnostic {
  id?: string;
  nodeId?: string;
  title?: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface AstSummary {
  totalLines: number;
  functionsCount: number;
  eventListenersCount: number;
  nodeCount: number;
}

export interface CompileResult {
  code: string;
  sourceMappings: SourceMapping[];
  diagnostics: CompileDiagnostic[];
  astSummary: AstSummary;
}
