// Simple performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, { count: number; totalTime: number; cacheHits: number; cacheMisses: number }> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const startTime = Date.now();
    return () => this.endTimer(operation, startTime);
  }

  private endTimer(operation: string, startTime: number): void {
    const duration = Date.now() - startTime;
    const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 };
    
    this.metrics.set(operation, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      cacheHits: existing.cacheHits,
      cacheMisses: existing.cacheMisses
    });
  }

  recordCacheHit(operation: string): void {
    const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 };
    this.metrics.set(operation, { ...existing, cacheHits: existing.cacheHits + 1 });
  }

  recordCacheMiss(operation: string): void {
    const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 };
    this.metrics.set(operation, { ...existing, cacheMisses: existing.cacheMisses + 1 });
  }

  getMetrics(): Record<string, { avgTime: number; cacheHitRate: number; totalCalls: number }> {
    const result: Record<string, { avgTime: number; cacheHitRate: number; totalCalls: number }> = {};
    
    for (const [operation, metrics] of this.metrics.entries()) {
      const totalCalls = metrics.cacheHits + metrics.cacheMisses;
      const cacheHitRate = totalCalls > 0 ? (metrics.cacheHits / totalCalls) * 100 : 0;
      const avgTime = metrics.count > 0 ? metrics.totalTime / metrics.count : 0;
      
      result[operation] = {
        avgTime: Math.round(avgTime * 100) / 100,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        totalCalls
      };
    }
    
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
