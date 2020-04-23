const debug = require("log4js").getLogger("Bot:Help");
debug.level = process.env.DEBUG;
const discord = require("discord.js");
let sql;

module.exports = {
  Client: {
    message: (msg) => {
      msg.command("help", (msg) => {
        debug.info("Help Command Executing");
        let embed = new discord.MessageEmbed().setTitle("❓ Help ❓");
        let promises = [];
        if (msg.arguments.length === 0) {
          //Just show module names
          let p = sql.statements.Help.allModules.run().then((res) => {
            //Get unique array items
            res.rows.forEach((module) => {
              console.log(module)
              embed.addField(module.modulename, module.description);
            });
            embed.setFooter(
              "Run the help command with a module name to see commands!"
            );
          });
          //Push to promise array
          promises.push(p);
        } else {
          let p = sql.statements.Help.allCommands
            .run({
              moduleName: msg.arguments.join(" "),
            })
            .then((res) => {
              embed.setTitle(`${embed.title} | ⚙ ${msg.arguments[0]} ⚙`);
              if (res.rows.length === 0) {
                embed.addField("No commands!", "🤔");
              } else {
                res.rows.forEach((command) => {
                  embed.addField(
                    command.commandname,
                    `${command.description}\n\`${
                      process.env.PREFIX + command.syntax
                    }\``
                  );
                });
              }
            });

          promises.push(p);
        }
        if (msg.channel.type !== "dm") {
          msg.tempReply("\nSent you a DM with details!").catch(debug.error);
        }
        Promise.all(promises)
          .then(() => {
            msg.author.send(embed).catch(debug.error);
          })
      });
    },
  },

  Init: (Bot) => {
    sql = Bot.sql;
  },
};
