def test_create_category(client):
    response = client.post("/api/v1/categories", json={"name": "Action"})
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["name"] == "Action"
    assert "id" in data

def test_list_categories(client):
    client.post("/api/v1/categories", json={"name": "Drama"})
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_create_show(client):
    cat = client.post("/api/v1/categories", json={"name": "Action2"}).json()
    response = client.post("/api/v1/shows", json={
        "title": "Test Show",
        "slug": "test-show",
        "section": "featured",
        "synopsis": "A test show",
        "status": "draft",
        "category_ids": [cat["id"]]
    })
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["title"] == "Test Show"
    assert "id" in data

def test_create_season(client):
    cat = client.post("/api/v1/categories", json={"name": "Action3"}).json()
    show = client.post("/api/v1/shows", json={
        "title": "Test Show 2",
        "slug": "test-show-2",
        "section": "featured",
        "synopsis": "A test show",
        "status": "draft",
        "category_ids": [cat["id"]]
    }).json()
    
    response = client.post("/api/v1/seasons", json={
        "show_id": show["id"],
        "season_number": 1
    })
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["season_number"] == 1
    assert "id" in data

def test_create_episode(client):
    cat = client.post("/api/v1/categories", json={"name": "Action4"}).json()
    show = client.post("/api/v1/shows", json={
        "title": "Test Show 3",
        "slug": "test-show-3",
        "section": "featured",
        "synopsis": "A test show",
        "status": "draft",
        "category_ids": [cat["id"]]
    }).json()
    season = client.post("/api/v1/seasons", json={"show_id": show["id"], "season_number": 1}).json()
    
    response = client.post("/api/v1/episodes", json={
        "season_id": season["id"],
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
