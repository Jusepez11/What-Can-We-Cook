/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 * @param {number} duration - Duration in ms (default 3000)
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
        onConfirm = () => {
        },
        onCancel = () => {
        },
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
                formData[field.name] = input.value;
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

    // Handle Enter key in form
    if (fields.length > 0) {
        modal.querySelectorAll('input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });
        });
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            onCancel();
        }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            onCancel();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Fetch all ingredients for search/autocomplete
 * @returns {Promise<Array>} - Array of ingredient objects
 */
async function fetchAllIngredients() {
    try {
        const response = await fetch(`${API_BASE_URL}/ingredient/`);
        if (!response.ok) {
            throw new Error('Failed to fetch ingredients');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return [];
    }
}

/**
 * Search ingredients by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of matching ingredient objects
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
 * Fetch current user's pantry ingredients
 * @returns {Promise<Array>} - Array of pantry ingredient objects
 */
async function fetchMyPantry() {
    try {
        const response = await fetch(`${API_BASE_URL}/pantryingredient/pantry`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            throw new Error('Failed to fetch pantry');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching pantry:', error);
        throw error;
    }
}

/**
 * Add ingredient to pantry
 * @param {number} ingredientId - Ingredient ID
 * @param {string} quantity - Quantity amount
 * @param {string} unit - Unit of measurement
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Created pantry ingredient object
 */
async function addToPantry(ingredientId, quantity, unit, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/pantryingredient/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_id: userId,
                ingredient_id: ingredientId,
                quantity: quantity,
                unit: unit
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to add to pantry');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding to pantry:', error);
        throw error;
    }
}

/**
 * Update pantry ingredient
 * @param {number} pantryId - Pantry ingredient ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} - Updated pantry ingredient object
 */
async function updatePantryIngredient(pantryId, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/pantryingredient/${pantryId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error('Failed to update pantry item');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating pantry item:', error);
        throw error;
    }
}

/**
 * Delete pantry ingredient
 * @param {number} pantryId - Pantry ingredient ID
 * @returns {Promise<void>}
 */
async function deletePantryIngredient(pantryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/pantryingredient/${pantryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to delete pantry item');
        }
    } catch (error) {
        console.error('Error deleting pantry item:', error);
        throw error;
    }
}

/**
 * Render pantry table
 * @param {Array} pantryItems - Array of pantry ingredient objects
 */
