// ========================================
// Pawon Mamaraka - Home System
// File: js/home-system.js
// ========================================

import { auth, db, currentUser, isLoggedIn, serverTimestamp } from './core-system.js';
import { 
    getDocs, addDoc, updateDoc, deleteDoc, doc,
    collection, query, where, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Load Catalog for Homepage
async function loadKatalog() {
    try {
        const categoryFilter = document.getElementById('katalog-filter')?.value || 'all';
        
        let katalogQuery = query(
            collection(db, "catalog"), 
            where("isActive", "==", true),
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(katalogQuery);
        const katalogGrid = document.getElementById('katalog-grid');
        const emptyElement = document.getElementById('katalog-empty');
        
        katalogGrid.innerHTML = '';
        
        if (querySnapshot.empty) {
            katalogGrid.classList.add('hidden');
            emptyElement.classList.remove('hidden');
            return;
        }

        katalogGrid.classList.remove('hidden');
        emptyElement.classList.add('hidden');

        let hasItems = false;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Apply category filter
            if (categoryFilter !== 'all' && data.category !== categoryFilter) {
                return;
            }
            
            hasItems = true;
            const katalogElement = createKatalogElement(doc.id, data);
            katalogGrid.appendChild(katalogElement);
        });

        if (!hasItems) {
            katalogGrid.innerHTML = `
                <div class="col-span-full text-center py-12 text-neutral-400">
                    Tidak ada menu dalam kategori "${categoryFilter}"
                </div>
            `;
        }
        
        // Initialize katalog buttons
        initializeKatalogButtons();
        
    } catch (error) {
        console.error('Error loading katalog:', error);
    }
}

function createKatalogElement(id, data) {
    const element = document.createElement('article');
    element.className = 'bg-neutral-900/60 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-colors group';
    
    const categoryIcons = {
        'main-course': 'utensils',
        'dessert': 'cake',
        'snack': 'croissant',
        'beverage': 'coffee'
    };
    
    const categoryLabels = {
        'main-course': 'Main Course',
        'dessert': 'Dessert',
        'snack': 'Snack',
        'beverage': 'Beverage'
    };

    element.innerHTML = `
        <div class="relative">
            <img src="${data.imageUrl}" alt="${data.title}" 
                 class="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300">
            <div class="absolute top-3 right-3">
                <span class="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2 py-1 text-xs text-neutral-300 border border-white/20">
                    <i data-lucide="${categoryIcons[data.category] || 'package'}" class="h-3 w-3"></i>
                    ${categoryLabels[data.category] || data.category}
                </span>
            </div>
        </div>
        
        <h3 class="text-lg font-semibold mb-2">${data.title}</h3>
        <p class="text-sm text-neutral-400 mb-3 line-clamp-2">${data.description}</p>
        
        <div class="flex items-center justify-between">
            <span class="text-cyan-300 font-semibold">Rp ${data.price.toLocaleString('id-ID')}</span>
            <button data-katalog-id="${id}" 
                    class="katalog-request-btn inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium border border-white/10 bg-neutral-950 hover:bg-neutral-900 transition-colors">
                <i data-lucide="plus" class="h-4 w-4"></i>
                Request PO
            </button>
        </div>
        
        ${data.tags && data.tags.length > 0 ? `
            <div class="mt-3 flex flex-wrap gap-1">
                ${data.tags.slice(0, 3).map(tag => `
                    <span class="inline-block bg-neutral-800/50 text-neutral-300 text-xs px-2 py-1 rounded-full border border-neutral-700">
                        ${tag}
                    </span>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    return element;
}

function initializeKatalogButtons() {
    document.querySelectorAll('.katalog-request-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const catalogId = this.getAttribute('data-katalog-id');
            showRequestPOModal(catalogId);
        });
    });
}

function showRequestPOModal(catalogId) {
    if (!isLoggedIn) {
        alert('Silakan login terlebih dahulu untuk request pre-order');
        return;
    }
    
    // Get catalog data and show modal
    // Implementation similar to pre-order modal but for requests
    console.log('Request PO for catalog:', catalogId);
    // You'll need to implement this modal similar to the pre-order modal
}

// Initialize home system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadKatalog();
        
        // Initialize katalog filter
        const katalogFilter = document.getElementById('katalog-filter');
        if (katalogFilter) {
            katalogFilter.addEventListener('change', loadKatalog);
        }
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});