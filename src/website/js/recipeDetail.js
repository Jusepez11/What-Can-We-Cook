/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value or null
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Fetch ingredient details by ID
 * @param {number} ingredientId - Ingredient ID
 * @returns {Promise<object>} - Ingredient object
 */
async function fetchIngredient(ingredientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/ingredient/${ingredientId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ingredient ${ingredientId}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ingredient ${ingredientId}:`, error);
        return {id: ingredientId, name: 'Unknown ingredient'};
    }
}

/**
 * Fetch category details by ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<object>} - Category object
 */
async function fetchCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category ${categoryId}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching category ${categoryId}:`, error);
        return {id: categoryId, name: 'Unknown category'};
    }
}

/**
 * Fetch user's pantry ingredients
 * @returns {Promise<Array|null>} - Array of pantry ingredients with ingredient details, or null if not authenticated
 */
async function fetchUserPantry() {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/pantryingredient/pantry`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                return null;
            }
            throw new Error(`Failed to fetch pantry: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user pantry:', error);
        return null;
    }
}

/**
 * Load and display recipe details
 */
async function loadRecipeDetails() {
    const recipeId = getUrlParameter('id');

    if (!recipeId) {
        displayError('No recipe ID provided');
        return;
    }

    try {
        // Fetch recipe details
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`);

        if (!response.ok) {
            if (response.status === 404) {
                displayError('Recipe not found');
            } else {
                displayError(`Failed to load recipe: ${response.statusText}`);
            }
            return;
        }

        const recipe = await response.json();

        // Update page title
        document.title = `${recipe.title} • What Can We Cook`;

        // Display recipe details
        await displayRecipe(recipe);

    } catch (error) {
        console.error('Error loading recipe:', error);
        displayError('Unable to load recipe. Please make sure the API server is running.');
    }
}

/**
 * Display recipe details on the page
 * @param {object} recipe - Recipe object from API
 */
async function displayRecipe(recipe) {
    // Fetch all ingredients
    const ingredientIds = recipe.ingredient_id_list.split(',').map(id => id.trim()).filter(id => id);
    const ingredients = await Promise.all(
        ingredientIds.map(id => fetchIngredient(parseInt(id)))
    );

    // Fetch all categories
    const categoryIds = recipe.category_id_list ? recipe.category_id_list.split(',').map(id => id.trim()).filter(id => id) : [];
    const categories = await Promise.all(
        categoryIds.map(id => fetchCategory(parseInt(id)))
    );

    // Fetch user's pantry to check which ingredients they have
    const userPantry = await fetchUserPantry();

    // Create a set of ingredient IDs that the user has in their pantry
    const pantryIngredientIds = new Set();
    if (userPantry) {
        userPantry.forEach(item => {
            pantryIngredientIds.add(item.ingredient_id);
        });
    }

    // Update hero section with categories
    const heroSection = document.querySelector('.hero');
    const servingsInfo = recipe.servings ? `Serves ${recipe.servings}` : '';
    const description = recipe.description || '';

    // Build categories HTML
    const categoriesHtml = categories.length > 0
        ? `<div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
            ${categories.map(cat => `<a href="Recipes.html?category=${cat.id}" class="chip" style="text-decoration: none;">${cat.name}</a>`).join('')}
           </div>`
        : '';

    heroSection.innerHTML = `
        <h1>${recipe.title}</h1>
        <p class="muted">${servingsInfo}${servingsInfo && description ? ' • ' : ''}${description}</p>
        ${categoriesHtml}
    `;

    // Process instructions - respect newlines
    const instructionsHtml = formatInstructions(recipe.instructions);

    // Build the main content section
    const contentSection = document.querySelector('section.grid');

    // Determine layout based on whether video exists
    const hasVideo = recipe.video_embed_url && recipe.video_embed_url.trim() !== '';
    const gridColumns = hasVideo ? '1fr 1fr .8fr' : '1.2fr .8fr';
    contentSection.style.gridTemplateColumns = gridColumns;

    const photoSection = document.getElementById('recipe-photo-section');
    photoSection.innerHTML = `
        <img 
            src="${recipe.image_url}" 
            alt="${recipe.title}" 
            class="recipe-photo"
        >
    `;

    let contentHtml = `
        <div class="card">
            <h3 style="margin-top:12px">Instructions</h3>
            ${instructionsHtml}
        </div>
    `;

    // Build ingredients list with pantry status
    let ingredientsHtml = '';
    let missingCount = 0;

    if (userPantry !== null) {
        // User is logged in - show pantry status
        ingredientsHtml = ingredients.map(ing => {
            const hasIngredient = pantryIngredientIds.has(ing.id);
            if (!hasIngredient) {
                missingCount++;
            }
            const color = hasIngredient ? '#10b981' : '#ef4444';
            const icon = hasIngredient ? '✓' : '✗';
            return `<li style="color: ${color};">
                <span style="font-weight: 600; margin-right: 4px;">${icon}</span>
                ${ing.name}
            </li>`;
        }).join('\n                ');

        // Add status message
        const statusMessage = missingCount === 0
            ? `<p style="color: #10b981; font-size: 14px; margin-top: 12px;">✓ You have all ingredients in your pantry!</p>`
            : `<p style="color: #ef4444; font-size: 14px; margin-top: 12px;">✗ You are missing ${missingCount} ingredient${missingCount !== 1 ? 's' : ''} from your pantry</p>`;

        contentHtml += `
            <aside class="card">
                <h3>Ingredients</h3>
                ${statusMessage}
                <ul style="margin-top:8px;padding-left:18px">
                    ${ingredientsHtml}
                </ul>
                <p style="font-size: 12px; color: #888; margin-top: 12px;">
                    <a href="MyPantry.html" style="color: #3b82f6; text-decoration: none;">Manage your pantry</a>
                </p>
            </aside>
        `;
    } else {
        // User not logged in - show regular list
        ingredientsHtml = ingredients.map(ing => `<li>${ing.name}</li>`).join('\n                ');

        contentHtml += `
            <aside class="card">
                <h3>Ingredients</h3>
                <ul style="margin-top:8px;padding-left:18px">
                    ${ingredientsHtml}
                </ul>
                <p style="font-size: 12px; color: #888; margin-top: 12px;">
                    <a href="Login.html" style="color: #3b82f6; text-decoration: none;">Log in</a> to check your pantry
                </p>
            </aside>
        `;
    }

    // Add video column if video exists
    if (hasVideo) {
        contentHtml += `
            <div class="card">
                <h3>Video</h3>
                <div style="margin-top:12px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    <iframe 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
                        src="${recipe.video_embed_url}"
                        referrerpolicy="strict-origin-when-cross-origin"
                        title="${recipe.title} video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
    }

    contentSection.innerHTML = contentHtml;
}

