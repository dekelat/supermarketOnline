const RIGHT_SALT = "ksdjfhbAWEDCAS29!@$addlkmn";
const LEFT_SALT = "32577098ASFKJkjsdhfk#$dc";

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const ErrorType = require("../errors/error-type");
const ServerError = require("../errors/server-error");
let usersDao = require("../dao/users-dao");
let cache = require("../controllers/cache-controller");


async function login(loginDetails) {

    if (loginDetails.email == null || loginDetails.password == null) {
        throw new ServerError(ErrorType.MISSING_REQUIRED_FIELDS);
    }

    // Encrypt password 
    loginDetails.password = crypto.createHash("md5").update(
        LEFT_SALT + loginDetails.password + RIGHT_SALT).digest("hex");
    let userData = await usersDao.login(loginDetails);

    // Create user's token
    // let saltedEmail = LEFT_SALT + userData.email + RIGHT_SALT;
    // const token = jwt.sign({ sub: saltedEmail }, config.secret);

    // cache.put(token, userData);

    // let response = { token: "Bearer " + token, userType: userData.userType, email: userData.email, 
    //     firstName: userData.firstName, lastName: userData.lastName, city: userData.city, 
    //     street: userData.street };
    
    return createUserSession(userData);
}

async function addUser(user) {

    if (user.id == null || user.email == null || user.password == null || 
        user.userType == null || user.firstName == null || user.lastName == null) {
        throw new ServerError(ErrorType.MISSING_REQUIRED_FIELDS);
    }

    // Validate user id doesn't exist already
    if (await usersDao.isUserExistById(user.id)) {
        throw new ServerError(ErrorType.USER_ALREADY_EXIST);
    }

    if (!isEmailValid(user.email)) {
        throw new ServerError(ErrorType.INVALID_EMAIL);
    }

    // Validate email doesn't exist
    if (await usersDao.isUserExistByEmail(user.email)) {
        throw new ServerError(ErrorType.EMAIL_ALREADY_EXIST);
    }

    user.password = crypto.createHash("md5").update(
        LEFT_SALT + user.password + RIGHT_SALT).digest("hex");

    await usersDao.addUser(user);

    // Reaching here means the user was added successfully 
    // Create a new session for him
    return createUserSession(user);
}

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function createUserSession(userData){
    let saltedEmail = LEFT_SALT + userData.email + RIGHT_SALT;
    const token = jwt.sign({ sub: saltedEmail }, config.secret);

    cache.put(token, userData);

    let response = { token: "Bearer " + token, userType: userData.userType, email: userData.email, 
        firstName: userData.firstName, lastName: userData.lastName, city: userData.city, 
        street: userData.street };

    return response;
}

module.exports = {
    login,
    addUser
};