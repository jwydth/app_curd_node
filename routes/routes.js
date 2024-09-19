const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

// image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

var upload = multer({ storage: storage }).single("image");

// insert an user into database route
router.post("/add", upload, async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename
  });
  await user.save();
  if (!user) {
    req.session.message = {
      type: "danger",
      message: "User not added successfully!"
    };
  } else {
    req.session.message = {
      type: "success",
      message: "User added successfully!"
    };
    res.redirect("/");
  }

});

// get all users from database route
router.get("/", async (req, res) => {
  const users = await User.find();
  res.render("index", {title: "Home Page", users});
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add User" });
});

//edit an user route
router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    req.session.message = {
      type: "danger",
      message: "User not found!"
    };
    res.redirect("/");
  } else {
    res.render("edit_users", { title: "Edit User", user });
  }
});

// update user route
router.post("/update/:id", upload, async(req, res) => {
  let id = req.params.id;
  let new_image = '';

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync('./uploads/' + req.body.old_image);
    } catch (error) {
      console.log(error);
    }
  } else {
    new_image = req.body.old_image;
  }
  try {
    const user = await User.findByIdAndUpdate(id, {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      phone: req.body.phone || user.phone,
      image: new_image || user.image
    });
    req.session.message = {
      type: "success",
      message: "User updated successfully!"
    };
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// delete user route
router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  
  await User.findByIdAndDelete(id);
})

module.exports = router;
