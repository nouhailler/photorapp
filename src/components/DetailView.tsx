import React, { useState } from 'react';
import type { Photo } from '../types/types';
import { usePhotos } from '../context/usePhotos';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import { exportSinglePhoto } from '../services/exportService';

interface DetailViewProps {
  photo: Photo;
  onClose: () => void;
  onEdit: () => void;
  onToggleFavorite: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({
  photo: initialPhoto,
  onClose,
  onEdit,
  onToggleFavorite,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const { deletePhoto, photos } = usePhotos();

  // Find updated photo state from context
  const photo = photos.find((p) => p.id === initialPhoto.id) || initialPhoto;
  const url = usePhotoUrl(photo);

  const handleDelete = async () => {
    await deletePhoto(photo.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleExport = async (withEdits = true) => {
    await exportSinglePhoto(photo, withEdits);
  };

  const getAspectClass = () => {
    switch (photo.adjustments?.aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '16:9':
        return 'aspect-[16/9]';
      default:
        return '';
    }
  };

  const brightness = 100 + (photo.adjustments?.brightness || 0);
  const contrast = 100 + (photo.adjustments?.contrast || 0);
  const saturation = 100 + (photo.adjustments?.saturation || 0);
  const extraFilter = photo.adjustments?.filter || '';

  const photoStyle: React.CSSProperties = photo.adjustments
    ? {
        filter: `${extraFilter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`.trim(),
        transform: `rotate(${photo.adjustments.rotation || 0}deg)`,
      }
    : {};

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: photo.alt || 'Photo Gallery Pro',
          text: 'Découvrez cette photo sur Gallery Pro !',
        };

        if (photo.storage === 'local') {
          const res = await fetch(url);
          const blob = await res.blob();
          const file = new File([blob], `${photo.alt || 'photo'}.jpg`, { type: blob.type || 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } else {
          shareData.url = photo.url;
        }

        await navigator.share(shareData);
      } catch (error) {
        console.warn('Share cancelled or not supported:', error);
      }
    } else {
      // Direct copy of info or download
      await exportSinglePhoto(photo, true);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const hasGps = typeof photo.metadata?.latitude === 'number' && typeof photo.metadata?.longitude === 'number';

  return (
    <div className="fixed inset-0 z-[55] bg-black flex flex-col animate-in fade-in duration-200 select-none">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-4 h-16 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={onClose}
          className="p-2.5 text-white bg-black/30 rounded-full backdrop-blur-md active:scale-90 transition-transform hover:bg-black/50"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            title={photo.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className="p-2.5 text-white bg-black/30 rounded-full backdrop-blur-md active:scale-90 transition-transform hover:bg-black/50"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                photo.isFavorite ? 'material-symbols-fill text-amber-400' : ''
              }`}
            >
              star
            </span>
          </button>
          <button
            onClick={() => handleExport(true)}
            title="Télécharger la photo"
            className="p-2.5 text-white bg-black/30 rounded-full backdrop-blur-md active:scale-90 transition-transform hover:bg-black/50"
          >
            <span className="material-symbols-outlined text-[22px]">download</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Supprimer la photo"
            className="p-2.5 text-white bg-black/30 rounded-full backdrop-blur-md active:scale-90 transition-transform hover:bg-black/50 hover:text-error"
          >
            <span className="material-symbols-outlined text-[22px]">delete</span>
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Détails et EXIF"
            className={`p-2.5 rounded-full backdrop-blur-md active:scale-90 transition-transform ${
              showInfo ? 'bg-primary text-on-primary' : 'bg-black/30 text-white hover:bg-black/50'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">info</span>
          </button>
        </div>
      </header>

      {/* Main Photo Canvas */}
      <main
        className="flex-grow flex items-center justify-center overflow-hidden p-4 touch-none cursor-pointer"
        onClick={() => setShowInfo(false)}
      >
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${getAspectClass()}`}
        >
          <img
            src={url}
            alt={photo.alt}
            className="max-w-full max-h-full object-contain transition-transform duration-300 pointer-events-auto"
            style={photoStyle}
          />
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-center gap-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-label-md shadow-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Ajuster</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 text-white backdrop-blur-md font-bold text-label-md shadow-xl hover:bg-white/30 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>Partager</span>
        </button>
      </footer>

      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-primary text-on-primary rounded-full shadow-lg text-label-sm font-semibold animate-in fade-in">
          Photo exportée avec succès !
        </div>
      )}

      {/* Info & EXIF Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-84 max-w-[90vw] z-20 bg-surface/95 backdrop-blur-2xl border-l border-outline-variant/30 transition-transform duration-300 ease-out shadow-2xl ${
          showInfo ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
            <h3 className="text-headline-sm font-bold text-on-surface">Informations</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant/50 text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Nom du fichier
            </span>
            <p className="text-body-md font-semibold text-on-surface break-words">{photo.alt || 'Photo'}</p>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Date de prise de vue
            </span>
            <p className="text-body-md text-on-surface">{photo.date || 'Date inconnue'}</p>
          </div>

          {/* Location details */}
          <div>
            <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Localisation GPS
            </span>
            {hasGps ? (
              <div className="p-3 bg-surface-container-high rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-label-sm">
                  <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                  <span>{photo.metadata?.location || 'Coordonnées GPS réelles'}</span>
                </div>
                <p className="text-label-xs text-on-surface-variant font-mono">
                  {photo.metadata!.latitude!.toFixed(5)}, {photo.metadata!.longitude!.toFixed(5)}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low rounded-xl text-on-surface-variant text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] opacity-60">location_off</span>
                <span>Aucune coordonnée GPS enregistrée</span>
              </div>
            )}
          </div>

          {/* Technical Specs */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Appareil
              </span>
              <p className="text-body-sm font-medium text-on-surface">
                {photo.metadata?.device || 'Inconnu'}
              </p>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Résolution
              </span>
              <p className="text-body-sm font-medium text-on-surface">
                {photo.metadata?.resolution || 'Inconnue'}
              </p>
            </div>
          </div>

          {/* EXIF Details */}
          {photo.metadata?.exif && (
            <div className="pt-4 border-t border-outline-variant/20 space-y-3">
              <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Données d'exposition EXIF
              </span>
              <div className="grid grid-cols-2 gap-3 text-body-xs">
                {photo.metadata.exif.shutterSpeed && (
                  <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl">
                    <span className="material-symbols-outlined text-primary text-[18px]">shutter_speed</span>
                    <span>{photo.metadata.exif.shutterSpeed}</span>
                  </div>
                )}
                {photo.metadata.exif.aperture && (
                  <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl">
                    <span className="material-symbols-outlined text-primary text-[18px]">camera</span>
                    <span>{photo.metadata.exif.aperture}</span>
                  </div>
                )}
                {photo.metadata.exif.iso && (
                  <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl">
                    <span className="material-symbols-outlined text-primary text-[18px]">iso</span>
                    <span>ISO {photo.metadata.exif.iso}</span>
                  </div>
                )}
                {photo.metadata.exif.focalLength && (
                  <div className="flex items-center gap-2 p-2 bg-surface-container-high rounded-xl">
                    <span className="material-symbols-outlined text-primary text-[18px]">straighten</span>
                    <span>{photo.metadata.exif.focalLength}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quality analysis results */}
          {photo.metadata?.analysis && (
            <div className="pt-4 border-t border-outline-variant/20 space-y-2">
              <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Analyse locale
              </span>
              <div className="p-3 bg-surface-container-high rounded-xl space-y-1 text-label-xs">
                <div className="flex justify-between">
                  <span>Score netteté :</span>
                  <span className="font-bold text-primary">
                    {photo.metadata.analysis.qualityScore}/100
                  </span>
                </div>
                {photo.metadata.analysis.isBlurry && (
                  <p className="text-amber-500 font-semibold">• Potentiellement floue</p>
                )}
                {photo.metadata.analysis.isUnderexposed && (
                  <p className="text-amber-500 font-semibold">• Sous-exposée</p>
                )}
                {photo.metadata.analysis.isOverexposed && (
                  <p className="text-amber-500 font-semibold">• Surexposée</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (In-app modal, replaces window.confirm) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">Supprimer cette photo ?</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Cette action supprimera définitivement le fichier et ses métadonnées de votre photothèque locale.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-variant/30"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 rounded-xl bg-error text-white font-bold text-label-md active:scale-95 shadow-md"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailView;
