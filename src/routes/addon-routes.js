const express = require("express");
const router = express.Router();
const addonController = require("../controllers/addon-controller");

router.get("/", addonController.getAllAddons);
router.get("/:key", addonController.getAddonByKey);
router.post("/seed", addonController.seedAddons);

module.exports = router;
