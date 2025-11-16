import React, { useState, useEffect } from 'react';

interface WebAuthnTestProps {
  onClose: () => void;
}

export function WebAuthnTest({ onClose }: WebAuthnTestProps) {
  const [support, setSupport] = useState({
    webauthn: false,
    platform: false,
    userAgent: ''
  });
  
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    checkWebAuthnSupport();
  }, []);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkWebAuthnSupport = async () => {
    addResult('🔍 Checking WebAuthn support...');
    
    const webauthnSupported = !!(navigator.credentials && window.PublicKeyCredential);
    
    let platformSupported = false;
    if (webauthnSupported) {
      try {
        platformSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch (err) {
        addResult(`⚠️ Error checking platform authenticator: ${err}`);
      }
    }

    setSupport({
      webauthn: webauthnSupported,
      platform: platformSupported,
      userAgent: navigator.userAgent
    });

    addResult(`✅ WebAuthn supported: ${webauthnSupported}`);
    addResult(`✅ Platform authenticator available: ${platformSupported}`);
  };

  const testRegistration = async () => {
    addResult('🔐 Testing credential registration...');
    
    if (!support.webauthn) {
      addResult('❌ WebAuthn not supported');
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "On Tour App Test",
          id: "localhost",
        },
        user: {
          id: new TextEncoder().encode("test-user"),
          name: "test@example.com",
          displayName: "Test User",
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
      };

      addResult('📱 Prompting for biometric authentication...');
      
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (credential) {
        addResult('🎉 Registration successful!');
        addResult(`📄 Credential ID: ${credential.id.substring(0, 20)}...`);
        addResult(`🔑 Type: ${credential.type}`);
        
        // Test authentication immediately
        await testAuthentication(credential.rawId);
      }
      
    } catch (err: any) {
      addResult(`❌ Registration failed: ${err.message || err}`);
      
      if (err.name === 'NotSupportedError') {
        addResult('💡 Try: Enable TouchID/FaceID in System Preferences');
      } else if (err.name === 'NotAllowedError') {
        addResult('💡 User cancelled or timeout occurred');
      }
    }
  };

  const testAuthentication = async (credentialId?: ArrayBuffer) => {
    addResult('🔓 Testing authentication...');
    
    if (!credentialId) {
      addResult('⚠️ No credential ID provided for authentication test');
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: credentialId,
          type: 'public-key',
        }],
        userVerification: "required",
        timeout: 60000,
      };

      addResult('🔐 Prompting for authentication...');
      
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (assertion) {
        addResult('🎉 Authentication successful!');
        addResult(`📄 Used credential: ${assertion.id.substring(0, 20)}...`);
      }
      
    } catch (err: any) {
      addResult(`❌ Authentication failed: ${err.message || err}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-ink-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">WebAuthn Test Console</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Support Status */}
          <div className="bg-gray-100 dark:bg-ink-700 p-4 rounded">
            <h3 className="font-medium mb-2">Browser Support</h3>
            <div className="space-y-1 text-sm">
              <div>WebAuthn: {support.webauthn ? '✅ Supported' : '❌ Not supported'}</div>
              <div>Platform Authenticator: {support.platform ? '✅ Available' : '❌ Not available'}</div>
              <div className="text-xs opacity-70">
                {support.userAgent.includes('Mac') && 'TouchID/FaceID should be available on Mac'}
                {support.userAgent.includes('iPhone') && 'FaceID/TouchID should be available on iOS'}
                {support.userAgent.includes('Android') && 'Fingerprint should be available on Android'}
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={testRegistration}
              disabled={!support.webauthn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Registration
            </button>
            
            <button 
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Log
            </button>
          </div>

          {/* Results Log */}
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="opacity-70">Test results will appear here...</div>
            ) : (
              testResults.map((result, i) => (
                <div key={i} className="mb-1">{result}</div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <strong>Testing Instructions:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Click "Test Registration" to create a WebAuthn credential</li>
              <li>Use TouchID, FaceID, or insert security key when prompted</li>
              <li>Authentication test runs automatically after registration</li>
              <li>Check console log for detailed results</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}