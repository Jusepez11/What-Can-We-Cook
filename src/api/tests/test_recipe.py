def test_get_recipe(client, test_seed_data):
    response = client.get("/recipes/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["title"] == "Kapsalon"


def test_update_recipe(client, test_seed_data, authenticate_demo_user):
    updated_recipe = {
		"title": "Updated Test Recipe"}


    response = client.put("/recipes/1", json=updated_recipe, headers=authenticate_demo_user)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == updated_recipe["title"]


def test_delete_recipe(client, test_seed_data, authenticate_demo_user, authenticate_demo_admin_user):
    response = client.delete(f"/recipes/1", headers=authenticate_demo_user)
    assert response.status_code == 204  # Non-admin recipe should not be able to delete

    response = client.delete("/recipes/1", headers=authenticate_demo_admin_user)
    assert response.status_code == 404  # Admin recipe should be able to delete

    response = client.get("/recipes/1")
    assert response.status_code == 404
