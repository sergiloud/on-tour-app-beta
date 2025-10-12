/**
 * Test script to verify agency loading
 * Run this in browser console after logging in as Danny Avila
 */

// Import functions
import { loadDemoAgencies, forceReplaceDemoAgencies, clearAgencies } from './lib/agencies';
import { loadSettings } from './lib/persist';

// Test 1: Check current agencies
// console.log('=== TEST 1: Current Settings ===');
const currentSettings = loadSettings();
// console.log('Current booking agencies:', currentSettings.bookingAgencies || []);
// console.log('Current management agencies:', currentSettings.managementAgencies || []);

// Test 2: Force load demo agencies
// console.log('\n=== TEST 2: Force Load Demo Agencies ===');
const result = forceReplaceDemoAgencies();
// console.log('Force replace result:', result);

// Test 3: Verify loaded agencies
// console.log('\n=== TEST 3: Verify Loaded Agencies ===');
const updatedSettings = loadSettings();
// console.log('Updated booking agencies:', updatedSettings.bookingAgencies || []);
// console.log('Updated management agencies:', updatedSettings.managementAgencies || []);

// Test 4: Check specific agencies
// console.log('\n=== TEST 4: Agency Details ===');
const booking = updatedSettings.bookingAgencies || [];
const management = updatedSettings.managementAgencies || [];

// console.log('\nUTA:');
const uta = booking.find(a => a.id === 'booking-uta-americas');
// console.log(uta);

// console.log('\nShushi 3000:');
const shushi = booking.find(a => a.id === 'booking-shushi3000');
// console.log(shushi);

// console.log('\nCreative Primates:');
const cp = management.find(a => a.id === 'management-creative-primates');
// console.log(cp);

export { loadDemoAgencies, forceReplaceDemoAgencies, clearAgencies };
