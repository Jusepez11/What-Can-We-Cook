/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', or 'info')
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-message">
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show a modal dialog
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message
 * @param {string} options.type - Modal type (confirm, edit, delete)
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.cancelText - Cancel button text
 * @param {Function} options.onConfirm - Callback on confirm
 * @param {Function} options.onCancel - Callback on cancel
 * @param {Array} options.fields - Form fields for edit modals
 */
function showModal(options) {
    const {
        title = 'Confirm',
        message = '',
        type = 'confirm',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm = () => {},
        onCancel = () => {},
        fields = []
    } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const isDangerous = type === 'delete';
    const buttonClass = isDangerous ? 'btn-danger' : 'btn-primary';

    let formFields = '';
    if (fields.length > 0) {
        formFields = `
            <div class="modal-form">
                ${fields.map(field => `
                    <div class="form-group">
                        <label for="modal-${field.name}">${field.label}</label>
                        <input 
                            type="${field.type || 'text'}" 
                            id="modal-${field.name}" 
                            name="${field.name}"
                            value="${field.value || ''}"
                            placeholder="${field.placeholder || ''}"
                        />
                    </div>
                `).join('')}
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
            ${message ? `<p>${message}</p>` : ''}
            ${formFields}
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
            <button class="btn ${buttonClass}" id="modal-confirm">${confirmText}</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus first input if exists
    if (fields.length > 0) {
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Handle confirm
    const confirmBtn = modal.querySelector('#modal-confirm');
    confirmBtn.addEventListener('click', () => {
        let formData = {};
        if (fields.length > 0) {
            fields.forEach(field => {
                const input = modal.querySelector(`#modal-${field.name}`);
                if (input) {
                    formData[field.name] = input.value;
                }
            });
        }
        overlay.remove();
        onConfirm(formData);
    });

    // Handle cancel
    const cancelBtn = modal.querySelector('#modal-cancel');
    cancelBtn.addEventListener('click', () => {
        overlay.remove();
        onCancel();
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            onCancel();
        }
    });
}

/**
 * Show autocomplete suggestions dropdown
 * @param {Array} items - Array of items to show (must have 'id' and 'name' properties)
 * @param {HTMLElement} input - Input element to attach dropdown to
 * @param {Function} onSelect - Callback when item is selected
 */
function showSuggestions(items, input, onSelect) {
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.ingredient-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    if (!items || items.length === 0) {
        return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'ingredient-dropdown';

    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = item.name;
        itemDiv.className = 'ingredient-dropdown-item';

        itemDiv.addEventListener('click', () => {
            onSelect(item);
            dropdown.remove();
        });

        dropdown.appendChild(itemDiv);
    });

    // Position dropdown below input
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';

    document.body.appendChild(dropdown);

    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== input) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 10);
}

/**
 * Search for ingredients
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of ingredient objects
 */
async function searchIngredients(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/ingredient/search/?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search ingredients');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching ingredients:', error);
        return [];
    }
}

/**
 * Create a new ingredient
 * @param {string} name - Ingredient name
 * @returns {Promise<Object>} - Created ingredient object
 */
async function createIngredient(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/ingredient/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({name: name.trim()})
        });

        if (!response.ok) {
            throw new Error('Failed to create ingredient');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating ingredient:', error);
        throw error;
    }
}

/**
 * Search for categories
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of category objects
 */
async function searchCategories(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const categories = await response.json();

        // Filter categories by query
        const lowerQuery = query.toLowerCase();
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
        console.error('Error searching categories:', error);
        return [];
    }
}

/**
 * Create a new category
 * @param {string} name - Category name
 * @returns {Promise<Object>} - Created category object
 */
async function createCategory(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: name.trim() })
        });

        if (!response.ok) {
            throw new Error('Failed to create category');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}

/**
 * Search for recipes by title
 * @param {string} query - Search query
 * @param {number} threshold - Fuzzy match threshold (0-100)
 * @returns {Promise<Array>} - Array of recipe objects
 */
async function searchRecipes(query, threshold = 60) {
    if (!query || query.trim() === '') {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/recipes/search/?query=${encodeURIComponent(query)}&threshold=${threshold}`);
        if (!response.ok) {
            throw new Error('Failed to search recipes');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching recipes:', error);
        return [];
    }
}

