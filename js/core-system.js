// ========================================
// Pawon Mamaraka - Core System
// File: js/core-system.js
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, where, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRrKuCao6L7Rmm_VfLmdkgIgBM8sdhP4g",
    authDomain: "pawonmamaraka-117a8.firebaseapp.com",
    projectId: "pawonmamaraka-117a8",
    storageBucket: "pawonmamaraka-117a8.firebasestorage.app",
    messagingSenderId: "603376116648",
    appId: "1:603376116648:web:5b1507151f1b06bd09f39d",
    measurementId: "G-T7RFLVP6WF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Global variables
let currentUser = null;
let isLoggedIn = false;

// Admin emails
const ADMIN_EMAILS = ['pandeecp6@gmail.com', 'desidesi4321@gmail.com'];

// Check if user is admin
function isAdmin(user) {
    return user && ADMIN_EMAILS.includes(user.email);
}

// Auth state management
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    isLoggedIn = !!user;
    
    if (user) {
        console.log('User logged in:', user.email, isAdmin(user) ? '(Admin)' : '(User)');
        updateUserNavigation(user);
    } else {
        console.log('User logged out');
        updateUserNavigation(null);
    }
});

// Update navigation based on user role
function updateUserNavigation(user) {
    // Implementation for dynamic navigation updates
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Remove existing dynamic links
    ['admin-link', 'user-orders-link'].forEach(id => {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
    });

    if (user) {
        // Add user orders link
        const userLink = document.createElement('a');
        userLink.id = 'user-orders-link';
        userLink.href = 'user.html';
        userLink.className = 'text-neutral-300 hover:text-white transition-colors';
        userLink.innerHTML = '<i data-lucide="shopping-bag" class="h-4 w-4 mr-1"></i>Pesanan Saya';
        nav.appendChild(userLink);

        // Add admin link if admin
        if (isAdmin(user)) {
            const adminLink = document.createElement('a');
            adminLink.id = 'admin-link';
            adminLink.href = 'admin.html';
            adminLink.className = 'text-neutral-300 hover:text-white transition-colors';
            adminLink.innerHTML = '<i data-lucide="settings" class="h-4 w-4 mr-1"></i>Admin';
            nav.appendChild(adminLink);
        }
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Export for use in other files
export { 
    app, auth, db, provider, 
    currentUser, isLoggedIn, isAdmin,
    serverTimestamp 
};