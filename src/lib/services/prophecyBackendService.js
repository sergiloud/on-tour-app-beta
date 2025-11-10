// Service to handle Prophecy backend integration
export class ProphecyBackendService {
    /**
     * Seeds Prophecy shows data in the backend for the specified organization
     */
    static async seedProphecyData(organizationId) {
        try {
            const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/seed-prophecy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to seed Prophecy data: ${response.status}`);
            }
            const result = await response.json();
            return {
                success: result.success,
                seededCount: result.seededCount || 0
            };
        }
        catch (error) {
            console.error('Failed to seed Prophecy data:', error);
            return { success: false, seededCount: 0 };
        }
    }
    /**
     * Checks if Prophecy data is already seeded for the organization
     */
    static async checkProphecyStatus(organizationId) {
        try {
            const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/prophecy-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to check Prophecy status: ${response.status}`);
            }
            const result = await response.json();
            return result.isProphecySeeded;
        }
        catch (error) {
            console.error('Failed to check Prophecy status:', error);
            return false;
        }
    }
    /**
     * Fetches shows from the backend for the specified organization
     */
    static async getShows(organizationId) {
        try {
            const response = await fetch(`${this.baseUrl}/shows?organizationId=${organizationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch shows: ${response.status}`);
            }
            const result = await response.json();
            return result.data || [];
        }
        catch (error) {
            console.error('Failed to fetch shows:', error);
            return [];
        }
    }
    /**
     * Gets auth token from localStorage or returns dummy token for demo
     */
    static getAuthToken() {
        // For demo purposes, return a dummy token
        // In production, this would get the real JWT token
        return 'demo-token-prophecy-user';
    }
    /**
     * Initializes Prophecy data when user logs in
     */
    static async initializeProphecyUser(organizationId) {
        try {
            console.log('🔄 Initializing Prophecy backend data...');
            // Check if already seeded
            const isSeeded = await this.checkProphecyStatus(organizationId);
            if (isSeeded) {
                console.log('✅ Prophecy data already exists in backend');
                return;
            }
            // Seed the data
            const result = await this.seedProphecyData(organizationId);
            if (result.success) {
                console.log(`✅ Successfully seeded ${result.seededCount} Prophecy shows`);
            }
            else {
                console.warn('⚠️ Failed to seed Prophecy data');
            }
        }
        catch (error) {
            console.error('❌ Error initializing Prophecy backend:', error);
        }
    }
}
ProphecyBackendService.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
