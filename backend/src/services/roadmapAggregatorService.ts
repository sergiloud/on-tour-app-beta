/**
 * Roadmap Aggregator Service
 * 
 * Servicio inteligente que consulta todas las APIs de la aplicación
 * y construye un roadmap unificado con nodos y dependencias automáticas
 */

import type {
  RoadmapNode,
  Dependency,
  RoadmapResponse,
  RoadmapRequest,
  ShowData,
  TravelData,
  FinanceData,
  TaskData,
  DependencyRule
} from '../types/roadmap';

export class RoadmapAggregatorService {
  
  /**
   * Punto de entrada principal - construye el roadmap completo
   */
  async buildRoadmap(
    params: RoadmapRequest,
    tenantId: string,
    userId: string
  ): Promise<RoadmapResponse> {
    try {
      // 1. Recopilar datos de todas las fuentes
      const [shows, travels, finances, tasks] = await Promise.all([
        this.fetchShows(params, tenantId),
        this.fetchTravels(params, tenantId), 
        this.fetchFinances(params, tenantId),
        this.fetchTasks(params, tenantId)
      ]);

      // 2. Transformar a nodos del roadmap
      const nodes: RoadmapNode[] = [
        ...this.transformShowsToNodes(shows),
        ...this.transformTravelsToNodes(travels),
        ...this.transformFinancesToNodes(finances),
        ...this.transformTasksToNodes(tasks),
        // TODO: Agregar releases y milestones desde nuevas tablas
      ];

      // 3. Filtrar por parámetros de request
      const filteredNodes = this.filterNodes(nodes, params);

      // 4. Generar dependencias inteligentes
      const dependencies = this.generateDependencies(filteredNodes);

      // 5. Calcular metadata
      const metadata = this.calculateMetadata(filteredNodes);

      return {
        nodes: filteredNodes,
        dependencies,
        metadata
      };

    } catch (error) {
      console.error('Error building roadmap:', error);
      throw new Error(`Failed to build roadmap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtener shows desde la API existente
   */
  private async fetchShows(params: RoadmapRequest, tenantId: string): Promise<ShowData[]> {
    // TODO: Implementar llamada real a shows API
    // Por ahora devolvemos mock data
    return [
      {
        id: 'show-1',
        date: '2025-12-15',
        venue: 'Madison Square Garden',
        city: 'New York',
        status: 'confirmed',
        fee: 25000,
        capacity: 20000,
        ticketsSold: 18500
      },
      {
        id: 'show-2', 
        date: '2025-12-18',
        venue: 'The Forum',
        city: 'Los Angeles',
        status: 'pending',
        fee: 30000,
        capacity: 17500
      }
    ];
  }

  /**
   * Obtener viajes desde travel API
   */
  private async fetchTravels(params: RoadmapRequest, tenantId: string): Promise<TravelData[]> {
    // TODO: Implementar llamada real a travel API
    return [
      {
        id: 'flight-1',
        type: 'flight',
        fromDate: '2025-12-14',
        fromLocation: 'Madrid',
        toLocation: 'New York',
        cost: 800,
        status: 'booked',
        relatedShowId: 'show-1'
      },
      {
        id: 'hotel-1',
        type: 'hotel',
        fromDate: '2025-12-14',
        toDate: '2025-12-16',
        fromLocation: 'New York',
        cost: 450,
        status: 'confirmed',
        relatedShowId: 'show-1'
      }
    ];
  }

  /**
   * Obtener finanzas desde finance API
   */
  private async fetchFinances(params: RoadmapRequest, tenantId: string): Promise<FinanceData[]> {
    // TODO: Implementar llamada real a finance API
    return [
      {
        id: 'invoice-1',
        type: 'invoice',
        amount: 25000,
        category: 'Show Fee',
        dueDate: '2025-12-20',
        status: 'pending',
        relatedShowId: 'show-1',
        description: 'Madison Square Garden payment'
      },
      {
        id: 'expense-1',
        type: 'expense',
        amount: -1250,
        category: 'Travel',
        dueDate: '2025-12-14',
        status: 'paid',
        description: 'Flight to NYC'
      }
    ];
  }

  /**
   * Obtener tareas (nueva funcionalidad)
   */
  private async fetchTasks(params: RoadmapRequest, tenantId: string): Promise<TaskData[]> {
    // TODO: Implementar nueva tabla de tasks
    return [
      {
        id: 'task-1',
        title: 'Prepare setlist for NYC show',
        description: 'Finalize song selection and rehearsal schedule',
        assignedTo: ['user-1'],
        dueDate: '2025-12-10',
        priority: 'high',
        status: 'in_progress',
        progress: 75,
        estimatedHours: 8,
        relatedShowId: 'show-1'
      },
      {
        id: 'task-2',
        title: 'Marketing campaign - West Coast',
        description: 'Launch promotional campaign for LA shows',
        assignedTo: ['user-2', 'user-3'],
        dueDate: '2025-12-12',
        priority: 'medium',
        status: 'todo',
        progress: 0,
        estimatedHours: 20
      }
    ];
  }

  /**
   * Transformar shows a nodos del roadmap
   */
  private transformShowsToNodes(shows: ShowData[]): RoadmapNode[] {
    return shows.map(show => ({
      id: `show-${show.id}`,
      type: 'show' as const,
      title: `${show.venue}`,
      description: `Show in ${show.city}`,
      startDate: show.date,
      status: show.status as RoadmapNode['status'],
      priority: 'high' as const,
      location: {
        city: show.city,
        venue: show.venue
      },
      metadata: {
        showId: show.id,
        fee: show.fee,
        capacity: show.capacity,
        ticketsSold: show.ticketsSold
      }
    }));
  }

  /**
   * Transformar viajes a nodos del roadmap  
   */
  private transformTravelsToNodes(travels: TravelData[]): RoadmapNode[] {
    return travels.map(travel => ({
      id: `travel-${travel.id}`,
      type: 'travel' as const,
      title: travel.type === 'flight' ? 
        `Flight: ${travel.fromLocation} → ${travel.toLocation}` :
        `${travel.type}: ${travel.fromLocation}`,
      description: `${travel.type} booking`,
      startDate: travel.fromDate,
      endDate: travel.toDate,
      status: travel.status === 'booked' ? 'confirmed' : travel.status as RoadmapNode['status'],
      priority: 'medium' as const,
      location: {
        city: travel.fromLocation
      },
      metadata: {
        transportType: travel.type as any,
        cost: travel.cost,
        flightId: travel.type === 'flight' ? travel.id : undefined,
        hotelId: travel.type === 'hotel' ? travel.id : undefined
      }
    }));
  }

  /**
   * Transformar finanzas a nodos del roadmap
   */
  private transformFinancesToNodes(finances: FinanceData[]): RoadmapNode[] {
    return finances.map(finance => ({
      id: `finance-${finance.id}`,
      type: 'finance' as const,
      title: `${finance.type}: ${finance.description}`,
      description: `${finance.category} - ${finance.amount > 0 ? '+' : ''}$${Math.abs(finance.amount).toLocaleString()}`,
      startDate: finance.dueDate,
      status: finance.status === 'paid' ? 'completed' : 'pending' as RoadmapNode['status'],
      priority: Math.abs(finance.amount) > 10000 ? 'high' : 'medium' as const,
      metadata: {
        transactionId: finance.id,
        amount: finance.amount,
        category: finance.category,
        dueDate: finance.dueDate
      }
    }));
  }

  /**
   * Transformar tareas a nodos del roadmap
   */
  private transformTasksToNodes(tasks: TaskData[]): RoadmapNode[] {
    return tasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      description: task.description,
      startDate: task.dueDate,
      status: task.status === 'completed' ? 'completed' : 
              task.status === 'in_progress' ? 'pending' : 'draft' as RoadmapNode['status'],
      priority: task.priority as RoadmapNode['priority'],
      assignedTo: task.assignedTo,
      metadata: {
        taskId: task.id,
        progress: task.progress,
        estimatedHours: task.estimatedHours
      }
    }));
  }

  /**
   * Filtrar nodos según parámetros del request
   */
  private filterNodes(nodes: RoadmapNode[], params: RoadmapRequest): RoadmapNode[] {
    return nodes.filter(node => {
      // Filtro por fechas
      if (params.startDate && node.startDate < params.startDate) return false;
      if (params.endDate && node.startDate > params.endDate) return false;
      
      // Filtro por tipos
      if (params.types && !params.types.includes(node.type)) return false;
      
      // Filtro por status
      if (params.status && !params.status.includes(node.status)) return false;
      
      // Filtro por prioridad
      if (params.priority && !params.priority.includes(node.priority)) return false;
      
      // Filtro por asignados
      if (params.assignedTo && node.assignedTo) {
        const hasAssignedUser = params.assignedTo.some(userId => 
          node.assignedTo?.includes(userId)
        );
        if (!hasAssignedUser) return false;
      }
      
      return true;
    });
  }

  /**
   * Generar dependencias automáticas inteligentes
   */
  private generateDependencies(nodes: RoadmapNode[]): Dependency[] {
    const dependencies: Dependency[] = [];
    
    // Reglas de dependencias automáticas
    const rules: DependencyRule[] = [
      {
        fromType: 'travel',
        toType: 'show', 
        relationship: 'finish_to_start',
        condition: (travel, show) => {
          // Vuelo debe llegar antes del show en la misma ciudad
          return travel.metadata.transportType === 'flight' &&
                 travel.location?.city === show.location?.city &&
                 travel.startDate <= show.startDate;
        },
        lag: 0,
        description: 'Flight arrival before show'
      },
      {
        fromType: 'task',
        toType: 'show',
        relationship: 'finish_to_start', 
        condition: (task, show) => {
          // Tarea relacionada con el show debe completarse antes
          return task.metadata.taskId?.includes(show.metadata.showId || '') ||
                 task.title.toLowerCase().includes('setlist') ||
                 task.title.toLowerCase().includes('rehearsal');
        },
        lag: -1, // 1 día antes
        description: 'Task completion before show'
      },
      {
        fromType: 'show',
        toType: 'finance',
        relationship: 'start_to_start',
        condition: (show, finance) => {
          // Pago del show se activa cuando se confirma
          return !!(finance.metadata.category === 'Show Fee' &&
                 finance.metadata.transactionId?.includes(show.metadata.showId || ''));
        },
        lag: 5, // 5 días después del show para recibir pago
        description: 'Show payment after performance'
      }
    ];

    // Aplicar reglas para generar dependencias
    nodes.forEach(fromNode => {
      nodes.forEach(toNode => {
        if (fromNode.id === toNode.id) return;
        
        rules.forEach(rule => {
          if (rule.fromType === fromNode.type && 
              rule.toType === toNode.type && 
              rule.condition(fromNode, toNode)) {
            
            dependencies.push({
              id: `dep-${fromNode.id}-${toNode.id}`,
              fromNodeId: fromNode.id,
              toNodeId: toNode.id,
              type: rule.relationship,
              lag: rule.lag,
              description: rule.description,
              isAutoGenerated: true
            });
          }
        });
      });
    });

    return dependencies;
  }

  /**
   * Calcular metadata del roadmap
   */
  private calculateMetadata(nodes: RoadmapNode[]) {
    const dates = nodes.map(n => n.startDate).sort();
    
    return {
      totalEvents: nodes.length,
      dateRange: {
        start: dates[0] || new Date().toISOString().split('T')[0],
        end: dates[dates.length - 1] || new Date().toISOString().split('T')[0]
      },
      lastUpdated: new Date().toISOString(),
      generatedAt: new Date().toISOString()
    };
  }
}

// Singleton instance
export const roadmapAggregator = new RoadmapAggregatorService();