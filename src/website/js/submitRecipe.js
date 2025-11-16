/**
 * Get references to the Submit Recipe page elements.
 */
function getSubmitRecipeElements() {
    const inputs = document.querySelectorAll(
        "main .card .grid input[type='text']"
    );

    const submitButton = document.querySelector("main .card .btn.primary");
    const helperText = document.querySelector("main .card .row .small");

    if (inputs.length < 3) {
        console.warn("Expected 3 text inputs on SubmitRecipe page.");
    }

    return {
        titleInput: inputs[0] || null,
        categoryInput: inputs[1] || null,
        descriptionInput: inputs[2] || null,
        submitButton,
        helperText
    };
}

/**
 * Show a status message in the helper text under the button.
 * Falls back to console logging if the element is missing.
 *
 * @param {string} message
 * @param {"info"|"success"|"error"} [type="info"]
 */
function showSubmitStatus(message, type = "info") {
    const {helperText} = getSubmitRecipeElements();

    if (!helperText) {
        console.log(type.toUpperCase() + ":", message);
        return;
    }

    helperText.textContent = message;

    // Optional styling hook
    helperText.className = "small"; // reset base class
    if (type === "success") {
        helperText.classList.add("status-success");
    } else if (type === "error") {
        helperText.classList.add("status-error");
    }
}

/**
 * Collect recipe data from the three text fields.
 *
 * @returns {{ title: string, category: string, description: string }}
 */
function collectSubmitRecipeData() {
    return {
        title: document.getElementById("recipe-title")?.value.trim() || "",
        category: document.getElementById("recipe-category")?.value.trim() || "",
        description: document.getElementById("recipe-description")?.value.trim() || "",
        servings: parseInt(
            document.getElementById("recipe-servings")?.value || "1",
            10
        ),
        ingredientIds: document.getElementById("recipe-ingredients")?.value.trim() || "",
        instructions: document.getElementById("recipe-instructions")?.value.trim() || "",
        imageUrl: document.getElementById("recipe-image-url")?.value.trim() || "",
        videoUrl: document.getElementById("recipe-video-url")?.value.trim() || ""
    };
}

/**
 * Build the payload object for POST /recipes/.
 *
 * @param {{ title: string, category: string, description: string }} data
 * @returns {object}
 */
function buildRecipeCreatePayload(data) {
    return {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        ingredient_id_list: data.ingredientIds,
        servings: data.servings,
        image_url: data.imageUrl || null,
        video_embed_url: data.videoUrl || null
    };
}

/**
 * Handle submit event.
 *
 * @param {MouseEvent} event
 */
async function handleSubmitRecipeClick(event) {
    event.preventDefault();

    const data = collectSubmitRecipeData();

    // Minimal front-end validation
    if (!data.title) {
        showSubmitStatus("Please enter a recipe title.", "error");
        return;
    }

    const payload = buildRecipeCreatePayload(data);

    // Use the same auth flow as pantry.js
    // Assumes API_BASE_URL & getAuthHeaders() are defined in auth.js
    showSubmitStatus("Submitting recipe...", "info");

    try {
        const response = await fetch(`${API_BASE_URL}/recipes/`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorMessage = "Failed to submit recipe.";
            try {
                const err = await response.json();
                if (err?.detail) {
                    errorMessage = Array.isArray(err.detail)
                        ? err.detail.map((d) => d.msg || d).join(", ")
                        : err.detail;
                }
            } catch (_) {
                // ignore parse errors, keep default message
            }

            showSubmitStatus(errorMessage, "error");
            return;
        }

        const savedRecipe = await response.json();

        showSubmitStatus(
            `Recipe submitted! New recipe ID: ${savedRecipe.id}`,
            "success"
        );

        // Clear inputs
        const {titleInput, categoryInput, descriptionInput} =
            getSubmitRecipeElements();
        document.getElementById("recipe-title").value = "";
        document.getElementById("recipe-category").value = "";
        document.getElementById("recipe-description").value = "";
        document.getElementById("recipe-servings").value = "1";
        document.getElementById("recipe-ingredients").value = "";
        document.getElementById("recipe-instructions").value = "";
        document.getElementById("recipe-image-url").value = "";
        document.getElementById("recipe-video-url").value = "";

        // Optional: redirect to detail page
        // window.location.href = `RecipeDetail.html?id=${savedRecipe.id}`;
    } catch (error) {
        console.error("Error while submitting recipe:", error);
        showSubmitStatus(
            "Could not reach the server. Please make sure the API is running.",
            "error"
        );
    }
}

/**
 * Initialize SubmitRecipe page:
 *  - Ensure user is authenticated
 *  - Hook up click handler for the submit button
 */
function initSubmitRecipePage() {
    // Use same auth guard as pantry page, if available
    if (typeof requireAuth === "function") {
        if (!requireAuth()) {
            return;
        }
    }

    const {submitButton} = getSubmitRecipeElements();

    if (!submitButton) {
        console.warn('Submit button not found on SubmitRecipe page.');
        return;
    }

    submitButton.addEventListener("click", handleSubmitRecipeClick);

    // Replace the demo text with a real hint
    showSubmitStatus("Fill in the fields and click Submit.", "info");
}

document.addEventListener("DOMContentLoaded", initSubmitRecipePage);
