const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload');

const registerValidation = require("../validators/registerValidation");
const loginValidation = require("../validators/loginValidation");
const commitmentStoreValidation = require("../validators/commitmentValidation");
const expenseValidation = require("../validators/expenseValidation");

const Auth = require("../controllers/app.authController.js");
const Commitment = require("../controllers/app.commitmentController.js");
const Expense = require("../controllers/app.expenseController.js");

router.post("/register", registerValidation, Auth.register);
router.post("/login", loginValidation, Auth.login);

router.post("/commitment/store", commitmentStoreValidation, Commitment.store);
router.get("/commitment/index", Commitment.index);
router.get("/commitment/details/:id", Commitment.details);
router.put("/commitment/update/:id", commitmentStoreValidation, Commitment.update);

router.get("/expenses", Expense.index);
router.post("/expense/store", upload.single('attachment'), expenseValidation, Expense.store);
router.get("/expenses/edit/:id", Expense.show);
router.get("/expenses/view/:id", Expense.show);
router.put("/expenses/update/:id", upload.single('attachment'), expenseValidation, Expense.update);


module.exports = router;

