const API_BASE_URL = 'http://api-what-can-we-cook.onrender.com';

/**
 * Perform search and display results
 * @param {string} query - Search query
 * @param {string} resultsContainerId - ID of the container to display results
 * @param {boolean} redirectToRecipes - Whether to redirect to Recipes.html with results
 */
async function searchRecipes(query, resultsContainerId, redirectToRecipes = false) {
    if (!query || query.trim() === '') {
        alert('Please enter a search term');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/recipes/search/?query=${encodeURIComponent(query)}&threshold=70`);

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const recipes = await response.json();

        // If redirecting from home page, store results and redirect
        if (redirectToRecipes) {
            sessionStorage.setItem('searchResults', JSON.stringify(recipes));
            sessionStorage.setItem('searchQuery', query);
            window.location.href = 'Recipes.html';
            return;
        }

        // Display results on current page
        displaySearchResults(recipes, resultsContainerId, query);
    } catch (error) {
        console.error('Search error:', error);
        alert('Search failed. Please make sure the API server is running.');
    }
}

/**
 * Display search results in the specified container
 * @param {Array} recipes - Array of recipe objects
 * @param {string} containerId - ID of the container element
 * @param {string} query - The search query
 */
function displaySearchResults(recipes, containerId, query) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Results container not found');
        return;
    }

    // Clear existing results
    container.innerHTML = '';

    if (recipes.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>No recipes found for "${query}"</h3>
                <p class="muted">Try a different search term or ingredient</p>
            </div>
        `;
        return;
    }

    // Display results count
    const resultInfo = document.createElement('div');
    resultInfo.style.gridColumn = '1/-1';
    resultInfo.innerHTML = `<p class="muted">Found ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} for "${query}"</p>`;
    container.appendChild(resultInfo);

    // Display each recipe
    recipes.forEach(recipe => {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = `RecipeDetail.html?id=${recipe.id}`;

        // Extract first ingredient or use placeholder
        const servingsText = recipe.servings ? `${recipe.servings} servings` : '';

        card.innerHTML = `
            <img src="${recipe.image_url}" alt="${recipe.title}" width="180" height="180" style="object-fit: cover; display: block; margin: 0 auto;">
            <h3>${recipe.title}</h3>
            <p class="muted">${servingsText}</p>
            ${recipe.description ? `<p style="margin-top: 8px; font-size: 14px;">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>` : ''}
        `;

        container.appendChild(card);
    });
}

/**
 * Load recent recipes from the API
 * @param {string} containerId - ID of the container to display results
 * @param {number} limit - Number of recent recipes to fetch
 */
async function loadRecentRecipes(containerId, limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/recent/?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Failed to load recipes: ${response.statusText}`);
        }

        const recipes = await response.json();

        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Results container not found');
            return;
        }

        // Clear existing results
        container.innerHTML = '';

        if (recipes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h3>No recipes available yet</h3>
                    <p class="muted">Be the first to submit a recipe!</p>
                </div>
            `;
            return;
        }

        // Display each recipe
        recipes.forEach(recipe => {
            const card = document.createElement('a');
            card.className = 'card';
            card.href = `RecipeDetail.html?id=${recipe.id}`;

            const servingsText = recipe.servings ? `${recipe.servings} servings` : '';

            card.innerHTML = `
                <img src="${recipe.image_url}" alt="${recipe.title}" width="180" height="180" style="object-fit: cover; display: block; margin: 0 auto;">
                <h3>${recipe.title}</h3>
                <p class="muted">${servingsText}</p>
                ${recipe.description ? `<p style="margin-top: 8px; font-size: 14px;">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>` : ''}
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading recent recipes:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h3>Unable to load recipes</h3>
                    <p class="muted">Please make sure the API server is running.</p>
                </div>
            `;
        }
    }
}

/**
 * Load recipes by category ID
 * @param {number} categoryId - Category ID to filter by
 * @param {string} containerId - ID of the container to display results
 */
