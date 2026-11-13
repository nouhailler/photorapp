export type ActivityType =
  | 'import'
  | 'backup'
  | 'restore'
  | 'ai_analysis'
  | 'thumbnail_generation'
  | 'duplicate_scan'
  | 'benchmark';

export type ActivityStatus = 'pending' | 'running' | 'completed' | 'canceled' | 'failed';

export interface ActivityTask {
  id: string;
  type: ActivityType;
  title: string;
  status: ActivityStatus;
  progress: number; // 0-100
  statusMessage: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  canCancel?: boolean;
}

type ActivityListener = (tasks: ActivityTask[]) => void;

class ActivityService {
  private tasks: ActivityTask[] = [];
  private listeners: Set<ActivityListener> = new Set();
  private abortControllers: Map<string, AbortController> = new Map();

  public subscribe(listener: ActivityListener): () => void {
    this.listeners.add(listener);
    listener([...this.tasks]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = [...this.tasks];
    this.listeners.forEach((listener) => {
      try {
        listener(copy);
      } catch (e) {
        console.warn('Activity listener error:', e);
      }
    });
  }

  public createTask(type: ActivityType, title: string, canCancel = true): string {
    const id = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const task: ActivityTask = {
      id,
      type,
      title,
      status: 'pending',
      progress: 0,
      statusMessage: 'En attente...',
      startedAt: new Date().toISOString(),
      canCancel,
    };

    if (canCancel) {
      this.abortControllers.set(id, new AbortController());
    }

    this.tasks.unshift(task);
    // Keep max 20 recent activities
    if (this.tasks.length > 20) {
      this.tasks.pop();
    }

    this.notify();
    return id;
  }

  public updateTask(
    id: string,
    update: Partial<Pick<ActivityTask, 'status' | 'progress' | 'statusMessage' | 'error'>>
  ) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    if (update.status !== undefined) task.status = update.status;
    if (update.progress !== undefined) task.progress = update.progress;
    if (update.statusMessage !== undefined) task.statusMessage = update.statusMessage;
    if (update.error !== undefined) task.error = update.error;

    if (update.status === 'completed' || update.status === 'failed' || update.status === 'canceled') {
      task.completedAt = new Date().toISOString();
      this.abortControllers.delete(id);
    }

    this.notify();
  }

  public cancelTask(id: string) {
    const controller = this.abortControllers.get(id);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(id);
    }
    this.updateTask(id, {
      status: 'canceled',
      statusMessage: 'Opération interrompue par l’utilisateur.',
    });
  }

  public getAbortSignal(id: string): AbortSignal | undefined {
    return this.abortControllers.get(id)?.signal;
  }

  public getRecentTasks(): ActivityTask[] {
    return [...this.tasks];
  }

  public clearCompletedTasks() {
    this.tasks = this.tasks.filter((t) => t.status === 'running' || t.status === 'pending');
    this.notify();
  }
}

export const activityService = new ActivityService();
