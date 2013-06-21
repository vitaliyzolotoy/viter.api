API
===

Client ID: 2213122435
API Key: 3523424t3334m3rddf3345

API Documentation
---

/articles

GET /articles

Show All Articles
This method returns full list of articles. All available API information is presented for each article.

Request URL:
`http://localhost:4000/articles/?client_id=[your_client_id]&api_key=[your_api_key]`

Sample Response:
`{
    "status": "OK",
    "articles": [
        {
            "id": 10001,
            "title": "title",
            "content": "content",
            "modified": "modified",
            "author": "author",
            "status": "visible"
        }
    ]
}`
