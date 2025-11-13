#!/usr/bin/env node

const TEST_DATA = {
  provider: 'iCloud',
  email: 'test@icloud.com',
  password: 'xxxx-xxxx-xxxx-xxxx',
  serverUrl: 'https://caldav.icloud.com'
};

async function testConnectEndpoint() {
  console.log('🧪 Testing /api/calendar-sync/connect endpoint...\n');
  
  try {
    const response = await fetch('https://on-tour-app-beta.vercel.app/api/calendar-sync/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_DATA)
    });

    console.log('📊 Status:', response.status);
    const json = await response.json();
    console.log('📦 Response:', JSON.stringify(json, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testConnectEndpoint();
