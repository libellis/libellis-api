
/** this is hard coded data, it will be moved */
const userData = [
  {
    username: "hackerman",
    password: "password",
    first_name: "Hacker",
    last_name: "Mann",
    email: "hacker@haxs.com"
  },
  {
    username: "jen_rand_geo",
    password: "password",
    first_name: "Jennifer",
    last_name: "Rangeo",
    email: "jrand@random.com"
  }
]

const surveyData = [
  {
    author: userData[0].username,
    title: "What are your favorite programming tools?",
    description: "A survey where you can vote on your favorite developer tools",
    category: "programming",
    questions: [
      {
        title: "Rank your favorite programming languages",
        qtype: "ranked",
        choices: [
          {
            title: "Javascript",
            ctype: "text"
          },
          {
            title: "Python",
            ctype: "text"
          },
          {
            title: "C++",
            ctype: "text"
          },
          {
            title: "Rust",
            ctype: "text"
          },
          {
            title: "Ruby",
            ctype: "text"
          },
          {
            title: "Go",
            ctype: "text"
          },
          {
            title: "Java",
            ctype: "text"
          }
        ]
      },
      {
        title: "What is the DBMS do you use the most?",
        qtype: "multiple",
        choices: [
          {
            title: "MongoDB",
            ctype: "text"
          },
          {
            title: "MySQL",
            ctype: "text"
          },
          {
            title: "PostgreSQL",
            ctype: "text"
          },
          {
            title: "CouchDB",
            ctype: "text"
          },
          {
            title: "Oracle",
            ctype: "text"
          },
          {
            title: "Cassandra",
            ctype: "text"
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