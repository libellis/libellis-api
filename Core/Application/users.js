const {
    classPartialUpdate
} = require('../../helpers/partialUpdate');
const { UnitOfWork } = require('../../Persistence/Repositories/UnitOfWork');
const { User } = require('../Domain/user');
const { authorize } = require('auth');

async function getAllUsersIfAdmin(token) {
    if (authorize({ token }, 0)) {
        const unitOfWork = new UnitOfWork();
        const users = unitOfWork.users.getAll();
        return JSON.stringify({users});
    } else {
        throw new Error("You must be an admin to get a list of all users.");
    }
}

async function getUserIfAdminOrOwner({ token, username }){
    if (authorize({token, username}, 1)) {
        const unitOfWork = new UnitOfWork();
        const user = unitOfWork.users.get({ username });
        return JSON.stringify({ user });
    } else {
        throw new Error("You cannot access a users details unless you own the account, or are an admin.")
    }
}

async function createUser(userData){
    const unitOfWork = new UnitOfWork();
    
    const newUser = new User(userData);
    
    // add password this way so it hits our setter and gets hashed
    newUser.password = userData.password;
    unitOfWork.users.add(newUser);
    unitOfWork.complete();
    
    return JSON.stringify({
        username: newUser.username,
        email: newUser.email,
        is_admin: newUser.is_admin,
    });
}

async function updateUserIfAdminOrOwner({ token, username }, userChangeSet) {
    if (authorize({token, username}, 1)) {
        const unitOfWork = new UnitOfWork();
        const user = unitOfWork.users.get({ username });

        // update values from userChangeSet if they match up to values
        // in the user domain model instance
        classPartialUpdate(user, userChangeSet);

        unitOfWork.users.save(user);
        unitOfWork.complete();

        return JSON.stringify({
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            photo_url: user.photo_url,
            is_admin: user.is_admin,
        });
    } else {
        throw new Error("You cannot delete an account unless you own the account, or are an admin.")
    }
}

async function deleteUserIfAdminOrOwner({ token, username }) {
    if (authorize({token, username}, 1)) {
        const unitOfWork = new UnitOfWork()
    }
}

module.exports = {
    getAllUsersIfAdmin,
    getUserIfAdminOrOwner,
    createUser,
    updateUserIfAdminOrOwner,
}