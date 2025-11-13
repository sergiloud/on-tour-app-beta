#!/usr/bin/env node

/**
 * Test script para diagnosticar el error 500 en /api/calendar-sync/enable
 * Simula la llamada que hace el frontend para ver el error completo
 */

const TEST_DATA = {
  calendarUrl: 'https://caldav.icloud.com/12345/calendars/home/',
  direction: 'both',
  credentials: {
    provider: 'iCloud',
    email: 'test@icloud.com',
    password: 'xxxx-xxxx-xxxx-xxxx', // App-specific password
    serverUrl: 'https://caldav.icloud.com'
  },
  userId: 'test-user-id-123'
};

async function testEnableEndpoint() {
  console.log('🧪 Testing /api/calendar-sync/enable endpoint...\n');
  
  try {
    const response = await fetch('https://on-tour-app-beta.vercel.app/api/calendar-sync/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_DATA)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\n📄 Raw response body:');
    console.log(text);
    
    try {
      const json = JSON.parse(text);
      console.log('\n📦 Parsed JSON:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\n⚠️  Response is not valid JSON');
    }

    if (!response.ok) {
      console.log('\n❌ Request failed with status:', response.status);
      process.exit(1);
    }

    console.log('\n✅ Request succeeded!');
    
  } catch (error) {
    console.error('\n💥 Request error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testEnableEndpoint();
