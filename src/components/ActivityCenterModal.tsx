import React, { useEffect, useState } from 'react';
import { activityService } from '../services/activityService';
import type { ActivityTask } from '../services/activityService';

interface ActivityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityCenterModal: React.FC<ActivityCenterModalProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<ActivityTask[]>([]);

  useEffect(() => {
    const unsubscribe = activityService.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const runningCount = tasks.filter((t) => t.status === 'running' || t.status === 'pending').length;

  const getTypeIcon = (type: ActivityTask['type']) => {
    switch (type) {
      case 'import':
        return 'upload_file';
      case 'backup':
        return 'archive';
      case 'restore':
        return 'settings_backup_restore';
      case 'ai_analysis':
        return 'auto_fix_high';
      case 'duplicate_scan':
        return 'content_copy';
      case 'thumbnail_generation':
        return 'photo_size_select_large';
      case 'benchmark':
        return 'speed';
      default:
        return 'task_alt';
    }
  };

  const getStatusBadge = (status: ActivityTask['status']) => {
    switch (status) {
      case 'running':
        return <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold animate-pulse">En cours</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold">Terminé</span>;
      case 'failed':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 text-[10px] font-bold">Erreur</span>;
      case 'canceled':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold">Annulé</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold">Attente</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">Centre d'Activité</h3>
              <p className="text-[12px] text-on-surface-variant">
                {runningCount > 0
                  ? `${runningCount} opération(s) en cours en arrière-plan`
                  : 'Aucune tâche active. Historique récent.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/40"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Task List */}
        <div className="overflow-y-auto flex-grow space-y-3 pr-1">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-4xl opacity-30">done_all</span>
              <p className="text-body-sm font-semibold">Aucune activité enregistrée pour le moment.</p>
              <p className="text-[11px] opacity-70">
                Vos imports, sauvegardes, calculs IA et restaurations apparaîtront ici.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {getTypeIcon(task.type)}
                    </span>
                    <div>
                      <h4 className="text-label-md font-bold text-on-surface">{task.title}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{task.statusMessage}</p>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                {/* Progress bar if running */}
                {task.status === 'running' && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-on-surface-variant font-medium">
                      <span>Progression</span>
                      <span>{task.progress}%</span>
                    </div>
                  </div>
                )}

                {/* Cancel button if running and cancelable */}
                {task.status === 'running' && task.canCancel && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => activityService.cancelTask(task.id)}
                      className="px-3 py-1 bg-surface-container-high hover:bg-error/15 text-error rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Annuler la tâche
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
          <button
            onClick={() => activityService.clearCompletedTasks()}
            className="text-label-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Effacer les tâches terminées
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-label-sm active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
