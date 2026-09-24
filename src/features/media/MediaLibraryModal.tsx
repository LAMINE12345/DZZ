'use client';

import * as React from 'react';
import { Modal, Button, Input } from '@/src/shared/ui';
import { useAppStore } from '@/src/core/store';
import { STOCK_PHOTOS } from '@/src/features/editor/editorElements';
import { Image as ImageIcon, Plus, Check } from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (url: string) => void;
  onSelect?: (media: any) => void;
  title?: string;
}

export function MediaLibraryModal({ isOpen, onClose, onSelectImage, onSelect, title }: MediaLibraryModalProps) {
  const { project, updateElementProps, selectedElementId } = useAppStore();
  const [customUrl, setCustomUrl] = React.useState('');

  const handleChoose = (url: string) => {
    if (onSelect) {
      onSelect({ url, name: 'Image sélectionnée' });
    } else if (onSelectImage) {
      onSelectImage(url);
    } else if (selectedElementId) {
      updateElementProps(selectedElementId, { src: url });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Médiathèque d'images"} size="lg">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Coller l'URL d'une image en ligne (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              if (customUrl.trim()) handleChoose(customUrl.trim());
            }}
          >
            Insérer
          </Button>
        </div>

        <div className="text-xs font-semibold text-[#8E8EA6]">Images recommandées :</div>
        <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto">
          {STOCK_PHOTOS.map((photo, i) => (
            <button
              type="button"
              key={i}
              onClick={() => handleChoose(photo.url)}
              className="group relative rounded-xl overflow-hidden border border-[#E6E6EE] dark:border-[#28283C] hover:border-[#5B5BF0] aspect-video focus:outline-none"
            >
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                Sélectionner
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
