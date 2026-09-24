'use client';

import * as React from 'react';
import { Button } from '@/src/shared/ui';
import { Project } from '@/src/core/types';
import {
  Globe,
  UploadCloud,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function DeployAssistantPanel({
  project,
  onTriggerZipExport,
}: {
  project: Project;
  onTriggerZipExport: () => void;
}) {
  const [platform, setPlatform] = React.useState<'netlify' | 'vercel' | 'github'>('netlify');
  const [copiedCmd, setCopiedCmd] = React.useState(false);

  const cleanName = project.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Entête explicative */}
      <div className="p-4 rounded-2xl bg-linear-to-r from-[#5B5BF0]/10 via-[#14B8A6]/10 to-transparent border border-[#5B5BF0]/20 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#5B5BF0] text-white flex items-center justify-center shrink-0 shadow-sm font-black">
          🚀
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
            Assistant « Publier mon site en 1 clic »
          </h3>
          <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC] mt-0.5 leading-relaxed">
            Hébergez votre application gratuitement sur les meilleures plateformes web mondiales sans aucun serveur à gérer.
          </p>
        </div>
      </div>

      {/* Choix de la plateforme */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            id: 'netlify',
            name: 'Netlify Drop',
            badge: 'Recommandé (0 code)',
            color: '#14B8A6',
            icon: '⚡',
          },
          {
            id: 'vercel',
            name: 'Vercel CLI',
            badge: 'Instantané',
            color: '#5B5BF0',
            icon: '▲',
          },
          {
            id: 'github',
            name: 'GitHub Pages',
            badge: 'Open Source',
            color: '#F59E0B',
            icon: '🐙',
          },
        ].map((p) => {
          const isSelected = platform === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id as any)}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                isSelected
                  ? 'border-[#5B5BF0] bg-[#EEF0FE]/40 dark:bg-[#5B5BF0]/15 shadow-xs font-bold'
                  : 'border-[#E6E6EE] dark:border-[#28283C] hover:border-[#C8C8DC] bg-white dark:bg-[#1A1A28]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{p.icon}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#5B5BF0]" />}
              </div>
              <span className="text-xs text-[#1B1B2F] dark:text-[#F4F4F9]">{p.name}</span>
              <span className="text-[9px] text-[#8E8EA6]">{p.badge}</span>
            </button>
          );
        })}
      </div>

      {/* Guide étape par étape NETLIFY */}
      {platform === 'netlify' && (
        <div className="p-4 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#161622] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Déploiement Glisser-Déposer Netlify (30 secondes)
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#14B8A6]/15 text-[#14B8A6]">
              100% Gratuit
            </span>
          </div>

          <ol className="space-y-2 text-xs text-[#62627A] dark:text-[#A5A5BC]">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#5B5BF0] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                Téléchargez l’archive ZIP générée de votre projet :
                <div className="mt-1.5">
                  <Button variant="primary" size="sm" onClick={onTriggerZipExport} leftIcon={<UploadCloud className="w-3.5 h-3.5" />}>
                    Télécharger le projet `.zip`
                  </Button>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-2 pt-1">
              <span className="w-5 h-5 rounded-full bg-[#5B5BF0] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                Ouvrez la plateforme **Netlify Drop** dans votre navigateur :
                <div className="mt-1">
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#5B5BF0] font-bold hover:underline"
                  >
                    app.netlify.com/drop <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-2 pt-1">
              <span className="w-5 h-5 rounded-full bg-[#5B5BF0] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>
                Glissez-déposez le fichier `.zip` décompressé dans le rectangle Netlify. Votre site sera immédiatement en ligne avec une adresse HTTPS sécurisée !
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* Guide étape par étape VERCEL */}
      {platform === 'vercel' && (
        <div className="p-4 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#161622] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Déploiement Vercel via CLI
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#5B5BF0]/15 text-[#5B5BF0]">
              Performance Maximale
            </span>
          </div>

          <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
            Exécutez cette commande dans votre terminal dans le dossier extrait de votre site :
          </p>

          <div className="p-3 rounded-xl bg-[#11111A] text-[#10B981] font-mono text-xs flex items-center justify-between gap-2 border border-[#2E2E42]">
            <code>npx vercel --prod</code>
            <button
              type="button"
              onClick={() => copyCommand('npx vercel --prod')}
              className="p-1 rounded hover:bg-white/10 text-white/80"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Guide étape par étape GITHUB PAGES */}
      {platform === 'github' && (
        <div className="p-4 rounded-2xl border border-[#E6E6EE] dark:border-[#28283C] bg-white dark:bg-[#161622] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">
              Déploiement GitHub Pages
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              Hébergement GitHub
            </span>
          </div>

          <ol className="space-y-1.5 text-xs text-[#62627A] dark:text-[#A5A5BC]">
            <li>1. Créez un dépôt GitHub nommé <code className="text-[#5B5BF0] font-bold">{cleanName}</code>.</li>
            <li>2. Glissez les fichiers exportés du ZIP dans la branche <code className="font-bold">main</code>.</li>
            <li>3. Dans les paramètres de votre dépôt &gt; **Pages**, sélectionnez la source <code className="font-bold">main / (root)</code>.</li>
            <li>4. Votre site est publié à l&apos;adresse <code className="text-[#10B981] font-bold">https://username.github.io/{cleanName}</code>.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
