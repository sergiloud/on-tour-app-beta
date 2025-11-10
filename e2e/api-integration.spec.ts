/**
 * E2E Tests: API Integration
 * Pruebas de integración de la capa API
 */

import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';
let authToken: string;
let testUserId: string;
let testShowId: string;

test.describe('API Integration Tests', () => {
  test.beforeAll(async ({ browser }) => {
    // Note: In a real scenario, you'd set up auth properly
    // For now, this is a placeholder for the integration flow
  });

  test.describe('Authentication Flow', () => {
    test('should login successfully', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          username: 'testuser',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');

      authToken = data.token;
      testUserId = data.user.id;
    });

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          username: 'invalid',
          password: 'wrong'
        }
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should refresh token', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/refresh`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
    });
  });

  test.describe('Shows API', () => {
    test('should get shows list', async ({ request }) => {
      const response = await request.get(`${API_URL}/shows`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          page: 1,
          limit: 10
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('statusCode', 200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('should create new show', async ({ request }) => {
      const response = await request.post(`${API_URL}/shows`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          title: 'Test Show E2E',
          description: 'Test show for E2E testing',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'concert',
          location: 'Test Venue',
          capacity: 500,
          budget: 50000,
          currency: 'USD'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
      testShowId = data.data.id;
    });

    test('should get show details', async ({ request }) => {
      const response = await request.get(`${API_URL}/shows/${testShowId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe(testShowId);
      expect(data.data.title).toBe('Test Show E2E');
    });

    test('should update show', async ({ request }) => {
      const response = await request.patch(`${API_URL}/shows/${testShowId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          title: 'Updated Test Show',
          capacity: 600
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data.title).toBe('Updated Test Show');
      expect(data.data.capacity).toBe(600);
    });

    test('should get show statistics', async ({ request }) => {
      const response = await request.get(`${API_URL}/shows/${testShowId}/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('budget');
      expect(data.data).toHaveProperty('income');
      expect(data.data).toHaveProperty('expenses');
    });

    test('should search shows', async ({ request }) => {
      const response = await request.get(`${API_URL}/shows/search`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          query: 'Test',
          type: 'concert'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('should delete show', async ({ request }) => {
      const response = await request.delete(`${API_URL}/shows/${testShowId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);

      // Verify deletion
      const getResponse = await request.get(`${API_URL}/shows/${testShowId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('Finance API', () => {
    let financeShowId: string;

    test.beforeEach(async ({ request }) => {
      // Create a show for finance tests
      const response = await request.post(`${API_URL}/shows`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          title: 'Finance Test Show',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'concert',
          location: 'Test Venue',
          capacity: 500,
          budget: 50000,
          currency: 'USD'
        }
      });

      financeShowId = (await response.json()).data.id;
    });

    test('should create finance record', async ({ request }) => {
      const response = await request.post(`${API_URL}/finance/records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          showId: financeShowId,
          category: 'equipment',
          amount: 5000,
          currency: 'USD',
          type: 'expense',
          description: 'Audio equipment rental'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
    });

    test('should get finance records', async ({ request }) => {
      const response = await request.get(`${API_URL}/finance/records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          showId: financeShowId
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('should get finance report', async ({ request }) => {
      const response = await request.get(`${API_URL}/finance/reports/${financeShowId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('totalIncome');
      expect(data.data).toHaveProperty('totalExpenses');
    });
  });

  test.describe('Error Handling', () => {
    test('should return 401 for missing token', async ({ request }) => {
      const response = await request.get(`${API_URL}/shows`);
      expect(response.status()).toBe(401);
    });

    test('should return 400 for invalid request data', async ({ request }) => {
      const response = await request.post(`${API_URL}/shows`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          // Missing required fields
          title: 'Incomplete Show'
        }
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should return 404 for non-existent resource', async ({ request }) => {
      const response = await request.get(`${API_URL}/shows/non-existent-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status()).toBe(404);
    });
  });
});
