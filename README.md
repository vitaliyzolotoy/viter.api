## API Documentation ##

Client ID: 2213122435
API Key: 3523424t3334m3rddf3345

### GET /articles ###
#### Show All Articles ####
This method returns full list of articles. All available API information is presented for each article.

Request URL:
``` http://localhost:4000/articles/?client_id=[your_client_id]&api_key=[your_api_key] ```

Sample Response
```
{
    "status": "OK",
    "articles": [
        {
            "id": id,
            "title": "title",
            "content": "content",
            "visibility": true
        }
    ]
}
```



### GET /articles/new ###
#### New Article ####
This method allows you to create a new article. See the required parameters section below for an explanation of the variables that are needed to create a new article.

Request URL:
``` http://localhost:4000/articles/new?client_id=[your_client_id]&api_key=[your_api_key]&title=[article_title]&content=[article_content] ```

Parameters
* title: Required, String, this is the title of the article
* content: Required, String, this is the content of the article
* visibility: Optional, Boolean, this is the option of the article visibility

Sample Response
```
{
    "status": "OK",
    "article": {
        "id": id,
        "title": "title",
        "content": "content",
        "visibility": true
    }
}
```



### GET /articles/[article_id] ###
#### Show Article ####
This method returns full information for a specific droplet ID that is passed in the URL.

Request URL:
``` http://localhost:4000/articles/[article_id]?client_id=[your_client_id]&api_key=[your_api_key] ```

Parameters
* article_id: Required, String, this is the id of your article

Sample Response
```
{
    "status": "OK",
    "article": {
        "title": "title",
        "content": "content",
        "visibility": true
    }
}
```



### GET /articles/[article_id]/update ###
#### Update Article ####
This method update the article.

Request URL:
``` http://localhost:4000/[article_id]/update?client_id=[your_client_id]&api_key=[your_api_key] ```

Parameters
* title: Optional, String, this is the title of the article
* content: Optional, String, this is the content of the article
* visibility: Optional, Boolean, this is the option of the article visibility

Sample Response
```
{
    "status": "OK",
    "article": {
        "id": id,
        "title": "title",
        "content": "content",
        "visibility": true
    }
}
```



### GET /articles/[article_id]/destroy ###
#### Destroy Article ####
This method destroys one of your article - this is irreversible.

Request URL:
``` http://localhost:4000/articles/[article_id]/destroy?client_id=[your_client_id]&api_key=[your_api_key] ```

Parameters
* article_id: Required, String, this is the id of the article you want to destroy

Sample Response
```
{
    "status": "OK"
}
```


