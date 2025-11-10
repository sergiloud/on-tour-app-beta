/**
 * Finance Worker Pool Manager
 *
 * Manages multiple Web Workers for parallel financial calculations
 * Features:
 * - Load balancing across workers
 * - Request queuing
 * - Automatic cleanup
 * - Fallback to sync calculations
 */

interface WorkerTask {
    id: string;
    message: any;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timestamp: number;
}

interface WorkerInstance {
    worker: Worker;
    busy: boolean;
    taskCount: number;
    lastUsed: number;
}

export class FinanceWorkerPool {
    private workers: WorkerInstance[] = [];
    private queue: WorkerTask[] = [];
    private poolSize: number;
    private nextTaskId = 0;
    private maxQueueSize = 100;
    private taskTimeout = 30000; // 30 seconds
    private cleanupInterval: number | null = null;

    constructor(poolSize: number = navigator.hardwareConcurrency || 4) {
        // Use max 4 workers to avoid overwhelming the system
        this.poolSize = Math.min(poolSize, 4);
        this.initialize();
    }

    /**
     * Initialize worker pool
     */
    private initialize() {
        // console.log(`[WorkerPool] Initializing ${this.poolSize} workers...`);

        for (let i = 0; i < this.poolSize; i++) {
            try {
                const worker = new Worker(
                    new URL('../workers/finance.optimized.worker.ts', import.meta.url),
                    { type: 'module' }
                );

                const instance: WorkerInstance = {
                    worker,
                    busy: false,
                    taskCount: 0,
                    lastUsed: Date.now()
                };

                worker.onmessage = (event) => this.handleWorkerMessage(instance, event);
                worker.onerror = (error) => this.handleWorkerError(instance, error);

                this.workers.push(instance);
            } catch (error) {
                console.error('[WorkerPool] Failed to create worker:', error);
            }
        }

        // Start cleanup interval
        this.cleanupInterval = window.setInterval(() => {
            this.cleanupStaleWorkers();
        }, 60000); // Every minute

        // console.log(`[WorkerPool] ${this.workers.length} workers ready`);
    }

    /**
     * Execute task in worker pool
     */
    async execute<T = any>(message: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const taskId = `task-${this.nextTaskId++}`;

            const task: WorkerTask = {
                id: taskId,
                message: { ...message, taskId },
                resolve,
                reject,
                timestamp: Date.now()
            };

            // Check queue size
            if (this.queue.length >= this.maxQueueSize) {
                reject(new Error('Worker pool queue is full'));
                return;
            }

            // Add to queue
            this.queue.push(task);

            // Try to process immediately
            this.processQueue();

            // Set timeout
            setTimeout(() => {
                const index = this.queue.findIndex(t => t.id === taskId);
                if (index >= 0) {
                    this.queue.splice(index, 1);
                    reject(new Error('Task timeout'));
                }
            }, this.taskTimeout);
        });
    }

    /**
     * Process queued tasks
     */
    private processQueue() {
        if (this.queue.length === 0) return;

        // Find available worker
        const availableWorker = this.workers.find(w => !w.busy);

        if (!availableWorker) {
            // All workers busy, task stays in queue
            return;
        }

        // Get next task
        const task = this.queue.shift();
        if (!task) return;

        // Mark worker as busy
        availableWorker.busy = true;
        availableWorker.taskCount++;
        availableWorker.lastUsed = Date.now();

        // Store task info for response handling
        (availableWorker.worker as any).__currentTask = task;

        // Send to worker
        try {
            availableWorker.worker.postMessage(task.message);
        } catch (error) {
            availableWorker.busy = false;
            task.reject(error instanceof Error ? error : new Error('Failed to post message'));
            this.processQueue(); // Try next task
        }
    }

    /**
     * Handle worker message
     */
    private handleWorkerMessage(instance: WorkerInstance, event: MessageEvent) {
        const task = (instance.worker as any).__currentTask as WorkerTask | undefined;

        if (!task) {
            // Worker ready message or orphaned response
            return;
        }

        const { type, result, error, duration } = event.data;

        // Log performance
        if (duration !== undefined) {
            // console.log(`[WorkerPool] Task completed in ${duration.toFixed(2)}ms`);
        }

        // Mark worker as available
        instance.busy = false;
        delete (instance.worker as any).__currentTask;

        // Resolve or reject
        if (type.endsWith('_SUCCESS')) {
            task.resolve(result);
        } else if (type === 'ERROR') {
            task.reject(new Error(error || 'Worker error'));
        }

        // Process next task in queue
        this.processQueue();
    }

    /**
     * Handle worker error
     */
    private handleWorkerError(instance: WorkerInstance, error: ErrorEvent) {
        console.error('[WorkerPool] Worker error:', error);

        const task = (instance.worker as any).__currentTask as WorkerTask | undefined;

        if (task) {
            task.reject(new Error(`Worker error: ${error.message}`));
            delete (instance.worker as any).__currentTask;
        }

        // Mark worker as available
        instance.busy = false;

        // Try to recover by terminating and recreating worker
        this.recoverWorker(instance);

        // Process next task
        this.processQueue();
    }

    /**
     * Recover failed worker
     */
    private recoverWorker(instance: WorkerInstance) {
        try {
            instance.worker.terminate();

            const newWorker = new Worker(
                new URL('../workers/finance.optimized.worker.ts', import.meta.url),
                { type: 'module' }
            );

            instance.worker = newWorker;
            instance.busy = false;
            instance.taskCount = 0;
            instance.lastUsed = Date.now();

            newWorker.onmessage = (event) => this.handleWorkerMessage(instance, event);
            newWorker.onerror = (error) => this.handleWorkerError(instance, error);

            // console.log('[WorkerPool] Worker recovered');
        } catch (error) {
            console.error('[WorkerPool] Failed to recover worker:', error);
        }
    }

    /**
     * Cleanup stale workers
     */
    private cleanupStaleWorkers() {
        const now = Date.now();
        const staleThreshold = 5 * 60 * 1000; // 5 minutes

        for (const instance of this.workers) {
            if (!instance.busy && now - instance.lastUsed > staleThreshold) {
                // console.log('[WorkerPool] Cleaning up stale worker');
                // Could implement worker recycling here
            }
        }
    }

    /**
     * Get pool statistics
     */
    getStats() {
        return {
            poolSize: this.workers.length,
            busyWorkers: this.workers.filter(w => w.busy).length,
            queueSize: this.queue.length,
            totalTasks: this.workers.reduce((sum, w) => sum + w.taskCount, 0)
        };
    }

    /**
     * Terminate all workers
     */
    terminate() {
        // console.log('[WorkerPool] Terminating all workers...');

        if (this.cleanupInterval !== null) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        for (const instance of this.workers) {
            instance.worker.terminate();
        }

        this.workers = [];
        this.queue = [];

        // console.log('[WorkerPool] All workers terminated');
    }
}

// Singleton instance
let workerPoolInstance: FinanceWorkerPool | null = null;

export function getFinanceWorkerPool(): FinanceWorkerPool {
    if (!workerPoolInstance) {
        workerPoolInstance = new FinanceWorkerPool();
    }
    return workerPoolInstance;
}

export function terminateFinanceWorkerPool() {
    if (workerPoolInstance) {
        workerPoolInstance.terminate();
        workerPoolInstance = null;
    }
}
