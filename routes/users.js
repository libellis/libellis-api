const express = require('express');
const router = new express.Router();
const { getToken } = require('../middleware/httpRequestParsing');
const { getAllUsersIfAdmin, getUserIfAdminOrOwner, createUserIfSchemaIsValid, updateUserIfAdminOrOwner, deleteUserIfAdminOrOwner } = require('../Core/Application/users');

/** 
 * users endpoints are restricted
 * users can only make requests concerning their own profile
 * only admin users can make a GET request for all users   
 */

// Get a list of users, admin only
router.get("/", async function (req, res, next) {
  try {
    const responseObj = await getAllUsersIfAdmin(req.body.token);
    return res.json(responseObj);
  } catch (e) {
    e.status = e.type === "Unauthorized" ? 401 : 500;
    return next(e);
  }
});

// Create/Register a new user
router.post("/", async function (req, res, next) {
  try {
    const responseObj = await createUserIfSchemaIsValid(req.body);
    return res.json(responseObj);
  } catch (error) {
    return next(error);
  }
});

// Get a user by username
router.get('/:username', getToken, async function (req, res, next) {
  try {
    const responseObj = await getUserIfAdminOrOwner({
      token: req.token,
      username: req.params.username,
    });
    
    return res.json(responseObj);
  } catch (error) {
    error.status = error.type === "ResourceNotFound" ? 400 : 401;
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

// //Update a user
// router.patch(
//   '/:username',
//   ensureCorrectUserOrAdmin,
//   validateInput(updateUserSchema),
//   async function (req, res, next) {
//     try {
//       let user = await User.get(req.params.username);
//       user.updateFromValues(req.body);
//       await user.save();
//       return res.json({ user });
//     } catch (error) {
//       return next(error);
//     }
//   }
// );
//
// //Delete a user
// router.delete('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
//   try {
//     const user = await User.get(req.params.username);
//     const message = await user.delete();
//     return res.json({ message });
//   } catch (error) {
//     return next(error);
//   }
// });

module.exports = router;
