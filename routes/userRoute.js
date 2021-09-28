const { Router } = require("express");

const userController = require('../controllers/userController');

const router = Router();

router.get("/users", userController.getUserAll);
router.get("/addUser",userController.postUser);

module.exports = router;