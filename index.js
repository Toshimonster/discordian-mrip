require("dotenv").config();

const controllerDef = require("./controller");
const Controller = new controllerDef();

Controller.start(process.env.MODULEDIR, process.env.CONFGFILE);
