const state = {
    selectedCategories: new Map(), // categoryId -> categoryName
    selectedIngredients: new Map() // ingredientId -> ingredientName
};

/**
 * Add a category to the selected list
 * @param {number} id - Category ID
 * @param {string} name - Category name
 */
function addSelectedCategory(id, name) {
    if (state.selectedCategories.has(id)) {
        showToast('Category already added', 'error');
        return;
    }

    state.selectedCategories.set(id, name);
    updateSelectedCategoriesDisplay();
}

/**
 * Remove a category from the selected list
 * @param {number} id - Category ID
 */
function removeSelectedCategory(id) {
    state.selectedCategories.delete(id);
    updateSelectedCategoriesDisplay();
}

/**
 * Update the visual display of selected categories
 */
function updateSelectedCategoriesDisplay() {
    const container = document.getElementById('selected-categories');
    container.innerHTML = '';

    state.selectedCategories.forEach((name, id) => {
        const tag = document.createElement('div');
        tag.className = 'selected-item';
        tag.innerHTML = `
            <span>${name}</span>
            <button class="remove-item" data-id="${id}">×</button>
        `;

        tag.querySelector('.remove-item').addEventListener('click', () => {
            removeSelectedCategory(id);
        });

        container.appendChild(tag);
    });
}

/**
 * Add an ingredient to the selected list
 * @param {number} id - Ingredient ID
 * @param {string} name - Ingredient name
 */
function addSelectedIngredient(id, name) {
    if (state.selectedIngredients.has(id)) {
        showToast('Ingredient already added', 'error');
        return;
    }

    state.selectedIngredients.set(id, name);
    updateSelectedIngredientsDisplay();
}

/**
 * Remove an ingredient from the selected list
 * @param {number} id - Ingredient ID
 */
function removeSelectedIngredient(id) {
    state.selectedIngredients.delete(id);
    updateSelectedIngredientsDisplay();
}

/**
 * Update the visual display of selected ingredients
 */
function updateSelectedIngredientsDisplay() {
    const container = document.getElementById('selected-ingredients');
    container.innerHTML = '';

    state.selectedIngredients.forEach((name, id) => {
        const tag = document.createElement('div');
        tag.className = 'selected-item';
        tag.innerHTML = `
            <span>${name}</span>
            <button class="remove-item" data-id="${id}">×</button>
        `;

        tag.querySelector('.remove-item').addEventListener('click', () => {
            removeSelectedIngredient(id);
        });

        container.appendChild(tag);
    });
}

/**
 * Handle category input with autocomplete
 */
function initializeCategoryInput() {
    const input = document.getElementById('category-input');
    if (!input) return;

    let searchTimeout;

    input.addEventListener('input', (e) => {
        const query = e.target.value;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (query.length >= 2) {
                const categories = await searchCategories(query);
                showSuggestions(categories, input, async (category) => {
                    addSelectedCategory(category.id, category.name);
                    input.value = '';
                });
            }
        }, 300);
    });

    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const categoryName = input.value.trim();

            if (!categoryName) return;

            // Search for exact match
            const searchResults = await searchCategories(categoryName);
            const exactMatch = searchResults.find(
                cat => cat.name.toLowerCase() === categoryName.toLowerCase()
            );

            if (exactMatch) {
                addSelectedCategory(exactMatch.id, exactMatch.name);
                input.value = '';
            } else if (searchResults.length > 0) {
                // Ask user if they want to use suggested category or create new
                await new Promise((resolve) => {
                    showModal({
                        title: 'Category Not Found',
                        message: `"${categoryName}" not found. Did you mean "${searchResults[0].name}"?`,
                        type: 'confirm',
                        confirmText: `Use "${searchResults[0].name}"`,
                        cancelText: 'Create New',
                        onConfirm: () => {
                            addSelectedCategory(searchResults[0].id, searchResults[0].name);
                            input.value = '';
                            resolve();
                        },
                        onCancel: async () => {
                            try {
                                const newCategory = await createCategory(categoryName);
                                addSelectedCategory(newCategory.id, newCategory.name);
                                showToast(`Created new category: ${categoryName}`, 'success');
                                input.value = '';
                                resolve();
                            } catch (error) {
                                showToast('Failed to create category', 'error');
                                resolve();
                            }
                        }
                    });
                });
            } else {
                // Create new category
                try {
                    const newCategory = await createCategory(categoryName);
                    addSelectedCategory(newCategory.id, newCategory.name);
                    showToast(`Created new category: ${categoryName}`, 'success');
                    input.value = '';
                } catch (error) {
                    showToast('Failed to create category', 'error');
                }
            }
        }
    });
}

/**
 * Handle ingredient input with autocomplete
 */
