const API_BASE_URL = 'http://localhost:8000';

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
    // Update hero section
    const heroSection = document.querySelector('.hero');
    const servingsInfo = recipe.servings ? `Serves ${recipe.servings}` : '';
    const description = recipe.description || '';

    heroSection.innerHTML = `
        <h1>${recipe.title}</h1>
        <p class="muted">${servingsInfo}${servingsInfo && description ? ' • ' : ''}${description}</p>
    `;

    // Fetch all ingredients
    const ingredientIds = recipe.ingredient_id_list.split(',').map(id => id.trim()).filter(id => id);
    const ingredients = await Promise.all(
        ingredientIds.map(id => fetchIngredient(parseInt(id)))
    );

    // Process instructions - respect newlines
    const instructionsHtml = formatInstructions(recipe.instructions);

    // Build the main content section
    const contentSection = document.querySelector('section.grid');

    // Determine layout based on whether video exists
    const hasVideo = recipe.video_embed_url && recipe.video_embed_url.trim() !== '';
    const gridColumns = hasVideo ? '1fr 1fr .8fr' : '1.2fr .8fr';
    contentSection.style.gridTemplateColumns = gridColumns;

    let contentHtml = `
        <div class="card">
            <img src="image/recipes.png" alt="${recipe.title}">
            <h3 style="margin-top:12px">Instructions</h3>
            ${instructionsHtml}
        </div>
    `;

    // Add ingredients column
    contentHtml += `
        <aside class="card">
            <h3>Ingredients</h3>
            <ul style="margin-top:8px;padding-left:18px">
                ${ingredients.map(ing => `<li>${ing.name}</li>`).join('\n                ')}
            </ul>
        </aside>
    `;

    // Add video column if video exists
    if (hasVideo) {
        contentHtml += `
            <div class="card">
                <h3>Video</h3>
                <div style="margin-top:12px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
                    <iframe 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;"
                        src="${recipe.video_embed_url}" 
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

