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
                showSuggestions(ingredients, ingredientInput, (ingredient) => {
                    ingredientInput.value = ingredient.name;
                    ingredientInput.dataset.ingredientId = ingredient.id;
                });
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
        showToast('Failed to load pantry. Please make sure the API server is running.', 'error');
    }
}

/**
 * Initialize pantry page
 */
async function initializePantryPage() {
    if (!await requireAuth()) {
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