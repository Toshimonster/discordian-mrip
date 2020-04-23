require("dotenv").config();

const controllerDef = require("./controller");
const Controller = new controllerDef();

Controller.start(process.env.MODULEDIR, process.env.CONFGFILE);


const node = require("log4js").getLogger("node")
node.level="ALL"
process.on('warning', (warning) => {
    //node.warn(warning.message)
})