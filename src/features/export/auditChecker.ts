import { Project } from '@/src/core/types';

export interface AuditIssue {
  id: string;
  type: 'critical' | 'error' | 'warning' | 'info';
  severity?: 'critical' | 'warning' | 'info';
  category: 'seo' | 'accessibility' | 'performance' | 'html';
  title: string;
  description: string;
  recommendation?: string;
  pageId?: string;
  autoFixable?: boolean;
}

export interface AuditReport {
  score: number;
  issues: AuditIssue[];
  passedCount: number;
  warningsCount: number;
  errorsCount: number;
  criticalCount: number;
  warningCount: number;
}

export function auditProject(project: Project): AuditReport {
  const issues: AuditIssue[] = [];
  let passedCount = 8;

  // 1. Vérification Balises Sémantiques & H1
  project.pages.forEach((page) => {
    let hasH1 = false;
    const checkHeadings = (node: any) => {
      if (node.type === 'heading' && (node.props?.tag === 'h1' || (!node.props?.tag && node.props?.level === 1))) {
        hasH1 = true;
      }
      if (node.children) node.children.forEach(checkHeadings);
    };
    if (page.root) checkHeadings(page.root);

    if (!hasH1) {
      issues.push({
        id: `missing-h1-${page.id}`,
        type: 'warning',
        severity: 'warning',
        category: 'seo',
        title: `Balise <h1> manquante sur « ${page.name} »`,
        description: 'Chaque page doit comporter exactement un titre principal <h1> pour un bon référencement.',
        recommendation: 'Ajoutez une balise <h1> ou changez le niveau de titre de l’en-tête principal.',
        pageId: page.id,
      });
    } else {
      passedCount += 1;
    }

    // 2. Vérification Titre et Méta Description
    if (!page.seo?.title || page.seo.title.trim().length === 0) {
      issues.push({
        id: `missing-title-${page.id}`,
        type: 'warning',
        severity: 'warning',
        category: 'seo',
        title: `Balise <title> vide sur « ${page.name} »`,
        description: 'Renseignez un titre attractif pour le partage social et Google.',
        recommendation: 'Définissez le titre dans le panneau SEO de la page.',
        pageId: page.id,
      });
    }

    if (!page.seo?.description || page.seo.description.trim().length === 0) {
      issues.push({
        id: `missing-meta-desc-${page.id}`,
        type: 'info',
        severity: 'info',
        category: 'seo',
        title: `Description meta absente sur « ${page.name} »`,
        description: 'Une meta description claire optimise le taux de clic dans les résultats de recherche.',
        recommendation: 'Ajoutez un court résumé de 150 caractères décrivant votre contenu.',
        pageId: page.id,
      });
    }
  });

  const criticalIssues = issues.filter((i) => i.type === 'critical' || i.type === 'error' || i.severity === 'critical');
  const warningIssues = issues.filter((i) => i.type === 'warning' || i.severity === 'warning');

  const score = Math.max(0, 100 - criticalIssues.length * 20 - warningIssues.length * 5);

  return {
    score,
    issues,
    passedCount,
    warningsCount: warningIssues.length,
    errorsCount: criticalIssues.length,
    criticalCount: criticalIssues.length,
    warningCount: warningIssues.length,
  };
}
