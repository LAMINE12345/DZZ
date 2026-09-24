'use client';

import * as React from 'react';
import { Sparkles, X, Plus } from 'lucide-react';
import { Button } from '@/src/shared/ui';

interface RecipesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecipe?: (recipe: any) => void;
}

export function RecipesDrawer({ isOpen, onClose, onApplyRecipe }: RecipesDrawerProps) {
  if (!isOpen) return null;

  const recipes = [
    {
      id: 'rec-counter',
      name: 'Compteur de clics interactif',
      description: 'Incrémente une valeur en mémoire au clic et l’affiche dans une balise texte.',
    },
    {
      id: 'rec-toggle',
      name: 'Afficher / Masquer un bloc (Toggle)',
      description: 'Bascule la visibilité d’un accordéon ou d’un menu au clic sur un bouton.',
    },
    {
      id: 'rec-toast',
      name: 'Notification de succès après envoi',
      description: 'Affiche un message toast dès la validation d’un formulaire HTML.',
    },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#181824] border-l border-[#E6E6EE] dark:border-[#28283C] shadow-2xl z-40 flex flex-col p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E6EE] dark:border-[#28283C]">
        <h3 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#5B5BF0]" />
          <span>Recettes Logiques Prêtes</span>
        </h3>
        <button type="button" onClick={onClose} className="text-[#8E8EA6] hover:text-[#1B1B2F]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {recipes.map((r) => (
          <div
            key={r.id}
            className="p-3 bg-[#F7F7FA] dark:bg-[#202030] rounded-xl border border-[#E6E6EE] dark:border-[#28283C] space-y-2"
          >
            <h4 className="text-xs font-bold text-[#1B1B2F] dark:text-[#F4F4F9]">{r.name}</h4>
            <p className="text-[11px] text-[#62627A] dark:text-[#8E8EA6]">{r.description}</p>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => {
                onApplyRecipe?.(r);
                onClose();
              }}
            >
              Insérer la recette
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
