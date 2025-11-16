/**
 * Roadmap API Routes
 * 
 * Endpoint principal: GET /api/roadmap
 * Protegido por autenticación y tenant-aware
 */

import { Request, Response } from 'express';
import { roadmapAggregator } from '../services/roadmapAggregatorService';
import type { RoadmapRequest } from '../types/roadmap';

// Middleware interfaces (estos deberían existir en tu auth system)
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    organizationId: string;
    email: string;
    id: string;
    tenantId: string;
    role: string;
  };
}

/**
 * GET /api/roadmap
 * 
 * Query params:
 * - startDate: string (ISO date) 
 * - endDate: string (ISO date)
 * - types: string[] (comma-separated: show,travel,finance,task)  
 * - assignedTo: string[] (comma-separated user IDs)
 * - status: string[] (comma-separated statuses)
 * - priority: string[] (comma-separated priorities)
 */
export async function getRoadmap(req: AuthenticatedRequest, res: Response) {
  try {
    // Validar autenticación y tenant
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      });
    }

    const { tenantId, id: userId, role } = req.user;

    // Parsear query parameters
    const params: RoadmapRequest = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      types: parseArrayParam(req.query.types as string) as any,
      assignedTo: parseArrayParam(req.query.assignedTo as string),
      status: parseArrayParam(req.query.status as string) as any,
      priority: parseArrayParam(req.query.priority as string) as any
    };

    // Validar parámetros de fecha
    if (params.startDate && !isValidDate(params.startDate)) {
      return res.status(400).json({
        error: 'Invalid startDate format. Expected ISO date string (YYYY-MM-DD)',
        code: 'INVALID_START_DATE'
      });
    }

    if (params.endDate && !isValidDate(params.endDate)) {
      return res.status(400).json({
        error: 'Invalid endDate format. Expected ISO date string (YYYY-MM-DD)', 
        code: 'INVALID_END_DATE'
      });
    }

    // Validar tipos permitidos
    const validTypes = ['show', 'travel', 'finance', 'task', 'release', 'milestone'];
    if (params.types) {
      const invalidTypes = params.types.filter(type => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          error: `Invalid types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`,
          code: 'INVALID_TYPES'
        });
      }
    }

    // RBAC: Filtrar por rol del usuario
    const filteredParams = applyRoleBasedFiltering(params, role, userId);

    // Generar roadmap
    const roadmap = await roadmapAggregator.buildRoadmap(
      filteredParams,
      tenantId,
      userId
    );

    // Headers de cache
    res.set({
      'Cache-Control': 'private, max-age=300', // 5 minutos
      'ETag': generateETag(roadmap),
      'Last-Modified': new Date(roadmap.metadata.lastUpdated).toUTCString()
    });

    return res.json(roadmap);

  } catch (error) {
    console.error('Roadmap API error:', error);
    
    return res.status(500).json({
      error: 'Internal server error generating roadmap',
      code: 'ROADMAP_GENERATION_FAILED',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * POST /api/roadmap/simulate
 * 
 * Endpoint para el modo simulación - recibe nodos modificados
 * y devuelve impacto financiero calculado por WASM engine
 */
export async function simulateRoadmapChanges(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      });
    }

    const { simulationNodes } = req.body;
    
    if (!Array.isArray(simulationNodes)) {
      return res.status(400).json({
        error: 'simulationNodes must be an array of RoadmapNode objects',
        code: 'INVALID_SIMULATION_DATA'
      });
    }

    // TODO: Integrar con WASM Financial Engine
    // Por ahora devolvemos un mock del impacto financiero
    const financialImpact = {
      totalCostChange: -2500, // Aumento de costes por cambios
      affectedTransactions: 3,
      newEstimatedProfit: 45000,
      riskFactors: [
        'Flight cost increase due to date change',
        'Hotel availability limited for new dates'
      ],
      breakdown: {
        travelCosts: -1500,
        venueCosts: 0, 
        opportunityCost: -1000
      }
    };

    return res.json({
      simulationId: `sim_${Date.now()}`,
      nodes: simulationNodes,
      financialImpact,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simulation API error:', error);
    
    return res.status(500).json({
      error: 'Internal server error during simulation',
      code: 'SIMULATION_FAILED',
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse comma-separated query parameter to array
 */
function parseArrayParam(param: string | undefined): string[] | undefined {
  if (!param) return undefined;
  return param.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Validate ISO date string (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Apply role-based access control to roadmap request
 */
function applyRoleBasedFiltering(
  params: RoadmapRequest, 
  role: string, 
  userId: string
): RoadmapRequest {
  
  // Viewer: Solo puede ver, sin filtros especiales
  if (role === 'viewer') {
    return params;
  }
  
  // Member: Puede ver todos los tipos pero filtrado por assignments
  if (role === 'member') {
    return {
      ...params,
      // Agregar el usuario actual a los filtros de asignación si no se especificó
      assignedTo: params.assignedTo || [userId]
    };
  }
  
  // Manager/Owner: Acceso completo
  return params;
}

/**
 * Generate ETag for caching based on roadmap content
 */
function generateETag(roadmap: any): string {
  const content = JSON.stringify({
    nodeCount: roadmap.nodes.length,
    dependencyCount: roadmap.dependencies.length,
    lastUpdated: roadmap.metadata.lastUpdated
  });
  
  // Simple hash for ETag (en producción usar una función hash real)
  const hash = Buffer.from(content).toString('base64');
  return `"${hash}"`;
}

// Route definitions (estos se registrarían en tu router principal)
export const roadmapRoutes = {
  'GET /api/roadmap': getRoadmap,
  'POST /api/roadmap/simulate': simulateRoadmapChanges
};