const { UnitOfWork } = require('../../Persistence/Repositories/UnitOfWork');
const { User } = require('../Domain/user');
const {
    classPartialUpdate
} = require('../../helpers/partialUpdate');

async function getAllUsers({ db }) {
    const unitOfWork = new UnitOfWork(db);
    const users = unitOfWork.users.getAll();
    return JSON.stringify({ users });
}

async function getUser({ db }, username){
    const unitOfWork = new UnitOfWork(db);
    const user = unitOfWork.users.get({ username });
    return JSON.stringify({ user });
}

async function createUser({ db }, userData){
    const unitOfWork = new UnitOfWork(db);
    
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

async function updateUser({ db }, username, userChangeSet) {
    const unitOfWork = new UnitOfWork(db);
    const user = unitOfWork.users.get({ username });
    
    classPartialUpdate(user)

    return JSON.stringify({ user });
}

