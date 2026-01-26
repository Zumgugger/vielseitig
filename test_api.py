#!/usr/bin/env python
"""Quick API test script to verify endpoints are working."""
import asyncio
import httpx


async def test_endpoints():
    """Test basic endpoints."""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        # Test health endpoint
        print("Testing GET /health...")
        response = await client.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}\n")
        
        # Test admin login
        print("Testing POST /admin/login...")
        login_data = {
            "username": "admin",
            "password": "changeme"
        }
        response = await client.post(f"{base_url}/admin/login", json=login_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print(f"Cookies: {response.cookies}\n")
        
        # Test getting default list
        print("Testing GET /l (default list)...")
        response = await client.get(f"{base_url}/l")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"List: {data['name']}")
            print(f"Adjectives count: {len(data['adjectives'])}\n")
        else:
            print(f"Error: {response.text}\n")


if __name__ == "__main__":
    asyncio.run(test_endpoints())