function initializeIngredientInput() {
    const input = document.getElementById('ingredient-input');
    if (!input) return;

    let searchTimeout;

    input.addEventListener('input', (e) => {
        const query = e.target.value;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (query.length >= 2) {
                const ingredients = await searchIngredients(query);
                showSuggestions(ingredients, input, async (ingredient) => {
                    addSelectedIngredient(ingredient.id, ingredient.name);
                    input.value = '';
                });
            }
        }, 300);
    });

    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const ingredientName = input.value.trim();

            if (!ingredientName) return;

            // Search for exact match
            const searchResults = await searchIngredients(ingredientName);
            const exactMatch = searchResults.find(
                ing => ing.name.toLowerCase() === ingredientName.toLowerCase()
            );

            if (exactMatch) {
                addSelectedIngredient(exactMatch.id, exactMatch.name);
                input.value = '';
            } else if (searchResults.length > 0) {
                // Ask user if they want to use suggested ingredient or create new
                await new Promise((resolve) => {
                    showModal({
                        title: 'Ingredient Not Found',
                        message: `"${ingredientName}" not found. Did you mean "${searchResults[0].name}"?`,
                        type: 'confirm',
                        confirmText: `Use "${searchResults[0].name}"`,
                        cancelText: 'Create New',
                        onConfirm: () => {
                            addSelectedIngredient(searchResults[0].id, searchResults[0].name);
                            input.value = '';
                            resolve();
                        },
                        onCancel: async () => {
                            try {
                                const newIngredient = await createIngredient(ingredientName);
                                addSelectedIngredient(newIngredient.id, newIngredient.name);
                                showToast(`Created new ingredient: ${ingredientName}`, 'success');
                                input.value = '';
                                resolve();
                            } catch (error) {
                                showToast('Failed to create ingredient', 'error');
                                resolve();
                            }
                        }
                    });
                });
            } else {
                // Create new ingredient
                try {
                    const newIngredient = await createIngredient(ingredientName);
                    addSelectedIngredient(newIngredient.id, newIngredient.name);
                    showToast(`Created new ingredient: ${ingredientName}`, 'success');
                    input.value = '';
                } catch (error) {
                    showToast('Failed to create ingredient', 'error');
                }
            }
        }
    });
}

/**
 * Handle recipe submission
 */
async function handleSubmitRecipe() {
    const title = document.getElementById('recipe-title').value.trim();
    const description = document.getElementById('recipe-description').value.trim();
    const instructions = document.getElementById('recipe-instructions').value.trim();
    const servings = parseInt(document.getElementById('recipe-servings').value, 10);
    const imageUrl = document.getElementById('recipe-image-url').value.trim();
    const videoUrl = document.getElementById('recipe-video-url').value.trim();

    // Validation
    if (!title) {
        showToast('Please enter a recipe title', 'error');
        return;
    }

    if (!description) {
        showToast('Please enter a description', 'error');
        return;
    }

    if (!instructions) {
        showToast('Please enter instructions', 'error');
        return;
    }

    if (!imageUrl) {
        showToast('Please provide an image URL', 'error');
        return;
    }

    if (state.selectedIngredients.size === 0) {
        showToast('Please add at least one ingredient', 'error');
        return;
    }

    // Check for duplicate recipe title
    try {
        const existingRecipes = await searchRecipes(title, 90); // High threshold for close matches
        const exactMatch = existingRecipes.find(
            recipe => recipe.title.toLowerCase() === title.toLowerCase()
        );

        if (exactMatch) {
            showToast('A recipe with this title already exists. Please choose a different title.', 'error');
            return;
        }

        // If similar recipes found (but not exact match), warn the user
        if (existingRecipes.length > 0) {
            const shouldContinue = await new Promise((resolve) => {
                showModal({
                    title: 'Similar Recipe Found',
                    message: `A similar recipe "${existingRecipes[0].title}" already exists. Are you sure you want to create this recipe?`,
                    type: 'confirm',
                    confirmText: 'Create Anyway',
                    cancelText: 'Cancel',
                    onConfirm: () => {
                        resolve(true);
                    },
                    onCancel: () => {
                        resolve(false);
                    }
                });
            });

            if (!shouldContinue) {
                return;
            }
        }
    } catch (error) {
        console.error('Error checking for duplicate recipes:', error);
        // Continue with submission even if check fails
    }

    // Build category_id_list and ingredient_id_list
    const categoryIdList = Array.from(state.selectedCategories.keys()).join(',');
    const ingredientIdList = Array.from(state.selectedIngredients.keys()).join(',');

    const payload = {
        title,
        description,
        instructions,
        servings,
        ingredient_id_list: ingredientIdList,
        category_id_list: categoryIdList || null,
        image_url: imageUrl,
        video_embed_url: videoUrl || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/recipes/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMessage = 'Failed to submit recipe.';
            try {
                const err = await response.json();
                if (err?.detail) {
                    errorMessage = Array.isArray(err.detail)
                        ? err.detail.map((d) => d.msg || d).join(', ')
                        : err.detail;
                }
            } catch (_) {
                // Ignore parse errors
            }

            showToast(errorMessage, 'error');
            return;
        }

        const savedRecipe = await response.json();
        showToast('Recipe submitted successfully!', 'success');

        // Redirect to recipe detail page
        setTimeout(() => {
            window.location.href = `RecipeDetail.html?id=${savedRecipe.id}`;
        }, 1000);

    } catch (error) {
        console.error('Error submitting recipe:', error);
        showToast('Could not reach the server. Please try again.', 'error');
    }
}

/**
 * Initialize the submit recipe page
 */
function initSubmitRecipePage() {
    // Check authentication
    if (typeof requireAuth === 'function') {
        if (!requireAuth()) {
            return;
        }
    }

    // Initialize autocomplete inputs
    initializeCategoryInput();
    initializeIngredientInput();

    // Handle submit button
    const submitButton = document.getElementById('submit-recipe-btn');
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmitRecipe);
    }
}

document.addEventListener('DOMContentLoaded', initSubmitRecipePage);

