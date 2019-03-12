function getToken(req, res, next) {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      throw new Error();
    } else {
      req.token = token;
      return next();
    }
  } catch (err) {
    return next({status: 401, message: "Must supply token."});
  }
}

module.exports = {
  getToken,
};
