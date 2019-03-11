function getTokenAndUsername(req, res, next) {
  try {
    const token = req.body._token || req.query._token;
    const username = req.params.username;

    if (!token) {
      throw new Error();
    }
  } catch (err) {
    return next({status: 401, message: "Must supply token."});
  }
}

module.exports = {
  getTokenAndUsername,
};
