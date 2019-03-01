
/** this is hard coded data, it will be moved */
const userData = [
  {
    "username": "hackerman",
    "password": "password",
    "first_name": "Hacker",
    "last_name": "Mann",
    "email": "hacker@haxs.com"
  },
  {
    "username": "jen_rand_geo",
    "password": "password",
    "first_name": "Jennifer",
    "last_name": "Rangeo",
    "email": "jrand@random.com"
  }
]

const surveyData = [
  {
    "author": "hackerman",
    "title": "What are your favorite programming tools?",
    "description": "A survey where you can vote on your favorite developer tools",
    "category": "programming",
    "questions": [
      {
        "title": "Rank your favorite programming languages",
        "question_type": "ranked",
        "choices": [
          {
            "title": "Javascript",
            "content_type": "text"
          },
          {
            "title": "Python",
            "content_type": "text"
          },
          {
            "title": "C++",
            "content_type": "text"
          },
          {
            "title": "Rust",
            "content_type": "text"
          },
          {
            "title": "Ruby",
            "content_type": "text"
          },
          {
            "title": "Go",
            "content_type": "text"
          },
          {
            "title": "Java",
            "content_type": "text"
          }
        ]
      },
      {
        "title": "What is the DBMS do you use the most?",
        "question_type": "multiple",
        "choices": [
          {
            "title": "MongoDB",
            "content_type": "text"
          },
          {
            "title": "MySQL",
            "content_type": "text"
          },
          {
            "title": "PostgreSQL",
            "content_type": "text"
          },
          {
            "title": "CouchDB",
            "content_type": "text"
          },
          {
            "title": "Oracle",
            "content_type": "text"
          },
          {
            "title": "Cassandra",
            "content_type": "text"
          }
        ]
      }
    ]
  },
  {
    "author": "hackerman",
    "title": "What is your favorite ice cream?",
    "category": "food",
    "questions": [
      {
        "title": "What is your favorite flavor of ice cream?",
        "question_type": "ranked",
        "choices": [
          {
            "title": "Chocolate",
            "content_type": "text"
          },
          {
            "title": "Vanilla",
            "content_type": "text"
          },
          {
            "title": "Strawberry",
            "content_type": "text"
          }
        ]
      }
    ]
  }
]

module.exports = {
  surveyData,
  userData
}