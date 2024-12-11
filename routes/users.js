var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  console.log("dans la route");
});

// Route pour inscription

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ username: req.body.username }).then((data) => {
    if (data) {
      res.json({ result: false, error: "Username already used" });
      return;
    } else {
      User.findOne({ email: req.body.email }).then((data) => {
        if (data) {
          res.json({ result: false, error: "Email already used" });
          return;
        } else {
          const hash = bcrypt.hashSync(req.body.password, 10);
          const newUser = new User({
            token: uid2(32),
            email: req.body.email,
            username: req.body.username,
            password: hash,
          });
          newUser.save().then((data) => {
            res.json({
              result: true,
              userInfos: {
                token: data.token,
                email: data.email,
                username: data.username,
                sound: data.sound,
                weight: data.weight,
              },
            });
          });
        }
      });
    }
  });
});

// Route pour connexion
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        userInfos: {
          token: data.token,
          email: data.email,
          username: data.username,
          sound: data.sound,
          weight: data.weight,
        },
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// Route pour change le son
router.put("/changeSound", (req, res) => {
  if (!checkBody(req.body, ["token", "newSound"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      res.json({ result: false, error: "User not found" });
      return;
    } else {
      user.sound = req.body.newSound;
      user.save().then((userUpdated) => {
        if (userUpdated) {
          res.json({ result: true, soundUpdated: userUpdated.sound });
          return;
        } else {
          res.json({
            result: false,
            error: "Une erreur s'est produite lors de la modification du son",
          });
        }
      });
    }
  });
});

// Route pour changer adresse email

router.put("/changeEmail", async (req, res) => {
  const { email, password, token } = req.body;
  console.log(email, password, token);
  if (!email || !password || !token) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const user = await User.findOne({ token });
  if (!user) {
    res.json({ result: false, error: "User not found" });
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.json({ result: false, error: "Password invalid" });
    return;
  }
  user.email = email;
  user.save().then((data) => res.json({ result: true, newEmail: data.email }));
});

router.post("/addWeight", async (req, res) => {
  const { weight, token } = req.body;
  console.log(weight, token);
  if (!weight || !token) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const user = await User.findOne({ token });

  if (!user) {
    res.json({ result: false, error: "User not founds" });
    return;
  }
  const lastWeight = user.weight.at(-1);
  const newWeight = {
    weight,
    date: new Date(),
  };
  user.weight.push(newWeight);
  user.save().then(() => {
    res.json({ result: true, newWeight });
  });
});

module.exports = router;
