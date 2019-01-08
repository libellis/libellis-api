# Libellis

A modern voting application that allows users to create and vote on ranked polls.

## Introduction
Libellis is a ranked voting application with a simple API for users to create, share, and vote on surveys, where each survey question would effictively be a poll.

To start please create a user account - you will need a token to use many of our routes.

## User Resource [/users]
Create a user by supplying a username, password, first name, last name and email address.  Your password will be stored as an encrypted password on our server.  If you lose your password it is **impossible** for us to get it for you.  We also do NOT keep server logs.

### Create a User [POST]

```
+ Request (application/json)

    {
        "username": "hackerman",
        "password": "hackerman",
        "first_name": "hacker",
        "last_name": "man",
        "email": "hackerman@hacker.com"
    }
```

```
+ Response 200 (application/json)

    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhhY2tlcm1hbiIsImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNTQ2OTcwNDAzfQ.YfTiu1e1YPy8pa4need1m4rg3VGHzmcKepcUunHI_HA"
    }
```
    
## Login Path [/login]
Log in with your username and password if you need a fresh token.

### Login for Token [POST]

```
+ Request (application/json)

    {
        "username": "hackerman",
        "password": "hackerman",
    }
```

```
+ Response 200 (application/json)

    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhhY2tlcm1hbiIsImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNTQ2OTcwNDAzfQ.YfTiu1e1YPy8pa4need1m4rg3VGHzmcKepcUunHI_HA"
    }
```

## Surveys Resource [/surveys]

### List All Surveys [GET]

```
+ Response 200 (application/json)

    {
        "surveys": [
            {
                "title": "Best Dance Music 2019",
                "date_posted": "2019-01-02T23:37:08.064Z",
                "published": true,
                "description": "Hottest dance hits from 2019 survey",
                "anonymous": true,
                "_id": 40,
                "author": "Michael Jackson"
            },
            {
                "title": "Favorite Spiritual Advisor",
                "date_posted": "2019-01-03T21:02:05.064Z",
                "published": true,
                "description": "Newage Poll for Facebook Moms",
                "anonymous": true,
                "_id": 41,
                "author": "Deepak Choprah"
            }
        ]
    }
```
    
### Create a Survey [POST]
You may create your own survey using this action.
This action takes a JSON payload as part of the request.
Response then return details about survey created.

```
+ Request (application/json)

        {
            "title": "Best Dance Music 2019",
            "description": "Hottest dance hits from 2019 survey"
            "_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVycGxlRWVwbGUiLCJpc19hZG1pbiI6ZmFsc2UsImlhdCI6MTU0Mjk1NTYwMn0.CfvAlM6xXS7uK0B5X1JwRj3lb5kGJSJ7qaCdWxyGgCQ"
        }
```

```
+ Response 200 (application/json)

    {
        "survey": [
            {
                "title": "Best Dance Music 2019",
                "date_posted": "2019-01-02T23:37:08.064Z",
                "published": false,
                "description": "Hottest dance hits from 2019 survey",
                "anonymous": true,
                "_id": 40,
                "author": "Michael Jackson"
            }
        ]
    }
```

## Single Survey [/surveys/{survey_id}]
    
### Get One Survey [GET]

```
+ Response 200 (application/json)

    {
        "survey": [
            {
                "title": "Best Dance Music 2019",
                "date_posted": "2019-01-02T23:37:08.064Z",
                "published": true,
                "description": "Hottest dance hits from 2019 survey",
                "anonymous": true,
                "_id": 40,
                "author": "Michael Jackson",
                "questions": [
                    {
                        "title": "Best House Music of the Year"
                        "type": "ranked",
                        "_survey_id": 40,
                        "_id": 20
                    },
                    {
                        "title": "Best Bass Music of the Year"
                        "type": "ranked",
                        "_survey_id": 40,
                        "_id": 21
                    }
                ]
            }
        ]
    }
``` 

    
## Questions Sub-Resource [/surveys/{survey_id}/questions]

### List All Questions by a Survey id [GET]

