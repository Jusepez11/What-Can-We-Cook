const API_BASE_URL = 'http://localhost:8000';

/**
 * Load all categories from the API
 */
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`);

        if (!response.ok) {
            throw new Error(`Failed to load categories: ${response.statusText}`);
        }

        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Failed to load categories. Please make sure the API server is running.', 'error');
    }
}

/**
 * Display categories on the Browse page
 * @param {Array} categories - Array of category objects
 */
function displayCategories(categories) {
    const container = document.querySelector('.grid.auto');
    if (!container) {
        console.error('Categories container not found');
        return;
    }

    // Clear existing placeholder cards
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>No categories available</h3>
                <p class="muted">Categories will appear here once they are added.</p>
            </div>
        `;
        return;
    }

    // Display each category as a card
    categories.forEach(category => {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = `Recipes.html?category=${category.id}`;

        card.innerHTML = `
            <h3>${category.name}</h3>
            <p>${category.description || ''}</p>
        `;

        container.appendChild(card);
    });
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Load categories when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCategories);
} else {
    loadCategories();
}

