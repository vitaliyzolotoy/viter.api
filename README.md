## API Documentation ##

### GET /notes ###
##### Show All Notes #####
This method returns full list of notes. All available API information is presented for each notes.

Request URL:
``` http://localhost:4000/notes ```

Sample Response
```
{
    "status": "200 OK",
    "message": "A list of all notes"
    "notes": [
        {
            "_id": "52b445a15917ccdb01000002",
            "title": "Title",
            "content": "Content",
            "created": "2013-12-19T10:16:29.030Z",
            "modified": "2013-12-20T13:26:57.030Z"
        }
    ]
}
```



### POST /notes ###
##### New Note #####
This method allows you to create a new note. See the required parameters section below for an explanation of the variables that are needed to create a new note.

Request URL:
``` http://localhost:4000/notes ```

Parameters
* title: Required, String, this is the title of the note
* content: Required, String, this is the content of the note

Sample Response
```
{
    "status": "200 OK",
    "message": "The note was created",
    "notes": {
        "_id": "52b445a15917ccdb01000002",
        "title": "Title",
        "content": "Content",
        "created": "2013-12-19T10:16:29.030Z",
        "modified": "2013-12-20T13:26:57.030Z"
    }
}
```



### GET /notes/[note_id] ###
##### Show Note #####
This method returns full information for a specific note ID that is passed in the URL.

Request URL:
``` http://localhost:4000/notes/[note_id] ```

Parameters
* note_id: Required, String, this is the id of your article

Sample Response
```
{
    "status": "200 OK",
    "message": "The note was found",
    "notes": {
        "_id": "52b445a15917ccdb01000002",
        "title": "Title",
        "content": "Content",
        "created": "2013-12-19T10:16:29.030Z",
        "modified": "2013-12-20T13:26:57.030Z"
    }
}
```



### POST /notes/[note_id] ###
##### Update Note #####
This method update the note.

Request URL:
``` http://localhost:4000/[note_id] ```

Sample Response
```
{
    "status": "200 OK",
    "message": "The note was updated",
    "notes": {
        "_id": "52b445a15917ccdb01000002",
        "title": "Title",
        "content": "Content",
        "created": "2013-12-19T10:16:29.030Z",
        "modified": "2013-12-20T13:26:57.030Z"
    }
}
```



### DELETE /notes/[note_id] ###
##### Destroy Note #####
This method destroys one of your note - this is irreversible.

Request URL:
``` http://localhost:4000/notes/[note_id] ```

Parameters
* note_id: Required, String, this is the id of the article you want to destroy

Sample Response
```
{
    "status": "200 OK",
    "message": "The note was destroyed"
}
```


