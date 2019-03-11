const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');
const { pool } = require('db');

const { SurveyRepository } = require('Repositories/SurveyRepository');
const { ChoiceRepository } = require('Repositories/ChoiceRepository');
const { QuestionRepository } = require('Repositories/QuestionRepository');
const { CategoryRepository } = require('Repositories/CategoryRepository');
const { UserRepository } = require('Repositories/UserRepository');
// const { FenceRepository } = require('Repositories/Fe');

class UnitOfWork {
  constructor(context = pool) {
    this.context = context;
    this.repositories = {
      surveys: new SurveyRepository(context);
      questions: new QuestionRepository(context);
      choices: new ChoiceRepository(context);
      users: new UserRepository(context);
      categories: new CategoryRepository(context);
    };
  }

  /**
   * 
   * TODO: Create setter so you can't externally
   * set repositories here
   * 
   */
  
  get surveys() {
    return this.repositories.surveys;
  }
  
  get questions() {
    return this.repositories.questions;
  }
  
  get choices() {
    return this.repositories.choices;
  }
  
  get votes() {
    return this.repositories.votes;
  }
  
  get users() {
    return this.repositories.users;
  }
  
  get categories() {
    return this.repositories.categories;
  }
  
  get fences() {
    return this.repositories.fences;
  }
  
  
  
  complete() {
    // run through all repositories running their aggregate
    // sql commands in a transaction
    
    (async () => {
      // note: we don't try/catch this because if connecting throws an exception
      // we don't need to dispose of the client (it will be undefined)
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        for (const repo in this.repositories) {
          for (const [query, values] in repo.commands) {
            client.query(query, values);
          }
        }
        
        await client.query('COMMIT')
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
    })().catch(e => console.error(e.stack))
  }
  
  dispose() {
    // Clear command storage from all repos
    for (const repo in this.repositories) {
      repo.commands = [];
    }
  }
  
}

module.exports = UnitOfWork;
