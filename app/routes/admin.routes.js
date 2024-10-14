const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload');

const registerValidation = require("../validators/registerValidation");
const loginValidation = require("../validators/loginValidation");
const commitmentStoreValidation = require("../validators/commitmentValidation");
const expenseValidation = require("../validators/expenseValidation");

const Auth = require("../controllers/app.authController.js");
const Dashboard = require("../controllers/app.dashboardController.js");
const Commitment = require("../controllers/app.commitmentController.js");
const Expense = require("../controllers/app.expenseController.js");
const updateBalanceValidation = require('../validators/updateBalanceValidation.js');

router.post("/register", registerValidation, Auth.register);
router.post("/login", loginValidation, Auth.login);

router.get("/dashboard/index", Dashboard.index);

router.post("/commitment/store", commitmentStoreValidation, Commitment.store);
router.get("/commitment/index", Commitment.index);
router.get("/commitment/details/:id", Commitment.details);
router.put("/commitment/update/:id", commitmentStoreValidation, Commitment.update);

router.get("/expenses", Expense.index);
router.post("/expense/store", upload.single('attachment'), expenseValidation, Expense.store);
router.get("/expenses/edit/:id", Expense.show);
router.get("/expenses/view/:id", Expense.show);
router.put("/expenses/update/:id", upload.single('attachment'), expenseValidation, Expense.update);
router.delete("/expenses/:id", Expense.delete);
router.get("/expenses/list-update-balance/:id", Expense.listUpdateBalance);
router.post("/expenses/add-balance/:id", updateBalanceValidation, Expense.addBalance);
router.put("/expenses/update-history/:historyId", updateBalanceValidation, Expense.updateHistory);
router.delete("/expenses/delete-history/:id", updateBalanceValidation, Expense.deleteHistory );

module.exports = router;

