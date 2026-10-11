import uuid

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _unique_phone():
    return f"9{uuid.uuid4().int % 10**9:09d}"


def test_register_and_login_return_user_id():
    phone = _unique_phone()
    register_payload = {
        "full_name": "Demo Owner",
        "phone_number": phone,
        "password": "secret123",
        "role": "OWNER",
        "gym_name": "Demo Gym",
        "city": "Chennai",
        "address": "Main Road",
        "upi_id": "demo@upi",
    }

    register_response = client.post("/auth/register", json=register_payload)
    assert register_response.status_code == 200, register_response.text
    register_data = register_response.json()
    assert register_data["user_id"]
    assert register_data["role"] == "OWNER"

    login_response = client.post(
        "/auth/login",
        json={"phone_number": phone, "password": "secret123"},
    )
    assert login_response.status_code == 200, login_response.text
    login_data = login_response.json()
    assert login_data["user_id"] == register_data["user_id"]
    assert login_data["role"] == "OWNER"


def test_owner_can_create_poster():
    phone = _unique_phone()
    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Poster Owner",
            "phone_number": phone,
            "password": "secret123",
            "role": "OWNER",
            "gym_name": "Poster Gym",
            "city": "Madurai",
            "address": "Temple Road",
            "upi_id": "poster@upi",
        },
    )
    assert register_response.status_code == 200, register_response.text
    token = register_response.json()["access_token"]

    poster_response = client.post(
        "/owner/add-poster",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Summer Challenge",
            "description": "Big fitness event for the month",
            "image_url": "https://example.com/poster.jpg",
            "organizer_name": "Poster Gym",
            "contact_phone": "9876543210",
            "event_date": "2026-10-15",
        },
    )
    assert poster_response.status_code == 200, poster_response.text
    assert poster_response.json()["message"] == "Competition Poster published successfully!"
