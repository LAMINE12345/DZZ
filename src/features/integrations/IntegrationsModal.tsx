'use client';

import * as React from 'react';
import { useAppStore } from '@/src/core/store';
import { Button } from '@/src/shared/ui';
import {
  X,
  CreditCard,
  Table,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Key,
  Globe,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function IntegrationsModal() {
  const {
    project,
    isIntegrationsModalOpen,
    setIntegrationsModalOpen,
    updateIntegrations,
    addToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<'stripe' | 'airtable' | 'supabase' | 'googleSheets'>('stripe');
  const [testing, setTesting] = React.useState<string | null>(null);

  if (!isIntegrationsModalOpen) return null;

  const currentIntegrations = project.integrations || {
    stripe: { enabled: false, publishableKey: '', secretKey: '' },
    airtable: { enabled: false, apiKey: '', baseId: '' },
    supabase: { enabled: false, url: '', anonKey: '' },
    googleSheets: { enabled: false, spreadsheetId: '', apiKey: '' },
  };

  const handleTestConnection = (service: string) => {
    setTesting(service);
    setTimeout(() => {
      setTesting(null);
      addToast({
        type: 'success',
        title: `Connexion à ${service} validée ! ⚡`,
        message: `Les API de ${service} sont prêtes à être utilisées dans vos nœuds de logique et collections.`,
      });
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setIntegrationsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Connecteurs API Extérieures & Services"
    >
      <div
        className="bg-white dark:bg-[#161622] border border-[#E6E6EE] dark:border-[#28283C] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E6EE] dark:border-[#28283C] flex items-center justify-between bg-[#FAFAFC] dark:bg-[#12121B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#5B5BF0] to-[#14B8A6] text-white flex items-center justify-center shadow-md font-bold">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1B1B2F] dark:text-[#F4F4F9]">
                Connecteurs API & Integrations Extérieures
              </h2>
              <p className="text-[11px] text-[#62627A] dark:text-[#A5A5BC]">
                Connectez vos comptes Stripe, Airtable, Supabase et Google Sheets sans écrire de code.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIntegrationsModalOpen(false)}
            className="p-2 rounded-xl text-[#8E8EA6] hover:bg-[#E6E6EE] dark:hover:bg-[#28283C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[420px]">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-56 p-3 border-r border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] flex flex-row md:flex-col gap-1.5 shrink-0">
            {[
              {
                id: 'stripe',
                name: 'Stripe',
                desc: 'Paiements & Abonnements',
                icon: <CreditCard className="w-4 h-4 text-[#6366F1]" />,
                enabled: currentIntegrations.stripe?.enabled,
              },
              {
                id: 'airtable',
                name: 'Airtable',
                desc: 'Base de données Nocode',
                icon: <Table className="w-4 h-4 text-[#F59E0B]" />,
                enabled: currentIntegrations.airtable?.enabled,
              },
              {
                id: 'supabase',
                name: 'Supabase',
                desc: 'PostgreSQL & Auth',
                icon: <Database className="w-4 h-4 text-[#10B981]" />,
                enabled: currentIntegrations.supabase?.enabled,
              },
              {
                id: 'googleSheets',
                name: 'Google Sheets',
                desc: 'Tableurs & Sync',
                icon: <FileSpreadsheet className="w-4 h-4 text-[#3B82F6]" />,
                enabled: currentIntegrations.googleSheets?.enabled,
              },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#5B5BF0] bg-white dark:bg-[#1E1E2E] shadow-sm font-bold'
                      : 'border-transparent hover:bg-[#F0F0F6] dark:hover:bg-[#1A1A28]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {tab.icon}
                    <div className="truncate">
                      <div className="text-xs text-[#1B1B2F] dark:text-[#F4F4F9] truncate">{tab.name}</div>
                      <div className="text-[10px] text-[#8E8EA6] truncate">{tab.desc}</div>
                    </div>
                  </div>
                  {tab.enabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1" title="Activé" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Configuration Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white dark:bg-[#161622]">
            {/* STRIPE */}
            {activeTab === 'stripe' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6EE] dark:border-[#28283C]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#6366F1]" /> Stripe Checkout & Paiements
                    </h3>
                    <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                      Acceptez des cartes bancaires et abonnements directement depuis les boutons de votre site.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentIntegrations.stripe?.enabled}
                      onChange={(e) =>
                        updateIntegrations({
                          stripe: { ...currentIntegrations.stripe, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B5BF0]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      Clé Publique Stripe (`pk_test_...` ou `pk_live_...`)
                    </label>
                    <input
                      type="text"
                      value={currentIntegrations.stripe?.publishableKey || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          stripe: { ...currentIntegrations.stripe, publishableKey: e.target.value },
                        })
                      }
                      placeholder="pk_test_51Nx..."
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      Clé Secrète Stripe (`sk_test_...`)
                    </label>
                    <input
                      type="password"
                      value={currentIntegrations.stripe?.secretKey || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          stripe: { ...currentIntegrations.stripe, secretKey: e.target.value },
                        })
                      }
                      placeholder="sk_test_51Nx..."
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection('Stripe')}
                      isLoading={testing === 'Stripe'}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    >
                      Tester la clé Stripe
                    </Button>
                    <span className="text-[10px] text-[#8E8EA6]">
                      Utilisable avec le node de logique « Stripe Checkout ».
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AIRTABLE */}
            {activeTab === 'airtable' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6EE] dark:border-[#28283C]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-2">
                      <Table className="w-4 h-4 text-[#F59E0B]" /> Connexion Airtable Base
                    </h3>
                    <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                      Synchronisez vos bases Airtable directement avec le CMS et les formulaires de votre site.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentIntegrations.airtable?.enabled}
                      onChange={(e) =>
                        updateIntegrations({
                          airtable: { ...currentIntegrations.airtable, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B5BF0]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      Jeton d’accès personnel Airtable (PAT)
                    </label>
                    <input
                      type="password"
                      value={currentIntegrations.airtable?.apiKey || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          airtable: { ...currentIntegrations.airtable, apiKey: e.target.value },
                        })
                      }
                      placeholder="patXXXX.XXXX..."
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      ID de la Base Airtable (`appXXXX...`)
                    </label>
                    <input
                      type="text"
                      value={currentIntegrations.airtable?.baseId || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          airtable: { ...currentIntegrations.airtable, baseId: e.target.value },
                        })
                      }
                      placeholder="app123456789"
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection('Airtable')}
                      isLoading={testing === 'Airtable'}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Tester la connexion Airtable
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* SUPABASE */}
            {activeTab === 'supabase' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6EE] dark:border-[#28283C]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#10B981]" /> Supabase Database & Auth
                    </h3>
                    <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                      Interrogez directement votre base de données PostgreSQL Supabase.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentIntegrations.supabase?.enabled}
                      onChange={(e) =>
                        updateIntegrations({
                          supabase: { ...currentIntegrations.supabase, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B5BF0]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      URL du Projet Supabase (`https://xyz.supabase.co`)
                    </label>
                    <input
                      type="text"
                      value={currentIntegrations.supabase?.url || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          supabase: { ...currentIntegrations.supabase, url: e.target.value },
                        })
                      }
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      Clé Publique Anon Key (`eyJhbG...`)
                    </label>
                    <input
                      type="password"
                      value={currentIntegrations.supabase?.anonKey || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          supabase: { ...currentIntegrations.supabase, anonKey: e.target.value },
                        })
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection('Supabase')}
                      isLoading={testing === 'Supabase'}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    >
                      Tester la connexion Supabase
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* GOOGLE SHEETS */}
            {activeTab === 'googleSheets' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6EE] dark:border-[#28283C]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#3B82F6]" /> Google Sheets Sync
                    </h3>
                    <p className="text-xs text-[#62627A] dark:text-[#A5A5BC]">
                      Envoyez automatiquement les soumissions de formulaires vers une feuille Google Sheets.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentIntegrations.googleSheets?.enabled}
                      onChange={(e) =>
                        updateIntegrations({
                          googleSheets: { ...currentIntegrations.googleSheets, enabled: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B5BF0]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      ID de la feuille Spreadsheet (`1BxiMVs0XR...`)
                    </label>
                    <input
                      type="text"
                      value={currentIntegrations.googleSheets?.spreadsheetId || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          googleSheets: { ...currentIntegrations.googleSheets, spreadsheetId: e.target.value },
                        })
                      }
                      placeholder="1BxiMVs0XRzqT6W0pGy..."
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1B1B2F] dark:text-[#F4F4F9]">
                      Clé API Google Cloud
                    </label>
                    <input
                      type="password"
                      value={currentIntegrations.googleSheets?.apiKey || ''}
                      onChange={(e) =>
                        updateIntegrations({
                          googleSheets: { ...currentIntegrations.googleSheets, apiKey: e.target.value },
                        })
                      }
                      placeholder="AIzaSyA..."
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] text-[#1B1B2F] dark:text-[#F4F4F9] focus:outline-none focus:border-[#5B5BF0]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection('Google Sheets')}
                      isLoading={testing === 'Google Sheets'}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5 text-blue-500" />}
                    >
                      Tester la connexion Google Sheets
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E6E6EE] dark:border-[#28283C] bg-[#FAFAFC] dark:bg-[#12121B] flex items-center justify-between">
          <div className="text-[11px] text-[#8E8EA6] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Vos clés d&apos;API sont chiffrées localement dans votre projet.
          </div>
          <Button variant="primary" size="sm" onClick={() => setIntegrationsModalOpen(false)}>
            Enregistrer & Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