function renderPantryTable(pantryItems) {
    const tableBody = document.getElementById('pantryTableBody');
    const emptyState = document.getElementById('emptyPantryState');
    const pantryTable = document.getElementById('pantryTable');

    if (!pantryItems || pantryItems.length === 0) {
        if (pantryTable) pantryTable.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (pantryTable) pantryTable.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';

    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Sort by ingredient name
    const sortedItems = [...pantryItems].sort((a, b) => {
        const nameA = a.ingredient_name || '';
        const nameB = b.ingredient_name || '';
        return nameA.localeCompare(nameB);
    });

    sortedItems.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.pantryId = item.id;

        row.innerHTML = `
            <td>${item.ingredient_name || 'Unknown'}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>
                <button class="btn-small" onclick="editPantryItem(${item.id})">Edit</button>
                <button class="btn-small btn-danger" onclick="deletePantryItem(${item.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Filter pantry table by search query
 * @param {string} query - Search query
 */
function filterPantryTable(query) {
    const tableBody = document.getElementById('pantryTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    const lowerQuery = query.toLowerCase().trim();

    rows.forEach(row => {
        const ingredientName = row.querySelector('td:first-child').textContent.toLowerCase();
        if (ingredientName.includes(lowerQuery) || lowerQuery === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Show ingredient suggestions dropdown
 * @param {Array} ingredients - Array of ingredient objects
 * @param {HTMLElement} input - Input element to attach dropdown to
 */
function showIngredientSuggestions(ingredients, input) {
    // Remove existing dropdown
    const existingDropdown = document.getElementById('ingredientSuggestions');
    if (existingDropdown) {
        existingDropdown.remove();
    }

    if (!ingredients || ingredients.length === 0) {
        return;
    }

    const dropdown = document.createElement('div');
    dropdown.id = 'ingredientSuggestions';
    dropdown.className = 'ingredient-dropdown';

    ingredients.forEach(ingredient => {
        const item = document.createElement('div');
        item.textContent = ingredient.name;
        item.className = 'ingredient-dropdown-item';

        item.addEventListener('click', () => {
            input.value = ingredient.name;
            input.dataset.ingredientId = ingredient.id;
            dropdown.remove();
        });

        dropdown.appendChild(item);
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
 * Initialize add ingredient form
 */
function initializeAddIngredientForm() {
    const ingredientInput = document.getElementById('ingredientNameInput');
    const quantityInput = document.getElementById('quantityInput');
    const unitInput = document.getElementById('unitInput');
    const addButton = document.getElementById('addIngredientBtn');

    if (!ingredientInput || !addButton) return;

    let searchTimeout;

    // Autocomplete on ingredient input
    ingredientInput.addEventListener('input', (e) => {
        const query = e.target.value;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (query.length >= 2) {
                const ingredients = await searchIngredients(query);
                showIngredientSuggestions(ingredients, ingredientInput);
            }
        }, 300);
    });

    // Handle add button click
    addButton.addEventListener('click', async () => {
        await handleAddIngredient(ingredientInput, quantityInput, unitInput);
    });

    // Handle Enter key
    [ingredientInput, quantityInput, unitInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    await handleAddIngredient(ingredientInput, quantityInput, unitInput);
                }
            });
        }
    });
}

/**
 * Handle adding ingredient to pantry
 * @param {HTMLElement} ingredientInput - Ingredient name input
 * @param {HTMLElement} quantityInput - Quantity input
 * @param {HTMLElement} unitInput - Unit input
 */
async function handleAddIngredient(ingredientInput, quantityInput, unitInput) {
    const ingredientName = ingredientInput.value.trim();
    const quantity = quantityInput.value.trim();
    const unit = unitInput.value.trim();

    if (!ingredientName || !quantity || !unit) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        let ingredientId = ingredientInput.dataset.ingredientId;

        // If no ingredient ID is set, search or create
        if (!ingredientId) {
            const searchResults = await searchIngredients(ingredientName);

            if (searchResults.length > 0) {
                // Use exact match if available
                const exactMatch = searchResults.find(
                    ing => ing.name.toLowerCase() === ingredientName.toLowerCase()
                );

                if (exactMatch) {
                    ingredientId = exactMatch.id;
                } else {
                    // Ask user if they want to use a suggested ingredient or create new
                    ingredientId = await new Promise((resolve) => {
                        showModal({
                            title: 'Ingredient Not Found',
                            message: `"${ingredientName}" not found. Did you mean "${searchResults[0].name}"?`,
                            type: 'confirm',
                            confirmText: `Use "${searchResults[0].name}"`,
                            cancelText: 'Create New',
                            onConfirm: () => {
                                resolve(searchResults[0].id);
                            },
                            onCancel: async () => {
                                const newIngredient = await createIngredient(ingredientName);
                                showToast(`Created new ingredient: ${ingredientName}`, 'success');
                                resolve(newIngredient.id);
                            }
                        });
                    });
                }
            } else {
                // Create new ingredient
                const newIngredient = await createIngredient(ingredientName);
                ingredientId = newIngredient.id;
                showToast(`Created new ingredient: ${ingredientName}`, 'success');
            }
        }

        // Get user ID
        const userId = await getCurrentUserId();

        // Add to pantry
        await addToPantry(ingredientId, quantity, unit, userId);

        // Clear form
        ingredientInput.value = '';
        quantityInput.value = '';
        unitInput.value = '';
        delete ingredientInput.dataset.ingredientId;

        // Reload pantry
        await loadPantry();

        showToast('Ingredient added successfully!', 'success');
    } catch (error) {
        console.error('Error adding ingredient:', error);
        showToast('Failed to add ingredient: ' + error.message, 'error');
    }
}

/**
 * Edit pantry item
 * @param {number} pantryId - Pantry ingredient ID
 */
async function editPantryItem(pantryId) {
    const row = document.querySelector(`tr[data-pantry-id="${pantryId}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('td');
    const ingredientName = cells[0].textContent;
    const currentQuantity = cells[1].textContent;
    const currentUnit = cells[2].textContent;

    showModal({
        title: `Edit ${ingredientName}`,
        type: 'edit',
        confirmText: 'Save',
        cancelText: 'Cancel',
        fields: [
            {
                name: 'quantity',
                label: 'Quantity',
                type: 'text',
                value: currentQuantity,
                placeholder: 'e.g., 2'
            },
            {
                name: 'unit',
                label: 'Unit',
                type: 'text',
                value: currentUnit,
                placeholder: 'e.g., cups'
            }
        ],
        onConfirm: async (formData) => {
            if (!formData.quantity || !formData.unit) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            try {
                await updatePantryIngredient(pantryId, {
                    quantity: formData.quantity.trim(),
                    unit: formData.unit.trim()
                });

                await loadPantry();
                showToast('Pantry item updated successfully!', 'success');
            } catch (error) {
                showToast('Failed to update pantry item: ' + error.message, 'error');
            }
        }
    });
}

/**
 * Delete pantry item
 * @param {number} pantryId - Pantry ingredient ID
 */
async function deletePantryItem(pantryId) {
    const row = document.querySelector(`tr[data-pantry-id="${pantryId}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('td');
    const ingredientName = cells[0].textContent;

    showModal({
        title: 'Delete Item',
        message: `Are you sure you want to delete "${ingredientName}" from your pantry? This action cannot be undone.`,
        type: 'delete',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: async () => {
            try {
                await deletePantryIngredient(pantryId);
                await loadPantry();
                showToast('Pantry item deleted successfully!', 'success');
            } catch (error) {
                showToast('Failed to delete pantry item: ' + error.message, 'error');
            }
        }
    });
}

/**
 * Load and display pantry
 */
async function loadPantry() {
    try {
        const pantryItems = await fetchMyPantry();
        renderPantryTable(pantryItems);
    } catch (error) {
        console.error('Error loading pantry:', error);
        if (error.message === 'Unauthorized') {
            showModal({
                title: 'Authentication Required',
                message: 'Please log in to view your pantry.',
                type: 'info',
                confirmText: 'Go to Login',
                onConfirm: () => {
                    window.location.href = 'Login.html';
                }
            });
        } else {
            showToast('Failed to load pantry. Please make sure the API server is running.', 'error');
        }
    }
}

/**
 * Initialize pantry page
 */
function initializePantryPage() {
    if (!requireAuth()) {
        return;
    }

    // Initialize search
    const searchInput = document.getElementById('pantrySearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterPantryTable(e.target.value);
        });
    }

    // Initialize add ingredient form
    initializeAddIngredientForm();

    // Load pantry
    loadPantry();
}

// Make functions globally available
window.editPantryItem = editPantryItem;
window.deletePantryItem = deletePantryItem;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializePantryPage);