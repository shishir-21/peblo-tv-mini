def test_create_category(client):
    response = client.post("/api/v1/categories", json={"name": "Action"})
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["name"] == "Action"
    assert "id" in data
    return data["id"]

def test_list_categories(client):
    client.post("/api/v1/categories", json={"name": "Drama"})
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_create_show(client):
    cat_id = test_create_category(client)
    response = client.post("/api/v1/shows", json={
        "title": "Test Show",
        "slug": "test-show",
        "section": "hero",
        "synopsis": "A test show",
        "status": "draft",
        "category_ids": [cat_id]
    })
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["title"] == "Test Show"
    assert "id" in data
    return data["id"]

def test_create_season(client):
    show_id = test_create_show(client)
    response = client.post("/api/v1/seasons", json={
        "show_id": show_id,
        "season_number": 1
    })
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["season_number"] == 1
    assert "id" in data
    return data["id"]

def test_create_episode(client):
    season_id = test_create_season(client)
    response = client.post("/api/v1/episodes", json={
        "season_id": season_id,
        "episode_id": "ep-1",
        "episode_number": 1,
        "title": "Pilot",
        "language": "en",
        "content_group": "group-1",
        "status": "draft"
    })
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["title"] == "Pilot"
    assert "id" in data
