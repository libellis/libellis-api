const { UnitOfWork } = require('../../Persistence/Repositories/UnitOfWork');
const { User } = require('../Domain/user');

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
    
    const newUser = new User()
    
    const user = unitOfWork.users.get({ username });
    return JSON.stringify({ user });
}
