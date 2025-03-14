const bcrypt = require("bcrypt");
const saltRounds = 10;

const { createConnection } = require("./database");

async function addUser(email, password) {
  const connection = await createConnection();

  connection.connect();
  // These 3 lines will check if email passed from form is in the database, then if (user) is run. If user is true we stop, if not we insert new user into the database
  const FindUserQuery = "SELECT * FROM user WHERE email = ?;";
  const [rows] = await connection.execute(FindUserQuery, [email]);
  const user = await rows[0];

  if (user) {
    return false;
  }
  // Here we insert the new user and hash the password with 10 salt rounds
  const addUserQuery = "INSERT INTO user (email, password) VALUES (?, ?)";
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  connection.execute(addUserQuery, [email, hashedPassword]);

  connection.end();
  // We return true so we can redirect the user to the correct spot
  return true;
}

async function authenticateUser(email, password) {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM user WHERE email = ?;";
  const [rows] = await connection.execute(query, [email]);
  const user = rows[0];

  if (rows.length === 0) {
    connection.end();
    return false;
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    return {
      success: true,
      email: user.email,
      address: user.address,
      userLevel: user.user_level,
    };
  }
  connection.end();
}

async function deleteUser(email) {
  const connection = await createConnection();

  connection.connect();
  const deleteUserQuery = "DELETE FROM user WHERE email = ?";
  connection.execute(deleteUserQuery, [email]);

  connection.end();
}

module.exports = { addUser, authenticateUser, deleteUser };
