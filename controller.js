const BotDef = require("./Bot");
const fs = require("fs");

module.exports = class Controller {
  constructor(moduleDirectory = "./modules", configFile = "./config.json") {
    this.modules = [];
    this.log = require("log4js").getLogger("Ctr");
    this.log.level = process.env.DEBUG;

    this.__moduleDirectory = moduleDirectory;
    this.__configFile = configFile;
    this.config = {
      modules: [],
    };

    this.parseConfig();
    this.parseModuleDir();

    this.Bot = new BotDef(
      process.env.TOKEN,
      process.env.DATABASE_LOCATION,
      moduleDirectory,
      this.modules
    );

    this.log.info("Controller class initialized");

    this.stdin = process.stdin;
    this.stdin.setEncoding("utf-8");
    this.stdin.on("data", this.command);
  }

  command(cmd) {
    switch (
      cmd.slice(0, -1).toLowerCase() //Get rid of /n at the end of string
    ) {
      case "help":
        console.log(
          "Commands:\n" +
            "\thelp\t\t-\tDisplays all available commands\n" +
            "\tevaluate {code}\t-\tEvaluates the code\n" +
            "\tstop\t\t-\tStops the program\n" +
            "\trestart\t\t-\tRestarts the program\n"
        );
        break;
      case "stop":
        process.exit();
        break;
      case "restart":
        //TODO
        console.log("restarting... (DOSENT WORK BTW)");
        process.on("exit", function () {
          require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached: false,
            stdio: "inherit",
          });
        });
        process.exit();
        break;
      default:
        if (cmd.toLowerCase().startsWith("evaluate")) {
          try {
            console.log(eval(cmd.slice(9, -1)));
          } catch (E) {
            console.error(E);
          }
        } else {
          console.log(
            `'${cmd.slice(
              0,
              -1
            )}' is unknown. Run 'help' to get all available commands!`
          );
        }
        break;
    }
  }

  start() {
    this.log.info("Starting bot");
    return this.Bot.login();
  }

  parseConfig() {
    try {
      this.config = {
        ...this.config,
        ...JSON.parse(fs.readFileSync(this.__configFile, "utf-8")),
      };
    } catch (error) {
      this.warn(`Could not parse ${this.__configFile}`);
      this.info(error);
    }
    this.log.info("Config parsed");
  }

  parseModuleDir() {
    try {
      let temp = fs.readdirSync(this.__moduleDirectory);

      //Filter to only those that exist
      this.modules = this.config.modules.filter((val) => {
        if (temp.indexOf(val) != -1) {
          return true;
        } else {
          this.log.warn(
            `Module '${val}' does not exist, but is called in ${this.__configFile}!`
          );
        }
      });

      this.log.info(
        `Enabled modules:\n\t${this.modules.join("\n\t") || "None"}`
      );
    } catch (error) {
      this.log.fatal(`Could not parse ${this.__moduleDirectory}'s modules`);
      this.log.info(error);
    }
  }
};
