import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'PerformanceMonitorService';

export interface IPerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface IPerformanceStats {
  averageDuration: number;
  totalOperations: number;
  successRate: number;
  slowestOperation: IPerformanceMetric | null;
  fastestOperation: IPerformanceMetric | null;
  recentOperations: IPerformanceMetric[];
}

export interface IPerformanceMonitorService {
  startTimer(operation: string): IPerformanceTimer;
  recordMetric(metric: IPerformanceMetric): void;
  getStats(operation?: string): IPerformanceStats;
  getSlowOperations(threshold: number): IPerformanceMetric[];
  clearMetrics(): void;
}

export interface IPerformanceTimer {
  end(success?: boolean, error?: string, metadata?: Record<string, any>): IPerformanceMetric;
}

/**
 * Performance monitoring service for tracking operation durations and success rates
 */
export class PerformanceMonitorService implements IPerformanceMonitorService {
  private metrics: IPerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000; // Maximum number of metrics to store
  private readonly SLOW_OPERATION_THRESHOLD = 2000; // 2 seconds

  constructor() {
    Log.info(LOG_SOURCE, 'PerformanceMonitorService initialized');
  }

  /**
   * Start a performance timer for an operation
   */
  public startTimer(operation: string): IPerformanceTimer {
    const startTime = performance.now();
    const timestamp = Date.now();

    return {
      end: (success = true, error?: string, metadata?: Record<string, any>): IPerformanceMetric => {
        const duration = performance.now() - startTime;
        
        const metric: IPerformanceMetric = {
          operation,
          duration: Math.round(duration),
          timestamp,
          success,
          error,
          metadata
        };

        this.recordMetric(metric);
        return metric;
      }
    };
  }

  /**
   * Record a performance metric
   */
  public recordMetric(metric: IPerformanceMetric): void {
    // If we're at max capacity, remove oldest metric
    if (this.metrics.length >= this.MAX_METRICS) {
      this.metrics.shift();
    }

    this.metrics.push(metric);

    // Log slow operations
    if (metric.duration > this.SLOW_OPERATION_THRESHOLD) {
      Log.warn(LOG_SOURCE, `Slow operation detected: ${metric.operation} took ${metric.duration}ms`);
    }

    // Log failed operations
    if (!metric.success) {
      Log.error(LOG_SOURCE, new Error(`Failed operation: ${metric.operation} - ${metric.error || 'Unknown error'}`));
    }

    Log.verbose(LOG_SOURCE, `Recorded metric: ${metric.operation} (${metric.duration}ms, success: ${metric.success})`);
  }

  /**
   * Get performance statistics for all operations or a specific operation
   */
  public getStats(operation?: string): IPerformanceStats {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        averageDuration: 0,
        totalOperations: 0,
        successRate: 0,
        slowestOperation: null,
        fastestOperation: null,
        recentOperations: []
      };
    }

    const successfulOperations = filteredMetrics.filter(m => m.success);
    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = Math.round(totalDuration / filteredMetrics.length);
    const successRate = Math.round((successfulOperations.length / filteredMetrics.length) * 100) / 100;

    // Find slowest and fastest operations
    const sortedByDuration = [...filteredMetrics].sort((a, b) => a.duration - b.duration);
    const fastestOperation = sortedByDuration[0] || null;
    const slowestOperation = sortedByDuration[sortedByDuration.length - 1] || null;

    // Get recent operations (last 10)
    const recentOperations = filteredMetrics.slice(-10);

    return {
      averageDuration,
      totalOperations: filteredMetrics.length,
      successRate,
      slowestOperation,
      fastestOperation,
      recentOperations
    };
  }

  /**
   * Get operations that took longer than the specified threshold
   */
  public getSlowOperations(threshold: number = this.SLOW_OPERATION_THRESHOLD): IPerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  /**
   * Clear all recorded metrics
   */
  public clearMetrics(): void {
    const count = this.metrics.length;
    this.metrics = [];
    Log.info(LOG_SOURCE, `Cleared ${count} performance metrics`);
  }

  /**
   * Get metrics for a specific time range
   */
  public getMetricsInRange(startTime: number, endTime: number): IPerformanceMetric[] {
    return this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get performance summary by operation type
   */
  public getOperationSummary(): Record<string, IPerformanceStats> {
    const operationTypes = [...new Set(this.metrics.map(m => m.operation))];
    const summary: Record<string, IPerformanceStats> = {};

    for (const operation of operationTypes) {
      summary[operation] = this.getStats(operation);
    }

    return summary;
  }

  /**
   * Export metrics for external analysis
   */
  public exportMetrics(): IPerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get memory usage estimation
   */
  public getMemoryUsage(): number {
    return JSON.stringify(this.metrics).length;
  }
}

/**
 * Decorator for automatic performance monitoring of async methods
 */
export function MonitorPerformance(operation?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operationName = operation || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const timer = performanceMonitor.startTimer(operationName);
      
      try {
        const result = await method.apply(this, args);
        timer.end(true, undefined, { args: args.length });
        return result;
      } catch (error) {
        timer.end(false, (error as Error).message, { args: args.length });
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Utility function for manual performance timing
 */
export async function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const timer = performanceMonitor.startTimer(operation);
  
  try {
    const result = await fn();
    timer.end(true, undefined, metadata);
    return result;
  } catch (error) {
    timer.end(false, (error as Error).message, metadata);
    throw error;
  }
}

// Singleton instance for global use
export const performanceMonitor = new PerformanceMonitorService();