const discord = require("discord.js");
const path = require("path");
const fs = require("fs");
const Sql = require("../Sql");

module.exports = class Bot {
  constructor(token, moduleDiretory, moduleNames) {
    this.token = token;
    this.client = new discord.Client();
    this.modules = new Map();
    this.sql = new Sql();
    this.moduleDiretory = moduleDiretory;

    this.log = require("log4js").getLogger("Bot");
    this.log.level = process.env.DEBUG;

    //Bot init
    this.addMiddleware();

    this.parseModules(moduleNames);

    this.client.on("ready", () => {
      this.log.info(`Logged in as ${this.client.user.tag}!`);
    });

    this.log.info("Bot class initialized");
  }

  addMiddleware() {
    this.log.info("Adding message middleware");
    this.client.on("message", (msg) => {
      //msg wrapper
      msg.command = (command, callback) => {
        if (
          !msg.author.bot &&
          msg.content
            .toLowerCase()
            .startsWith(`${process.env.PREFIX}${command}`.toLowerCase())
        ) {
          //Is command
          msg.arguments = msg.content.split(" ").slice(1);
          msg.channel.tempSend = (content, options = {}, time = 5000) => {
            return new Promise((resolve, reject) => {
              msg.channel.send(content, options).then((newMsg) => {
                Promise.all([
                  msg.delete({ timeout: time }),
                  newMsg.delete({ timeout: time }),
                ])
                  .then(() => {
                    resolve(true);
                  })
                  .catch((e) => {
                    reject(e);
                  });
              });
            });
          };
          msg.tempReply = (content, time = 5000) => {
            return msg.channel.tempSend(
              `<@${msg.author.id}>, ${content}`,
              {},
              time
            );
          };
          msg.checkPermission = (perm = "ADMINISTRATOR") => {
            return (msg.guild && msg.member.hasPermission(perm))
          }

          callback(msg);
        }
      };
    });
  }

  addModule(moduleName) {
    let modulePath = path.join(__dirname, "../modules", moduleName);
    this.log.info(`Initializing ${moduleName}`);
    try {
      //Init sql
      this.sql.addModule(moduleName)
        .catch(e => this.sql.log.error(`${moduleName} : ${e.message}`));

      //Init code
      let module = require(modulePath);
      this.modules.set(moduleName, module);
      Object.keys(module.Client).forEach((parameter) => {
        this.client.on(parameter, module.Client[parameter]);
      });
      if (module.Init) module.Init(this);
    } catch (error) {
      this.log.error("Module failed.\n" + error);
      this.log.info(error);
    }
    this.log.info(`Module ${moduleName} initialized`);
  }

  parseModules(moduleNames) {
    moduleNames.forEach((module) => {
      this.log.info(`Initializing ${module}`);
      this.addModule(module);
    });
  }

  login() {
    this.log.info("Logging into bot");
    return this.client.login(this.token);
  }
};
