import { describe, it, expect, beforeEach } from 'vitest';
import { loginProphecy, PROPHECY_USER, ensureDemoAuth, getCurrentUserId, getUserProfile } from '../lib/demoAuth';
import { secureStorage } from '../lib/secureStorage';

describe('Prophecy Authentication', () => {
  beforeEach(() => {
    // Clear storage before each test
    secureStorage.clear();
    ensureDemoAuth();
  });

  it('should authenticate Prophecy user with correct credentials', () => {
    const result = loginProphecy('booking@prophecyofficial.com', 'Casillas123');
    
    expect(result).toBe(true);
    expect(getCurrentUserId()).toBe(PROPHECY_USER);
  });

  it('should reject Prophecy user with incorrect credentials', () => {
    const result1 = loginProphecy('booking@prophecyofficial.com', 'wrongpassword');
    const result2 = loginProphecy('wrong@email.com', 'Casillas123');
    
    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });

  it('should create Prophecy user profile correctly', () => {
    loginProphecy('booking@prophecyofficial.com', 'Casillas123');
    
    const profile = getUserProfile(PROPHECY_USER);
    expect(profile).toBeDefined();
    expect(profile?.email).toBe('booking@prophecyofficial.com');
    expect(profile?.name).toBe('Prophecy Booking');
  });
});