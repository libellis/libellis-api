const db = require('../db');


class Survey {
    constructor({ author, title, description, anonymous=true }) {
      this.author = author;
      this.title = title;
      this.description = description;
      this.anonymous = anonymous;
    }
  
    // make setter/getter that makes it so you can't change primary key
  
    set author(val) {
      if (this._author) {
        throw new Error(`Can't change username!`);
      }
      this._author = val;
    }
  
    get author() {
      return this._author;
    }
  
    /**
     * getSurvey(id) <- return a survey by id
     * 
     * @param {int} id
     */
    static async getOne(id) {

        if (id === undefined) throw new Error('Missing id parameter')

        let surveys = await db.query(
            `SELECT author, title, description, date_posted, anonymous
            FROM surveys
            WHERE id=$1`, [id]
        )

        return surveys.rows[0]
    }
  
    /**
     * getSurveys() <- return an array of surveys filtered by params
     * 
     * @param {{field: value, ...}} search
     * 
     */
    static async getAll(search) {
        let surveys
        if (search === undefined) {
            surveys = await db.query(
                `SELECT author, title, description, date_posted, anonymous
                FROM surveys`
            );
        } else {
            console.log('RUN SEARCH QUERY HERE')
        }
        return surveys.rows;
    }

    /**
     * createSurvey(author, title, description) <- returns created survey details
     * 
     * @param {String} author 
     * @param {String} title 
     * @param {String} description 
     */
    static async create(author, title, description) {

        if (!author || !title) throw new Error('Missing author or title parameter');

        let survey = await db.query(
            `INSERT INTO surveys (author, title, description)
            VALUES ($1, $2, $3)
            RETURNING id, author, title, description, date_posted, anonymous`,
            [author, title, description]
        )

        return survey.rows[0];
    }
  }
  
  module.exports = Survey;
  