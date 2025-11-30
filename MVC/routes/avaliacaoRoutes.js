const express = require("express");
const router = express.Router();
const controller = require("../controllers/avaliacaoController");

function auth(req, res, next) {
  if (!req.session.usuario) return res.redirect("/login");
  next();
}

router.get("/", auth, controller.listar);
router.get("/create", auth, controller.criarForm);
router.post("/create", auth, controller.criar);

module.exports = router;
