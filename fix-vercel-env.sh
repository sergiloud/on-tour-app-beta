#!/bin/bash

echo "Arreglando variables de entorno (sin saltos de línea)..."

vercel env rm VITE_FIREBASE_API_KEY production -y
vercel env rm VITE_FIREBASE_AUTH_DOMAIN production -y
vercel env rm VITE_FIREBASE_PROJECT_ID production -y
vercel env rm VITE_FIREBASE_STORAGE_BUCKET production -y
vercel env rm VITE_FIREBASE_MESSAGING_SENDER_ID production -y
vercel env rm VITE_FIREBASE_APP_ID production -y

printf "AIzaSyB1EUWnWA0VhZmhLhXLdW4zRaNMJV9c6mQ" | vercel env add VITE_FIREBASE_API_KEY production
printf "on-tour-app-beta.firebaseapp.com" | vercel env add VITE_FIREBASE_AUTH_DOMAIN production
printf "on-tour-app-beta" | vercel env add VITE_FIREBASE_PROJECT_ID production
printf "on-tour-app-beta.firebasestorage.app" | vercel env add VITE_FIREBASE_STORAGE_BUCKET production
printf "422978005693" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
printf "1:422978005693:web:cfb1c3f43c29ca0ee9a7bc" | vercel env add VITE_FIREBASE_APP_ID production

echo ""
echo "✅ Variables actualizadas sin saltos de línea"
