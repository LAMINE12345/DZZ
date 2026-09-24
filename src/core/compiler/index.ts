import { LogicNode, Edge, Element } from '../types';
import { CompileResult, SourceMapping, CompileDiagnostic, AstSummary } from './types';

export * from './types';

export function compileGraphToJavaScript(
  nodes: LogicNode[] = [],
  edges: Edge[] = [],
  elements: Element[] = [],
  pageName: string = 'Page'
): CompileResult {
  const lines: string[] = [];
  const sourceMappings: SourceMapping[] = [];
  const diagnostics: CompileDiagnostic[] = [];
  let eventListenersCount = 0;
  let functionsCount = 0;

  lines.push(`// ==========================================`);
  lines.push(`// Logique Automatisée générée pour : ${pageName}`);
  lines.push(`// Date : ${new Date().toLocaleDateString('fr-FR')}`);
  lines.push(`// ==========================================`);
  lines.push(``);
  lines.push(`(function initPageLogic() {`);
  lines.push(`  console.log('🚀 Initialisation des scripts et balises HTML de ${pageName}...');`);
  lines.push(``);

  nodes.forEach((node) => {
    const startLine = lines.length + 1;
    lines.push(`  // Nœud : ${node.type} (${node.id})`);
    const nodeData = (node as any).data || (node as any).config || {};
    let nodeDesc = `Nœud ${node.type}`;

    switch (node.type) {
      case 'on_click': {
        eventListenersCount++;
        const targetElId = nodeData.targetElementId || 'element';
        nodeDesc = `Écouteur d'événement Clic sur #${targetElId}`;
        lines.push(`  const el_${node.id.replace(/-/g, '_')} = document.getElementById('${targetElId}');`);
        lines.push(`  if (el_${node.id.replace(/-/g, '_')}) {`);
        lines.push(`    el_${node.id.replace(/-/g, '_')}.addEventListener('click', (event) => {`);
        lines.push(`      console.log('Clic intercepté sur #${targetElId}');`);
        lines.push(`    });`);
        lines.push(`  }`);
        break;
      }
      case 'set_text': {
        functionsCount++;
        const targetElId = nodeData.targetElementId || 'element';
        const value = nodeData.value || '';
        nodeDesc = `Mise à jour du texte #${targetElId}`;
        lines.push(`  const target_${node.id.replace(/-/g, '_')} = document.getElementById('${targetElId}');`);
        lines.push(`  if (target_${node.id.replace(/-/g, '_')}) {`);
        lines.push(`    target_${node.id.replace(/-/g, '_')}.innerText = ${JSON.stringify(value)};`);
        lines.push(`  }`);
        break;
      }
      default: {
        lines.push(`  // Action standard pour ${node.type}`);
        lines.push(`  console.log('Exécution nœud ${node.type}');`);
        break;
      }
    }

    const endLine = lines.length;
    sourceMappings.push({
      nodeId: node.id,
      startLine,
      endLine,
      description: nodeDesc,
    });
    lines.push(``);
  });

  lines.push(`})();`);

  const code = lines.join('\n');
  const astSummary: AstSummary = {
    totalLines: lines.length,
    functionsCount,
    eventListenersCount,
    nodeCount: nodes.length,
  };

  return {
    code,
    sourceMappings,
    diagnostics,
    astSummary,
  };
}
