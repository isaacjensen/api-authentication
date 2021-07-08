const { extractValidFields } = require('../lib/validation');
const bcrypt = require('bcryptjs');
const mysqlPool = require('../lib/mysqlPool');
/*
 * Schema for a User.
 */
const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true},
  admin: { required: false}
};
exports.UserSchema = UserSchema;


async function insertNewUser(user) {
    console.log("  --- inserting new User!");
    const userToInsert = extractValidFields(user, UserSchema);
    console.log(" --- userToInsert before hashing:", userToInsert);
    userToInsert.password = await bcrypt.hash(userToInsert.password, 8); //8 byte salt
    console.log(" --- userToInsert after hashing:", userToInsert);
  
    const [ result ] = await mysqlPool.query(
      "INSERT INTO users SET ?",
      userToInsert
    );
    return result.insertId;
  };
  exports.insertNewUser = insertNewUser;
  
  async function getUsers() {
    console.log("getting a lit of users");
    const [ results ] = await mysqlPool.query("SELECT * FROM users");
    return results;
  }
  exports.getUsers = getUsers;
  
  /*
   * Fetch a user from the DB based on user ID.
   */
  async function getUserById (id, includePassword) {
    const [ results ] = await mysqlPool.query(
      "SELECT * FROM users WHERE id = ?",[
        id,
      ]);
  
    const res = {
      id: results[0].id,
      name: results[0].name,
      email: results[0].email,
      admin: results[0].admin
    };
    return includePassword ? results[0] : res;
  };
  exports.getUserById = getUserById;
  
  async function validateUser(id, password) {
    const user = await exports.getUserById(id, true);
    return user && await bcrypt.compare(password, user.password);
  }
  exports.validateUser = validateUser;





  