async function loadRecipesByCategory(categoryId, containerId) {
    try {
        // Fetch category details
        const categoryResponse = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        if (!categoryResponse.ok) {
            throw new Error(`Failed to load category: ${categoryResponse.statusText}`);
        }
        const category = await categoryResponse.json();

        // Fetch recipes for this category
        const recipesResponse = await fetch(`${API_BASE_URL}/recipes/category/${categoryId}`);
        if (!recipesResponse.ok) {
            throw new Error(`Failed to load recipes: ${recipesResponse.statusText}`);
        }
        const recipes = await recipesResponse.json();

        // Display the results
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Results container not found');
            return;
        }

        // Clear existing results
        container.innerHTML = '';

        // Add category header
        const categoryHeader = document.createElement('div');
        categoryHeader.style.gridColumn = '1/-1';
        categoryHeader.innerHTML = `
            <h2 style="margin-bottom: 8px;">${category.name}</h2>
            <p class="muted">${category.description || ''}</p>
            <p class="muted" style="margin-top: 8px;">Found ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}</p>
        `;
        container.appendChild(categoryHeader);

        if (recipes.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px;';
            noResults.innerHTML = `
                <h3>No recipes in this category yet</h3>
                <p class="muted">Be the first to submit a recipe for ${category.name}!</p>
            `;
            container.appendChild(noResults);
            return;
        }

        // Display each recipe
        recipes.forEach(recipe => {
            const card = document.createElement('a');
            card.className = 'card';
            card.href = `RecipeDetail.html?id=${recipe.id}`;

            const servingsText = recipe.servings ? `${recipe.servings} servings` : '';

            card.innerHTML = `
                <img src="${recipe.image_url}" alt="${recipe.title}" width="180" height="180" style="object-fit: cover; display: block; margin: 0 auto;">
                <h3>${recipe.title}</h3>
                <p class="muted">${servingsText}</p>
                ${recipe.description ? `<p style="margin-top: 8px; font-size: 14px;">${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>` : ''}
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading recipes by category:', error);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h3>Unable to load recipes</h3>
                    <p class="muted">Please make sure the API server is running.</p>
                </div>
            `;
        }
    }
}

/**
 * Initialize search functionality on page load
 */
function initializeSearch() {
    const searchInput = document.querySelector('.search input[type="text"]');
    const searchButton = document.querySelector('.search button');

    if (!searchInput || !searchButton) {
        console.warn('Search elements not found on this page');
        return;
    }

    // Determine if we're on the home page or recipes page
    const isHomePage = window.location.pathname.includes('index.html') ||
        window.location.pathname.endsWith('/') ||
        window.location.pathname === '';

    // Handle search button click
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (isHomePage) {
            searchRecipes(query, null, true);
        } else {
            // Clear category parameter from URL when performing a search
            const url = new URL(window.location);
            url.searchParams.delete('category');
            window.history.replaceState({}, '', url);
            searchRecipes(query, 'searchResults', false);
        }
    });

    // Handle Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Clear category parameter from URL when performing a search
            const url = new URL(window.location);
            url.searchParams.delete('category');
            window.history.replaceState({}, '', url);
            const query = searchInput.value.trim();
            if (isHomePage) {
                searchRecipes(query, null, true);
            } else {
                searchRecipes(query, 'searchResults', false);
            }
        }
    });

    // Load recent recipes on home page
    if (isHomePage) {
        loadRecentRecipes('recentRecipes', 3);
    }

    // On Recipes.html, check if there are stored search results from a redirect or previous search
    if (!isHomePage) {
        // Check if we have a category parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');

        if (categoryId) {
            // Load recipes by category
            loadRecipesByCategory(parseInt(categoryId), 'searchResults');
        } else {
            const storedResults = sessionStorage.getItem('searchResults');
            const storedQuery = sessionStorage.getItem('searchQuery');

            if (storedResults && storedQuery) {
                try {
                    const recipes = JSON.parse(storedResults);
                    searchInput.value = storedQuery;
                    displaySearchResults(recipes, 'searchResults', storedQuery);

                    // Clear stored results
                    sessionStorage.removeItem('searchResults');
                    sessionStorage.removeItem('searchQuery');
                } catch (error) {
                    console.error('Error loading stored results:', error);
                }
            } else {
                // Load recent recipes by default if no search results
                loadRecentRecipes('searchResults', 10);
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
    initializeSearch();
}
