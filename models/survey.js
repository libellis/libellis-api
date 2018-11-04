const db = require('../db');
const {
    sqlForPartialUpdate,
    classPartialUpdate
} = require('../helpers/partialUpdate');


class Survey {
    constructor({id, author, title, description, date_posted, anonymous = true}) {
        this.id = id;
        this.author = author;
        this.title = title;
        this.description = description;
        this.date_posted = date_posted
        this.anonymous = anonymous;
    }

    // make setter/getter that makes it so you can't change primary key

    set id(val) {
        if (this._id) {
            throw new Error(`Can't change id!`);
        }
        this._id = val;
    }

    get id() {
        return this._id;
    }

    /**
     * getSurvey(id) <- return a survey by id
     * 
     * @param {int} id
     */
    static async getOne(id) {

        if (id === undefined) throw new Error('Missing id parameter')

        let surveys = await db.query(
            `SELECT id, author, title, description, date_posted, anonymous
            FROM surveys
            WHERE id=$1`, [id]
        )

        if (surveys.rows.length < 1) {
            const err = Error('Not Found');
            err.status = 404;
            throw err;
        }

        return new Survey(surveys.rows[0]);
    }

    /**
     * getSurveys() <- return an array of surveys filtered by params
     * 
     * @param {{field: value, ...}} search
     */
    static async getAll(search) {
        let surveys;
        if (search === undefined) {
            surveys = await db.query(
                `SELECT id, author, title, description, date_posted, anonymous
                FROM surveys`
            );
        } else {
            console.log('RUN SEARCH QUERY HERE')
        }
        return surveys.rows.map(s => new Survey(s));
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

        return new Survey(survey.rows[0]);
    }

    updateFromValues(vals) {
        classPartialUpdate(this, vals);
    }

    //Update a user instance
    async save() {
        const {
            query,
            values
        } = sqlForPartialUpdate(
            'surveys', {
                description: this.description,
                title: this.title,
                anonymous: this.anonymous
            },
            'id',
            this.id
        );

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            const err = new Error('Cannot find survey to update');
            err.status = 400;
            throw err;
        }
    }

    //Delete user and return a message
    async delete() {
        const result = await db.query(
            `
        DELETE FROM surveys 
        WHERE id=$1
        RETURNING id`,
            [this.id]
        );
        if (result.rows.length === 0) {
            throw new Error(`Could not delete survey: ${this.id}`);
        }
        return `Deleted`;
    }
}

module.exports = Survey;