#!/bin/bash

echo "Actualizando variables de entorno en Vercel..."

vercel env rm VITE_FIREBASE_API_KEY production -y
vercel env rm VITE_FIREBASE_AUTH_DOMAIN production -y
vercel env rm VITE_FIREBASE_PROJECT_ID production -y
vercel env rm VITE_FIREBASE_STORAGE_BUCKET production -y
vercel env rm VITE_FIREBASE_MESSAGING_SENDER_ID production -y
vercel env rm VITE_FIREBASE_APP_ID production -y

echo "AIzaSyB1EUWnWA0VhZmhLhXLdW4zRaNMJV9c6mQ" | vercel env add VITE_FIREBASE_API_KEY production
echo "on-tour-app-beta.firebaseapp.com" | vercel env add VITE_FIREBASE_AUTH_DOMAIN production
echo "on-tour-app-beta" | vercel env add VITE_FIREBASE_PROJECT_ID production
echo "on-tour-app-beta.firebasestorage.app" | vercel env add VITE_FIREBASE_STORAGE_BUCKET production
echo "422978005693" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
echo "1:422978005693:web:cfb1c3f43c29ca0ee9a7bc" | vercel env add VITE_FIREBASE_APP_ID production

echo "✅ Variables actualizadas. Ahora ejecuta: vercel --prod"
