class Fence {
  constructor({ title, geo_level, geo, db }) {
    this.title = title;
    this.geo_level = geo_level;
    this.geo = geo;
    this.db = db;
  }

  // make setter/getter that makes it so you can't change primary key

  set title(val) {
    if (this._title) {
      throw new Error(`Can't change title!`);
    }
    this._title = val;
  }

  get title() {
    return this._title;
  }

  /**
   * get(title) <- return a fence by title
   *
   * @param {int} title
   */
  static async get({ db }, { title }) {

    if (title === undefined) throw new Error('Missing title parameter')

    let result = await db.query(
      `SELECT title, geo_level, ST_AsGeoJSON(geo)
            FROM fences
            WHERE title=$1`, [title]
    )

    if (result.rows.length < 1) {
      const err = Error('Not Found');
      err.status = 404;
      throw err;
    }

    return new Fence({ ...result.rows[0], db });
  }

  /**
   * getAll() <- return an array of fences filtered by params
   *
   * @param {{field: value, ...}} search
   */
  static async getAll({ db }, { search }) {
    let result;

    result = await db.query(
      `SELECT title, geo_level, ST_AsGeoJSON(geo) AS geo
      FROM fences`
    );

    return result.rows.map(fence => new Fence({
      title: fence.title,
      geo_level: fence.geo_level,
      geo: JSON.parse(fence.geo)
      db,
    }));
  }

  /**
   * getFenceByCoords(coords) <- return an array of fences ins by params
   *
   * @param {{field: value, ...}} search
   */
  static async getFenceByCoords({ db }, { coords }) {
    let result;
    result = await db.query(
      `SELECT title, geo_level, ST_AsGeoJSON(geo) AS geom
      FROM fences
      WHERE ST_Intersects( ST_GeomFromGeoJSON($1) , geo)`, [coords]
    );

    return result.rows.map(fence => new Fence({
      title: fence.title,
      geo_level: fence.geo_level,
      geo: JSON.parse(fence.geom)
      db,
    }));
  }

  /** get fences by user is handled by User model, so this is commented out */

  // static async getForUser(username) {
  //   let result = await db.query(
  //     `SELECT title, geo_level, geo
  //     FROM fences
  //   );
  //   return result.rows.map(s => new Fence(s));
  // }


  /**
   * createFence(title, geo_level, geojson) <- returns created fence details
   *
   * @param {Object}
   */
  static async create({ db }, { title, geo_level, geojson }) {
    if (!title) throw new Error('Missing title parameter');

    let result = await db.query(
      `INSERT INTO fences (title, geo_level, geo)
            VALUES ($1, $2, ST_GeomFromGeoJSON($3))
            RETURNING title, geo_level, geo`,
      [title, geo_level, geojson]
    )

    return new Fence({ ...result.rows[0], db });
  }

  //Delete user and return a message
  async delete() {
    const result = await this.db.query(
      `
        DELETE FROM fences
        WHERE title=$1
        RETURNING title`,
      [this.title]
    );
    if (result.rows.length === 0) {
      throw new Error(`Could not delete fence: ${this.title}`);
    }
    return `Deleted`;
  }
}

module.exports = Fence;