/**
 * Format instructions text into HTML
 * Converts numbered lists and preserves line breaks
 * @param {string} instructions - Raw instructions text
 * @returns {string} - Formatted HTML
 */
function formatInstructions(instructions) {
    if (!instructions) {
        return '<p style="margin-top:8px">No instructions provided.</p>';
    }

    // Split by newlines and filter empty lines
    const lines = instructions.split('\n').map(line => line.trim()).filter(line => line);

    // Check if it looks like a numbered list (starts with numbers)
    const isNumberedList = lines.some(line => /^\d+\./.test(line));

    if (isNumberedList) {
        // Format as ordered list, removing existing numbers if present
        const listItems = lines.map(line => {
            const text = line.replace(/^\d+\.\s*/, ''); // Remove leading numbers
            return `<li>${text}</li>`;
        }).join('\n      ');

        return `<ol style="margin-top:8px;padding-left:20px">\n      ${listItems}\n    </ol>`;
    } else {
        // Format as paragraphs
        const paragraphs = lines.map(line => `<p style="margin-top:8px">${line}</p>`).join('\n    ');
        return paragraphs;
    }
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function displayError(message) {
    const heroSection = document.querySelector('.hero');
    heroSection.innerHTML = `
        <h1>Error</h1>
        <p class="muted">${message}</p>
    `;

    const contentSection = document.querySelector('section.grid');
    contentSection.innerHTML = `
        <div class="card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <p>Unable to load recipe details.</p>
            <a href="Recipes.html" class="btn" style="margin-top: 16px; display: inline-block;">Back to Recipes</a>
        </div>
    `;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadRecipeDetails);

/**
 * Helper function to identify and tag sections for Cooking Mode reordering.
 * This runs automatically when content is loaded into the grid.
 */
function reorganizeForCookingMode() {
    const gridContainer = document.querySelector('.grid');
    if (!gridContainer) return;

    const children = Array.from(gridContainer.children);

    children.forEach(child => {
        // Check contents to identify what section this is
        const htmlContent = child.innerHTML.toLowerCase();
        
        // 1. Identification: Video
        // Checks for iframe or video tags
        if (htmlContent.includes('<iframe') || htmlContent.includes('<video')) {
            child.classList.add('cm-order-video');
        }
        
        // 2. Identification: Ingredients
        // Checks for specific headers or list keywords often found in ingredients
        else if (htmlContent.includes('ingredients') || htmlContent.includes('<ul>')) {
            child.classList.add('cm-order-ingredients');
        }
        
        // 3. Identification: Instructions
        // Checks for headers or ordered lists (1. 2. 3.)
        else if (htmlContent.includes('instructions') || htmlContent.includes('method') || htmlContent.includes('<ol>')) {
            child.classList.add('cm-order-instructions');
        }
    });
}

// Hook into the existing load process
// We add a MutationObserver to watch for when the recipe is actually rendered
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            reorganizeForCookingMode();
        }
    });
});

const gridTarget = document.querySelector('.grid');
if (gridTarget) {
    observer.observe(gridTarget, { childList: true, subtree: true });
}