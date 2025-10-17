from . import (
	auth,
	user,
	ingredient,
	pantry_ingredient,
	recipe,
)


def load_routes(app):
	app.include_router(auth.router)
	app.include_router(user.router)
	app.include_router(ingredient.router)
	app.include_router(pantry_ingredient.router)
	app.include_router(recipe.router)
