// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const router = require("express").Router();
const bc = require("bcryptjs");
const Users = require("../users/users-model");
const {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
} = require("./auth-middleware");

router.post(
  "/register",
  checkUsernameFree,
  checkPasswordLength,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const hash = bc.hashSync(password, 8);
      const newUser = { username, password: hash };
      const created = await Users.add(newUser);
      res.json(created);
    } catch (err) {
      next(err);
    }
  }
);

/**
 1 [POST] /api/auth/register { "username": "sue", "password": "1234" }
 
 response:
 status 200
 {
   "user_id": 2,
   "username": "sue"
  }
  
  response on username taken:
  status 422
  {
    "message": "Username taken"
  }
  
  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
  */
router.post(
  "/login",
  checkUsernameExists,
  (req, res, next) => {
    console.log(req.body.password)
    console.log(req.user.password)

    if (bc.compareSync(req.body.password, req.user.password)) {
      console.log('the passwords match')
      req.session.user = req.user;
      res.status(200).json({
        message: `Welcome ${req.user.username}!`,
      });
    } else {
      res.json({
        status: 401,
        message: "Invalid credentials",
      });
    }
  }
);

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }
  
  response:
  status 200
  {
    "message": "Welcome sue!"
  }
  
  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
  */
router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ message: "logged out" });
      }
    });
  } else {
    res.json({ message: "no session" });
  }
});

/**
  3 [GET] /api/auth/logout
  
  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }
  
  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
  */

// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router;
