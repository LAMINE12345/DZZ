'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Modal, Button } from '@/src/shared/ui';
import {
  Sparkles,
  Globe,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Upload,
  FileCode,
  Zap,
  Settings2,
  FileText,
  Search,
  Rocket,
} from 'lucide-react';
import { auditProject, AuditReport, AuditIssue } from '../export/auditChecker';
import { generateProjectZip } from '../export/zipExporter';
import { migrateProjectSchema } from '../export/projectSchemaMigration';
import { DeployAssistantPanel } from '../export/DeployAssistantPanel';

export function PublishModal() {
  const {
    isPublishModalOpen,
    setPublishModalOpen,
    project,
    setProject,
    exportProjectAsFile,
    updatePage,
    addToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<'audit' | 'zip' | 'seo' | 'deploy' | 'json'>('audit');
  const [minify, setMinify] = React.useState(false);
  const [isExportingZip, setIsExportingZip] = React.useState(false);

  // Exécuter l'audit avant publication
  const auditReport: AuditReport = React.useMemo(() => {
    return auditProject(project);
  }, [project]);

  // Génération et téléchargement du ZIP
  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await generateProjectZip(project, { minify });

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-export.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Exportation ZIP réussie !',
        message: 'Votre site web statique autonome a été téléchargé avec succès.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Échec de l’exportation ZIP',
        message: err.message || 'Une erreur est survenue lors de la création de l’archive.',
      });
    } finally {
      setIsExportingZip(false);
    }
  };

  // Importation de fichier JSON avec migration de schéma
  const handleFileImportWithMigration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawJson = JSON.parse(e.target?.result as string);
        const migrationResult = migrateProjectSchema(rawJson);

        setProject(migrationResult.migratedProject);

        if (migrationResult.wasMigrated) {
          addToast({
            type: 'info',
            title: `Migration V${migrationResult.originalVersion} effectuée`,
            message: `${migrationResult.appliedFixes.length} ajustement(s) apporté(s) au schéma pour une compatibilité totale.`,
          });
        } else {
          addToast({
            type: 'success',
            title: 'Projet importé avec succès !',
          });
        }
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Fichier invalide',
          message: err.message || 'Impossible de lire le fichier .atelier.json',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isPublishModalOpen}
      onClose={() => setPublishModalOpen(false)}
      title="Sortir de l’outil : Exporter & Publier votre projet"
      size="lg"
    >
      <div className="flex flex-col gap-4 py-1">
        {/* Navigation des 5 Onglets */}
        <div className="p-1.5 rounded-2xl bg-[#F7F7FA] dark:bg-[#1C1C2A] border border-[#E6E6EE] dark:border-[#28283C] grid grid-cols-2 sm:grid-cols-5 gap-1">
          {[
            { id: 'audit', label: 'Vérificateur', icon: <ShieldCheck className="w-3.5 h-3.5" />, badge: `${auditReport.score}%` },
            { id: 'zip', label: 'Export ZIP', icon: <Download className="w-3.5 h-3.5" /> },
            { id: 'deploy', label: 'Guide Publier', icon: <Rocket className="w-3.5 h-3.5" /> },
            { id: 'seo', label: 'SEO Pages', icon: <Search className="w-3.5 h-3.5" /> },
            { id: 'json', label: 'Fichier JSON', icon: <FileCode className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2 rounded-xl text-center flex items-center justify-center gap-1.5 text-xs transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-[#12121B] text-[#5B5BF0] font-bold shadow-xs'
                    : 'text-[#62627A] dark:text-[#A5A5BC] hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      auditReport.score >= 90
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= ONGLET 1 : VÉRIFICATEUR AVANT PUBLICATION ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Health Score Summary Card */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-[#5B5BF0]/10 via-[#14B8A6]/10 to-transparent border border-[#5B5BF0]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md ${
                    auditReport.score >= 90
                      ? 'bg-[#10B981]'
                      : auditReport.score >= 70
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#EF4444]'
                  }`}
                >
                  {auditReport.score}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Score de santé du projet : {auditReport.score} / 100
                  </h3>
                  <p className="text-xs text-[#62627A] dark:text-[#A5A5BC] mt-0.5">
                    {auditReport.criticalCount === 0 && auditReport.warningCount === 0
                      ? '✨ Excellent ! Aucun problème détecté. Votre site est 100% prêt.'
                      : `${auditReport.criticalCount} problème(s) critique(s) • ${auditReport.warningCount} avertissement(s)`}
                  </p>
                </div>
              </div>

              {auditReport.score < 100 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Auto-fix basique : ajouter les titres/descriptions manquants
                    project.pages.forEach((p) => {
                      if (!p.seo?.title) {
                        updatePage(p.id, {
                          seo: { ...p.seo, title: `${p.name} - ${project.name}` },
                        });
                      }
                    });
                    addToast({
                      type: 'success',
                      title: 'Corrections automatiques appliquées !',
                    });
                  }}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#5B5BF0]" />}
                >
                  Corriger automatiquement
                </Button>
              )}
            </div>

            {/* Liste des remarques de l'audit */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {auditReport.issues.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-[#10B981]/40 bg-[#10B981]/5 text-center text-xs text-[#10B981] font-semibold flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  <span>Tous les contrôles qualité sont validés (Alt images, Liens, SEO, Contraste).</span>
                </div>
              ) : (
                auditReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                      issue.type === 'critical'
                        ? 'border-[#EF4444]/30 bg-[#EF4444]/5'
                        : issue.type === 'warning'
                        ? 'border-[#F59E0B]/30 bg-[#F59E0B]/5'
                        : 'border-[#5B5BF0]/30 bg-[#5B5BF0]/5'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {issue.type === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      ) : issue.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-[#5B5BF0] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                          {issue.title}
                        </h4>
                        <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC] mt-0.5">
                          {issue.description}
                        </p>
                        <p className="text-[10px] font-semibold text-[#5B5BF0] mt-1">
                          👉 Conseil : {issue.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= ONGLET 2 : EXPORT ZIP STANDALONE ================= */}
        {activeTab === 'zip' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#161622] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5B5BF0] text-white flex items-center justify-center shrink-0 font-bold">
                  📦
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                    Exportation ZIP (Code HTML/CSS/JS Autonome)
                  </h3>
                  <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC] mt-0.5 leading-relaxed">
                    Obtenez une archive ZIP propre avec index.html, styles.css et app.js. S&apos;ouvre directement dans n&apos;importe quel navigateur sans aucune dépendance.
                  </p>
                </div>
              </div>

              {/* Option de minification */}
              <div className="pt-2 border-t border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9] block">
                    Minifier le code source (HTML / CSS / JS)
                  </span>
                  <span className="text-[11px] text-[#8E8EA6]">
                    Supprime les espaces superflus pour un chargement encore plus rapide.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={minify}
                  onChange={(e) => setMinify(e.target.checked)}
                  className="w-4 h-4 accent-[#5B5BF0] cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleDownloadZip}
                  isLoading={isExportingZip}
                  leftIcon={<Download className="w-4 h-4" />}
                  className="w-full justify-center shadow-md shadow-[#5B5BF0]/20"
                >
                  Télécharger le package .ZIP prêt pour la production
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 3 : ASSISTANT DÉPLOIEMENT ================= */}
        {activeTab === 'deploy' && (
          <DeployAssistantPanel
            project={project}
            onTriggerZipExport={handleDownloadZip}
          />
        )}

        {/* ================= ONGLET 4 : SEO PAR PAGE ================= */}
        {activeTab === 'seo' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
              Configurez les balises Meta et OpenGraph de vos pages :
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {project.pages.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#161622] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1.5">
                      {p.isHome ? '🏠' : '📄'} {p.name} (/{p.slug})
                    </span>
                    <span className="text-[10px] text-[#5B5BF0] font-semibold">
                      {p.seo?.title ? '✓ Titre configuré' : '⚠️ Titre par défaut'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={p.seo?.title || ''}
                    onChange={(e) =>
                      updatePage(p.id, { seo: { ...p.seo, title: e.target.value } })
                    }
                    placeholder={`Titre de la page (ex: ${p.name} - ${project.name})`}
                    className="w-full px-3 py-1.5 text-xs bg-[#F7F7FA] dark:bg-[#181824] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] text-[#1B1B2F] dark:text-[#F4F4F9]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ONGLET 5 : FICHIER JSON & MIGRATION ================= */}
        {activeTab === 'json' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#161622] space-y-3">
              <h3 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Fichier source du projet (.atelier.json)
              </h3>
              <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC] leading-relaxed">
                Sauvegardez l’intégralité du projet pour le réimporter plus tard ou le partager avec d’autres utilisateurs. Les anciennes versions sont automatiquement converties.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => exportProjectAsFile()}
                  leftIcon={<Download className="w-4 h-4 text-[#5B5BF0]" />}
                  className="flex-1 justify-center"
                >
                  Exporter .atelier.json
                </Button>

                <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#5B5BF0] text-white hover:bg-[#4949DC] cursor-pointer shadow-sm transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Importer un fichier .json</span>
                  <input
                    type="file"
                    accept=".json,.atelier.json"
                    onChange={handleFileImportWithMigration}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="flex justify-end pt-3 border-t border-[#E6E6EE] dark:border-[#28283C]">
          <Button variant="primary" onClick={() => setPublishModalOpen(false)}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
