const express = require('express');
const router = new express.Router();
const { getToken } = require('../middleware/httpRequestParsing');
const { serializeGetAllUsersInput, serializeGetUserInput, serializeCreateUserInput } = require('../Core/Application/Users/usersUseCaseSerializers');
const { getAllUsersIfAdmin, getUserIfAdminOrOwner, createUserWithValidSchema, updateUserIfAdminOrOwner, deleteUserIfAdminOrOwner } = require('../Core/Application/Users/usersUseCases');
const assignStatusCode = require('../helpers/httpStatusCodeAssigner');

/** 
 * users endpoints are restricted
 * users can only make requests concerning their own profile
 * only admin users can make a GET request for all users   
 */

// Get a list of users, admin only
router.get("/", getToken, serializeGetAllUsersInput, async function (req, res, next) {
  try {
    const responseObj = await getAllUsersIfAdmin(req.requestObj);
    return res.json(responseObj);
  } catch (error) {
    assignStatusCode(error);
    return next(error);
  }
});

// Get a user by username
router.get('/:username', getToken, serializeGetUserInput, async function (req, res, next) {
  try {
    const responseObj = await getUserIfAdminOrOwner(req.requestObj);
    return res.json(responseObj);
  } catch (error) {
    assignStatusCode(error);
    return next(error);
  }
});

// Create/Register a new user
router.post("/", serializeCreateUserInput, async function (req, res, next) {
  try {
    const responseObj = await createUserWithValidSchema(req.requestObj);
    return res.json(responseObj);
  } catch (error) {
    assignStatusCode(error);
    return next(error);
  }
});

// // Get a list of surveys created by this user
// router.get('/:username/surveys', ensureCorrectUserOrAdmin, async function (req, res, next) {
//   const surveys = await User.getSurveys(req.params.username);
//   return res.json({ surveys });
// });
//
// // Get a list of surveys voted on by this user, 
// router.get('/:username/history', ensureCorrectUserOrAdmin, async function (req, res, next) {
//   const surveys = await User.getHistory(req.params.username);
//   return res.json({ surveys });
// });

//Update a user
router.patch(
  '/:username',
  getToken,
  async function (req, res, next) {
    try {
      let responseObj = await updateUserIfAdminOrOwner({
        token: req.token,
        username: req.params.username,
        userChangeSet: req.body,
      });
      return res.json(responseObj);
    } catch (error) {
      assignStatusCode(error);
      return next(error);
    }
  }
);

//Delete a user
router.delete('/:username', getToken, async function (req, res, next) {
  try {
    let responseObj = await deleteUserIfAdminOrOwner({
      token: req.token, 
      username: req.params.username,
    });
    return res.json(responseObj);
  } catch (error) {
    assignStatusCode(error);
    return next(error);
  }
});

module.exports = router;