```
+ Response 200 (application/json)

    {
      "questions": [
        {
          "_id": 20,
          "_survey_id": 40,
          "type": "ranked",
          "title": "Favorite Popsicle Flavor",
          "choices": [
            {
              "_id": 68,
              "_question_id": 20,
              "content": null,
              "title": "Strawberry",
              "type": "text"
            },
            {
              "_id": 69,
              "_question_id": 20,
              "content": null,
              "title": "Vanilla",
              "type": "text"
            },
            {
              "_id": 70,
              "_question_id": 20,
              "content": null,
              "title": "Cherry",
              "type": "text"
            },
            {
              "_id": 71,
              "_question_id": 20,
              "content": null,
              "title": "Blueberry",
              "type": "text"
            }
          ]
        }
      ]
    }
```

### Create a New Question [POST]

You may create your own question using this action. It takes a JSON
object containing a question and an array of choices to pick from

```
+ Request (application/json)
    {
        "_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVycGxlRWVwbGUiLCJpc19hZG1pbiI6ZmFsc2UsImlhdCI6MTU0Mjk1NTYwMn0.CfvAlM6xXS7uK0B5X1JwRj3lb5kGJSJ7qaCdWxyGgCQ",
        "title": "Favorite President",
        "type": "ranked",
        "choices": [
            {
                "type": "text",
                "title": "FDR"
            },
            {
                "type": "text",
                "title": "Barack Obama"
            },
            {
                "type": "text",
                "title": "George Bush"
            },
            {
                "type": "text",
                "title": "George Washington"
            }
        ]
    }
``` 

```
+ Response 200 (application/json)
    {
        "_id": 3,
        "_survey_id": 20,
        "title": "Favorite President",
        "type": "ranked",
        "choices": [
            {
                "_id": 9,
                "type": "text",
                "title": "FDR",
                "content": null,
                "_question_id": 3
            },
            {
                "_id": 10,
                "type": "text",
                "title": "Barack Obama",
                "content": null,
                "_question_id": 3
            },
            {
                "_id": 11,
                "type": "text",
                "title": "George Bush",
                "content": null,
                "_question_id": 3
            },
            {
                "_id": 12,
                "type": "text",
                "title": "George Washington",
                "content": null,
                "_question_id": 3
            }
        ]
    }
``` 

## Votes Sub-Resource [/surveys/{survey_id}/votes]

### Get Vote Tally for Survey [GET]

```
+ Response 200 (application/json)

    {
      "results": [
        {
          "question_id": 2,
          "vote_results": [
            {
              "votes": 7,
              "question_title": "Favorite Bootcamp CEO",
              "choice_title": "Elie Schoppik"
            },
            {
              "votes": 6,
              "question_title": "Favorite Bootcamp CEO",
              "choice_title": "Steve Jerbs"
            },
            {
              "votes": 5,
              "question_title": "Favorite Bootcamp CEO",
              "choice_title": "Matthew Lane"
            },
            {
              "votes": 2,
              "question_title": "Favorite Bootcamp CEO",
              "choice_title": "Chill Gates"
            }
          ]
        }
      ]
    }
```
 
### Cast Votes for Survey [POST]

```
+ Request (application/json)
    {
      "_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVycGxlRWVwbGUiLCJpc19hZG1pbiI6ZmFsc2UsImlhdCI6MTU0Mjk1NTYwMn0.CfvAlM6xXS7uK0B5X1JwRj3lb5kGJSJ7qaCdWxyGgCQ",
      "votes": [
        {
          "question_id": 2,
          "vote_data": [
            {
              "choice_id": 5,
              "score": 4
            },
            {
              "choice_id": 6,
              "score": 3
            },
            {
              "choice_id": 7,
              "score": 2
            },
            {
              "choice_id": 8,
              "score": 1
            }
          ]
        }
      ]
    }
```   
 
```
+ Response 200 (application/json)
{
  "results": [
    {
      "question_id": 2,
      "vote_results": [
        {
          "votes": 11,
          "question_title": "Favorite Bootcamp CEO",
          "choice_title": "Elie Schoppik"
        },
        {
          "votes": 9,
          "question_title": "Favorite Bootcamp CEO",
          "choice_title": "Steve Jerbs"
        },
        {
          "votes": 7,
          "question_title": "Favorite Bootcamp CEO",
          "choice_title": "Matthew Lane"
        },
        {
          "votes": 3,
          "question_title": "Favorite Bootcamp CEO",
          "choice_title": "Chill Gates"
        }
      ]
    }
  ]
}
```
