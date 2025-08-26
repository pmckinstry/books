import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';

export async function GET() {
  try {
    const metrics = performanceMonitor.getMetrics();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        totalOperations: Object.keys(metrics).length,
        averageResponseTime: Object.values(metrics).reduce((sum, m) => sum + m.avgTime, 0) / Object.keys(metrics).length || 0,
        totalCacheHits: Object.values(metrics).reduce((sum, m) => sum + m.cacheHits, 0),
        totalCacheMisses: Object.values(metrics).reduce((sum, m) => sum + m.cacheMisses, 0),
        overallCacheHitRate: Object.values(metrics).reduce((sum, m) => sum + m.cacheHitRate, 0) / Object.keys(metrics).length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    performanceMonitor.reset();
    return NextResponse.json({ message: 'Performance metrics reset successfully' });
  } catch (error) {
    console.error('Error resetting performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to reset performance metrics' },
      { status: 500 }
    );
  }
}
