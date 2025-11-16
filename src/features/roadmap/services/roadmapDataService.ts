/**
 * Roadmap Data Service
 * 
 * Transforma datos reales del usuario (shows, contratos, finanzas) en datos de roadmap
 */

import { getCurrentUserId } from '../../../lib/demoAuth';
import { getCurrentOrgId } from '../../../lib/tenants';
import { HybridShowService } from '../../../services/hybridShowService';
import { HybridContractService } from '../../../services/hybridContractService';
import { FirestoreFinanceService } from '../../../services/firestoreFinanceService';
import { isFirebaseConfigured } from '../../../lib/firebase';
import type { RoadmapNode, Dependency, RoadmapResponse, UserInfo } from '../types';
import type { Show } from '../../../lib/shows';
import type { Contract } from '../../../types/contract';

/**
 * Convierte shows del usuario en nodos de roadmap
 */
function showsToRoadmapNodes(shows: Show[]): RoadmapNode[] {
  return shows.map((show) => {
    // Calcular fechas
    const startDate = new Date(show.date);
    const endDate = show.endDate ? new Date(show.endDate) : new Date(startDate);
    if (!show.endDate) {
      endDate.setDate(endDate.getDate() + 1); // Shows duran 1 día por defecto
    }
    
    // TODOS los shows son tipo 'show', NUNCA milestone
    const type: 'show' = 'show';
    
    // Calcular progreso basado en estado
    let progress = 0;
    if (show.status === 'confirmed') progress = 100;
    else if (show.status === 'pending') progress = 50;
    else if (show.status === 'offer') progress = 25;
    else progress = 10; // canceled, archived, postponed

    // Mapear status del show a status del roadmap
    let roadmapStatus: RoadmapNode['status'];
    switch (show.status) {
      case 'confirmed':
        roadmapStatus = 'confirmed';
        break;
      case 'pending':
        roadmapStatus = 'pending';
        break;
      case 'canceled':
        roadmapStatus = 'cancelled';
        break;
      default:
        roadmapStatus = 'draft';
    }

    return {
      id: show.id,
      type,
      title: show.name || `Show en ${show.city}`,
      description: `${show.city}, ${show.country}${show.venue ? ` @ ${show.venue}` : ''}`,
      status: roadmapStatus,
      priority: show.fee && show.fee > 5000 ? 'high' : 
                show.fee && show.fee > 2000 ? 'medium' : 'low',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      assignedTo: ['current-user'],
      location: {
        city: show.city,
        venue: show.venue || undefined,
        coordinates: (show.lat && show.lng) ? [show.lat, show.lng] as [number, number] : undefined
      },
      metadata: {
        showId: show.id,
        capacity: 0,
        fee: show.fee || 0,
        cost: show.cost || 0,
        progress,
        originalShowData: {
          type: 'show',
          id: show.id,
          venue: show.venue,
          city: show.city,
          country: show.country
        }
      }
    };
  });
}

/**
 * Convierte contratos en nodos de roadmap
 */
function contractsToRoadmapNodes(contracts: Contract[]): RoadmapNode[] {
  return contracts
    .filter(contract => contract.status !== 'signed' && contract.status !== 'expired') // Solo contratos activos
    .map((contract) => {
      const startDate = new Date(contract.createdAt);
      const endDate = contract.expirationDate ? new Date(contract.expirationDate) : new Date(startDate);
      if (!contract.expirationDate) {
        endDate.setDate(endDate.getDate() + 30); // Contratos tienen 30 días para completarse por defecto
      }
      
      let progress = 0;
      if (contract.status === 'signed') progress = 100;
      else if (contract.status === 'pending') progress = 75;
      else if (contract.status === 'draft') progress = 25;

      // Mapear status del contrato a status del roadmap
      let roadmapStatus: RoadmapNode['status'];
      switch (contract.status) {
        case 'signed':
          roadmapStatus = 'completed';
          break;
        case 'pending':
          roadmapStatus = 'pending';
          break;
        case 'cancelled':
          roadmapStatus = 'cancelled';
          break;
        case 'expired':
          roadmapStatus = 'cancelled';
          break;
        default:
          roadmapStatus = 'draft';
      }

      return {
        id: `contract-${contract.id}`,
        type: 'task',
        title: `Contract: ${contract.title}`,
        description: contract.description || 'Contract management task',
        status: roadmapStatus,
        priority: contract.requiresSignature ? 'high' : 'medium',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        assignedTo: ['current-user'],
        metadata: {
          taskId: contract.id,
          progress,
          // Campos extendidos para trackear datos originales
          originalContractData: {
            type: 'contract',
            id: contract.id,
            requiresSignature: contract.requiresSignature,
            status: contract.status
          }
        }
      };
    });
}

/**
 * Genera dependencias automáticas basadas en la lógica de negocio
 */
