const pool = require('./db');
const SurveyRepository = require('./Repositories/SurveyRepository');
const ChoiceRepository = require('./Repositories/ChoiceRepository');
const QuestionRepository = require('./Repositories/QuestionRepository');
const CategoryRepository = require('./Repositories/CategoryRepository');
const UserRepository = require('./Repositories/UserRepository');
// const FenceRepository = require('./Repositories/FenceRepository');

class UnitOfWork {
  constructor(context = pool) {
    this.context = context;
    this.repositories = {
      surveys: new SurveyRepository(context),
      questions: new QuestionRepository(context),
      choices: new ChoiceRepository(context),
      users: new UserRepository(context),
      categories: new CategoryRepository(context),
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
  
  
  
  async complete() {
    // run through all repositories running their aggregate
    // sql commands in a transaction
    try {
      await (async () => {
        const client = await this.context.connect();

        try {
          await client.query('BEGIN');

          for (const repo of Object.values(this.repositories)) {
            for (const [query, values] of repo.commands) {
              client.query(query, values);
            }
          }

          await client.query('COMMIT');
        } catch (e) {
          await client.query('ROLLBACK');
          throw e
        } finally {
          client.release()
        }
      })();
    } catch (e) {
      throw new Error(); 
    }
  }
  
  dispose() {
    // Clear command storage from all repos
    for (const repo in this.repositories) {
      repo.commands = [];
    }
  }
  
}

module.exports = UnitOfWork;
