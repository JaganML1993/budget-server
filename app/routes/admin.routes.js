const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload');

const registerValidation = require("../validators/registerValidation");
const loginValidation = require("../validators/loginValidation");
const commitmentStoreValidation = require("../validators/commitmentValidation");
const commitmentHistoryValidation = require("../validators/commitmentHistoryValidation");
const expenseValidation = require("../validators/expenseValidation");
const updateBalanceValidation = require('../validators/updateBalanceValidation.js');
const notesValidation = require("../validators/notesValidation");
const houseSavingValidation = require("../validators/houseSavingValidation");

const Auth = require("../controllers/app.authController.js");
const Dashboard = require("../controllers/app.dashboardController.js");
const Commitment = require("../controllers/app.commitmentController.js");
const Expense = require("../controllers/app.expenseController.js");
const Notes = require("../controllers/app.notesController.js");
const HouseSaving = require("../controllers/app.houseSavingController.js");

router.post("/register", registerValidation, Auth.register);
router.post("/login", loginValidation, Auth.login);
router.get("/details", Auth.details);

router.get("/dashboard/index", Dashboard.index);

router.get("/commitments", Commitment.index);
router.post("/commitments/store", upload.single('attachment'), commitmentStoreValidation, Commitment.store);
router.get("/commitments/view/:id", Commitment.show);
router.get("/commitments/edit/:id", Commitment.show);
router.put("/commitments/update/:id", upload.single('attachment'), commitmentStoreValidation, Commitment.update);
router.delete("/commitments/:id", Commitment.delete);

router.get("/commitments/history/:id", Commitment.indexHistory);
router.post("/commitments/history/store", upload.single('attachment'), commitmentHistoryValidation, Commitment.storeHistory);
router.get("/commitments/history/edit/:id", Commitment.showHistory);
router.put("/commitments/history/update/:id", upload.single('attachment'), commitmentHistoryValidation, Commitment.updateHistory);
router.delete("/commitments/history/:id", Commitment.deleteHistory);

router.get("/expenses", Expense.index);
router.post("/expense/store", upload.single('attachment'), expenseValidation, Expense.store);
router.get("/expenses/edit/:id", Expense.show);
router.get("/expenses/view/:id", Expense.show);
router.put("/expenses/update/:id", upload.single('attachment'), expenseValidation, Expense.update);
router.delete("/expenses/:id", Expense.delete);
router.get("/expenses/list-update-balance/:id", Expense.listUpdateBalance);
router.post("/expenses/add-balance/:id", updateBalanceValidation, Expense.addBalance);
router.put("/expenses/update-history/:historyId", updateBalanceValidation, Expense.updateHistory);
router.delete("/expenses/delete-history/:id", updateBalanceValidation, Expense.deleteHistory);
router.get("/expenses/recent-names/:id", Expense.getRecentExpenseNames);

router.get("/notes", Notes.show);
router.post("/notes/create", upload.single('attachment'), notesValidation, Notes.store);
router.put("/notes/:id", upload.single('attachment'), notesValidation, Notes.update);
router.delete("/notes/:id", Notes.delete);

module.exports = router;