function generateDependencies(nodes: RoadmapNode[]): Dependency[] {
  const dependencies: Dependency[] = [];
  
  // Separar shows y contratos
  const showNodes = nodes.filter(n => (n.metadata as any).originalShowData?.type === 'show');
  const contractNodes = nodes.filter(n => (n.metadata as any).originalContractData?.type === 'contract');
  
  // Regla: Los contratos deben completarse antes de los shows
  contractNodes.forEach(contract => {
    showNodes.forEach(show => {
      // Si el contrato está relacionado con el show (por fecha o similar)
      const contractDate = new Date(contract.startDate);
      const showDate = new Date(show.startDate);
      
      // Si el contrato es anterior al show por menos de 60 días, crear dependencia
      const daysDiff = (showDate.getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 0 && daysDiff <= 60) {
        dependencies.push({
          id: `dep-${contract.id}-${show.id}`,
          fromNodeId: contract.id,
          toNodeId: show.id,
          type: 'finish_to_start',
          lag: 0,
          isAutoGenerated: true,
          description: 'Contract must be signed before show'
        });
      }
    });
  });
  
  // Regla: Shows en el mismo país deben estar separados temporalmente
  showNodes.forEach((show1, index) => {
    showNodes.slice(index + 1).forEach(show2 => {
      const country1 = show1.location?.city || '';
      const country2 = show2.location?.city || '';
      
      if (country1 === country2 && country1) {
        const date1 = new Date(show1.startDate);
        const date2 = new Date(show2.startDate);
        
        // Si están muy cerca en fecha, crear dependencia temporal
        const daysDiff = Math.abs((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) {
          const [source, target] = date1 < date2 ? [show1, show2] : [show2, show1];
          dependencies.push({
            id: `dep-${source.id}-${target.id}`,
            fromNodeId: source.id,
            toNodeId: target.id,
            type: 'finish_to_start',
            lag: 1, // 1 día de separación mínima
            isAutoGenerated: true,
            description: `Shows in same region need buffer time`
          });
        }
      }
    });
  });
  
  return dependencies;
}

/**
 * Obtiene información del usuario actual
 */
async function getCurrentUserInfo(): Promise<UserInfo> {
  const userId = getCurrentUserId();
  
  // Obtener perfil del usuario (implementar según tu sistema)
  return {
    id: userId,
    name: 'Current User', // TODO: Obtener del perfil real
    email: 'user@example.com', // TODO: Obtener del perfil real
    avatar: '', // TODO: Obtener del perfil real
    role: 'admin'
  };
}

/**
 * Servicio principal para cargar datos de roadmap del usuario
 */
export class RoadmapDataService {
  /**
   * Carga todos los datos del roadmap del usuario actual
   */
  static async loadUserRoadmapData(): Promise<RoadmapResponse> {
    console.log('🗺️ Loading user roadmap data...');
    
    try {
      const userId = getCurrentUserId();
      const orgId = getCurrentOrgId();
      
      console.log('📊 Loading user data:', { userId, orgId });
      
      // Cargar datos del usuario en paralelo
      const [shows, contracts, userInfo] = await Promise.all([
        HybridShowService.getShows(),
        HybridContractService.getContracts(),
        getCurrentUserInfo()
      ]);
      
      console.log('📈 Data loaded:', {
        shows: shows.length,
        contracts: contracts.length,
        showsSample: shows.slice(0, 3).map(s => ({ id: s.id, city: s.city, date: s.date })),
        contractsSample: contracts.slice(0, 3).map(c => ({ id: c.id, title: c.title, status: c.status }))
      });
      
      // Convertir a nodos de roadmap
      const showNodes = showsToRoadmapNodes(shows);
      const contractNodes = contractsToRoadmapNodes(contracts);
      const allNodes = [...showNodes, ...contractNodes];
      
      // Generar dependencias automáticas
      const dependencies = generateDependencies(allNodes);
      
      console.log('🔗 Generated roadmap:', {
        nodes: allNodes.length,
        dependencies: dependencies.length,
        showNodes: showNodes.length,
        contractNodes: contractNodes.length
      });
      
      return {
        nodes: allNodes,
        dependencies,
        users: [userInfo],
        metadata: {
          totalEvents: allNodes.length,
          dateRange: {
            start: allNodes.length > 0 ? 
              Math.min(...allNodes.map(n => new Date(n.startDate).getTime())).toString() : 
              new Date().toISOString(),
            end: allNodes.length > 0 ? 
              Math.max(...allNodes.map(n => new Date(n.endDate || n.startDate).getTime())).toString() : 
              new Date().toISOString()
          },
          lastUpdated: new Date().toISOString(),
          generatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Failed to load user roadmap data:', error);
      throw new Error(`Failed to load roadmap data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Actualiza un nodo específico (usado en simulaciones)
   */
  static async updateNode(nodeId: string, updates: Partial<RoadmapNode>): Promise<void> {
    console.log('🔄 Updating roadmap node:', { nodeId, updates });
    
    // Determinar el tipo de nodo y actualizar el dato original
    if (nodeId.startsWith('contract-')) {
      const contractId = nodeId.replace('contract-', '');
      // TODO: Actualizar contrato real
      console.log('📝 Would update contract:', contractId);
    } else {
      // Es un show
      // TODO: Actualizar show real
      console.log('🎪 Would update show:', nodeId);
    }
  }
  
  /**
   * Verifica si hay datos del usuario disponibles
   */
  static async hasUserData(): Promise<boolean> {
    try {
      console.log('🔍 Checking user data availability...');
      const shows = await HybridShowService.getShows();
      const contracts = await HybridContractService.getContracts();
      
      const hasData = shows.length > 0 || contracts.length > 0;
      console.log(`📊 User data check: ${hasData ? 'HAS DATA' : 'NO DATA'}`, {
        showsCount: shows.length,
        contractsCount: contracts.length
      });
      
      return hasData;
    } catch (error) {
      console.warn('⚠️ Error checking user data:', error);
      return false;
    }
  }
}