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
      case 'event_click':
      case 'on_click': {
        eventListenersCount++;
        const targetElId = nodeData.targetElementId || 'element';
        nodeDesc = `Écouteur d'événement Clic sur #${targetElId}`;
        lines.push(`  const el_${node.id.replace(/-/g, '_')} = document.getElementById('${targetElId}');`);
        lines.push(`  if (el_${node.id.replace(/-/g, '_')}) {`);
        lines.push(`    el_${node.id.replace(/-/g, '_')}.addEventListener('click', (event) => {`);
        lines.push(`      console.log('⚡ Clic intercepté sur #${targetElId}');`);
        lines.push(`    });`);
        lines.push(`  }`);
        break;
      }
      case 'event_page_load': {
        eventListenersCount++;
        nodeDesc = `Au chargement de la page`;
        lines.push(`  window.addEventListener('DOMContentLoaded', () => {`);
        lines.push(`    console.log('🚀 Page initialisée (${pageName})');`);
        lines.push(`  });`);
        break;
      }
      case 'event_input_change': {
        eventListenersCount++;
        const targetElId = nodeData.targetElementId || 'input';
        nodeDesc = `Saisie dans le champ #${targetElId}`;
        lines.push(`  const input_${node.id.replace(/-/g, '_')} = document.getElementById('${targetElId}');`);
        lines.push(`  if (input_${node.id.replace(/-/g, '_')}) {`);
        lines.push(`    input_${node.id.replace(/-/g, '_')}.addEventListener('input', (e) => {`);
        lines.push(`      const val = e.target.value;`);
        lines.push(`      console.log('Champ #${targetElId} modifié :', val);`);
        lines.push(`    });`);
        lines.push(`  }`);
        break;
      }
      case 'action_set_text':
      case 'set_text': {
        functionsCount++;
        const targetElId = nodeData.targetElementId || 'element';
        const value = nodeData.textValue || nodeData.value || '';
        nodeDesc = `Changer le texte de #${targetElId}`;
        lines.push(`  function fn_${node.id.replace(/-/g, '_')}(newText) {`);
        lines.push(`    const el = document.getElementById('${targetElId}');`);
        lines.push(`    if (el) el.textContent = newText !== undefined ? newText : ${JSON.stringify(value)};`);
        lines.push(`  }`);
        break;
      }
      case 'action_toggle_visibility': {
        functionsCount++;
        const targetElId = nodeData.targetElementId || 'element';
        const mode = nodeData.visibilityAction || 'toggle';
        nodeDesc = `Afficher/Masquer #${targetElId}`;
        lines.push(`  function fn_${node.id.replace(/-/g, '_')}() {`);
        lines.push(`    const el = document.getElementById('${targetElId}');`);
        lines.push(`    if (el) {`);
        lines.push(`      if ('${mode}' === 'show') el.style.display = '';`);
        lines.push(`      else if ('${mode}' === 'hide') el.style.display = 'none';`);
        lines.push(`      else el.style.display = el.style.display === 'none' ? '' : 'none';`);
        lines.push(`    }`);
        lines.push(`  }`);
        break;
      }
      case 'js_script_custom': {
        functionsCount++;
        nodeDesc = `Script JavaScript Personnalisé (${node.id})`;
        const userCode = nodeData.code || 'return true;';
        lines.push(`  function script_${node.id.replace(/-/g, '_')}(inputA, inputB) {`);
        lines.push(`    try {`);
        lines.push(`      const fn = new Function('input_a', 'input_b', ${JSON.stringify(userCode)});`);
        lines.push(`      return fn(inputA, inputB);`);
        lines.push(`    } catch (err) {`);
        lines.push(`      console.error('Erreur Script JS ${node.id}:', err);`);
        lines.push(`      return null;`);
        lines.push(`    }`);
        lines.push(`  }`);
        break;
      }
      case 'js_array_filter': {
        functionsCount++;
        nodeDesc = `Filtrage de tableau JS`;
        const predicate = nodeData.predicateCode || 'item => Boolean(item)';
        lines.push(`  function filter_${node.id.replace(/-/g, '_')}(arr) {`);
        lines.push(`    if (!Array.isArray(arr)) return [];`);
        lines.push(`    try {`);
        lines.push(`      const pred = ${predicate};`);
        lines.push(`      return arr.filter(pred);`);
        lines.push(`    } catch (e) { return arr; }`);
        lines.push(`  }`);
        break;
      }
      case 'js_array_map': {
        functionsCount++;
        nodeDesc = `Transformation de tableau JS`;
        const mapper = nodeData.mapCode || 'item => item';
        lines.push(`  function map_${node.id.replace(/-/g, '_')}(arr) {`);
        lines.push(`    if (!Array.isArray(arr)) return [];`);
        lines.push(`    try {`);
        lines.push(`      const mapper = ${mapper};`);
        lines.push(`      return arr.map(mapper);`);
        lines.push(`    } catch (e) { return arr; }`);
        lines.push(`  }`);
        break;
      }
      case 'js_json_parse': {
        functionsCount++;
        nodeDesc = `Conversion JSON.parse()`;
        lines.push(`  function parseJSON_${node.id.replace(/-/g, '_')}(str) {`);
        lines.push(`    try { return JSON.parse(str); } catch(e) { return null; }`);
        lines.push(`  }`);
        break;
      }
      case 'js_json_stringify': {
        functionsCount++;
        nodeDesc = `Conversion JSON.stringify()`;
        lines.push(`  function stringifyJSON_${node.id.replace(/-/g, '_')}(obj) {`);
        lines.push(`    try { return JSON.stringify(obj, null, ${nodeData.pretty ? 2 : 0}); } catch(e) { return ""; }`);
        lines.push(`  }`);
        break;
      }
      case 'js_console_log':
      case 'tool_console_log': {
        functionsCount++;
        nodeDesc = `Journal Console (${nodeData.level || 'log'})`;
        lines.push(`  function log_${node.id.replace(/-/g, '_')}(data) {`);
        lines.push(`    console.${nodeData.level || 'log'}('[Nœud ${node.id}]', data !== undefined ? data : ${JSON.stringify(nodeData.note || '')});`);
        lines.push(`  }`);
        break;
      }
      case 'js_dom_class_toggle': {
        functionsCount++;
        const targetElId = nodeData.targetElementId || 'element';
        const clsName = nodeData.className || 'active';
        const act = nodeData.action || 'toggle';
        nodeDesc = `ClassList ${act} "${clsName}" sur #${targetElId}`;
        lines.push(`  function class_${node.id.replace(/-/g, '_')}() {`);
        lines.push(`    const el = document.getElementById('${targetElId}');`);
        lines.push(`    if (el) {`);
        lines.push(`      if ('${act}' === 'add') el.classList.add('${clsName}');`);
        lines.push(`      else if ('${act}' === 'remove') el.classList.remove('${clsName}');`);
        lines.push(`      else el.classList.toggle('${clsName}');`);
        lines.push(`    }`);
        lines.push(`  }`);
        break;
      }
      default: {
        lines.push(`  // Action automatique pour ${node.type}`);
        lines.push(`  console.log('⚙️ Exécution du bloc ${node.type} (${node.id})');`);
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
