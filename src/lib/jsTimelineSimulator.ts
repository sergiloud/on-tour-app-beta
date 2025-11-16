// Timeline Maestro v3.0 - JavaScript Fallback Simulator
// Pure JavaScript implementation for environments without WASM

import type { 
  TimelineData, 
  TimelineChange, 
  TimelineSimulationResult,
  TimelineMetrics 
} from '../shared/timelineStore';

export class JavaScriptTimelineSimulator {
  private timelineData: TimelineData | null = null;

  loadTimelineData(data: TimelineData): void {
    this.timelineData = data;
    console.log('📊 JS Timeline Simulator: Data loaded', {
      tasks: data.tasks.length,
      releases: data.releases.length,
      shows: data.shows.length
    });
  }

  simulateTimelineChange(change: any): TimelineSimulationResult {
    if (!this.timelineData) {
      throw new Error('Timeline data not loaded');
    }

    console.log('🔄 JS Simulation:', change.changeType || 'update', change.entityType || 'task', change.entityId || change.id);

    // Simplified financial impact calculation
    const financialImpact = this.calculateFinancialImpact(change);
    
    // Find affected entities (simplified)
    const affectedEntities = this.findAffectedEntities(change);
    
    // Calculate risk score (simplified)
    const riskScore = this.calculateRiskScore(change, affectedEntities);
    
    // Generate cascade effects
    const cascadeEffects = this.generateCascadeEffects(change, affectedEntities);

    const result: TimelineSimulationResult = {
      financial_impact: financialImpact,
      affected_entities: affectedEntities,
      cascade_effects: cascadeEffects,
      new_deadlines: {},
      risk_score: riskScore,
      revenue_change: Math.max(0, financialImpact),
      expense_change: Math.max(0, -financialImpact),
      critical_path: this.findCriticalPath(),
    };

    return result;
  }

  getTimelineMetrics(): TimelineMetrics {
    if (!this.timelineData) {
      return {
        total_tasks: 0,
        completed_tasks: 0,
        completion_rate: 0,
        total_releases: 0,
        released_count: 0,
        overdue_tasks: 0,
        total_revenue_impact: 0,
        total_cost_impact: 0,
        net_impact: 0,
        efficiency_score: 0,
      };
    }

    const totalTasks = this.timelineData.tasks.length;
    const completedTasks = this.timelineData.tasks.filter(t => t.status === 'completed').length;
    const overdueTask = this.timelineData.tasks.filter(t => 
      new Date(t.deadline) < new Date() && t.status !== 'completed'
    ).length;

    const totalRevenueImpact = [
      ...this.timelineData.tasks.map(t => t.revenue_impact),
      ...this.timelineData.releases.map(r => r.projected_revenue),
      ...this.timelineData.shows.map(s => s.revenue),
    ].reduce((sum, val) => sum + val, 0);

    const totalCostImpact = [
      ...this.timelineData.tasks.map(t => t.cost_impact),
      ...this.timelineData.releases.map(r => r.budget + r.marketing_spend),
      ...this.timelineData.shows.map(s => s.expenses),
    ].reduce((sum, val) => sum + val, 0);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const efficiencyScore = totalTasks > 0 ? 
      (completionRate * 0.7 + (1 - overdueTask / totalTasks) * 0.3) : 0;

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_rate: completionRate,
      total_releases: this.timelineData.releases.length,
      released_count: this.timelineData.releases.filter(r => r.release_type === 'released').length,
      overdue_tasks: overdueTask,
      total_revenue_impact: totalRevenueImpact,
      total_cost_impact: totalCostImpact,
      net_impact: totalRevenueImpact - totalCostImpact,
      efficiency_score: efficiencyScore,
    };
  }

  private calculateFinancialImpact(change: any): number {
    if (!this.timelineData) return 0;

    // Simplified calculation - return random impact for demo
    const impacts = [-5000, -2000, 1000, 3000, 5000];
    return impacts[Math.floor(Math.random() * impacts.length)] || 0;
  }

  private findAffectedEntities(change: any): string[] {
    // Simplified - return random affected entities for demo
    return [`task:demo-task-${Math.floor(Math.random() * 3) + 1}`];
  }

  private calculateRiskScore(change: any, affectedEntities: string[]): number {
    // Simplified risk calculation
    return Math.min(100, 30 + affectedEntities.length * 10 + Math.floor(Math.random() * 20));
  }

  private generateCascadeEffects(change: any, affectedEntities: string[]): string[] {
    const effects: string[] = [];
    
    effects.push('Timeline adjustment required');
    if (affectedEntities.length > 0) {
      effects.push(`${affectedEntities.length} dependent items affected`);
    }
    effects.push('Resource reallocation may be needed');

    return effects;
  }

  private findCriticalPath(): string[] {
    if (!this.timelineData) return [];

    // Simplified critical path: tasks with highest revenue impact + dependencies
    return this.timelineData.tasks
      .filter(t => t.revenue_impact > 1000 || t.dependencies.length > 0)
      .map(t => t.id)
      .sort();
  }
}

// Export singleton instance for compatibility
export const jsTimelineSimulator = new JavaScriptTimelineSimulator();