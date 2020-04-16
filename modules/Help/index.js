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
        if (msg.arguments.length === 0) {
          //Just show module names
          let modules = sql.statements.Help.allModules.all();
          //Get unique array items
          modules.forEach((module) => {
            embed.addField(module.moduleName, module.description);
          });
          embed.setFooter(
            "Run the help command with a module name to see commands!"
          );
        } else {
          let commands = sql.statements.Help.allCommands.all({
            moduleName: msg.arguments.join(" "),
          });
          embed.setTitle(`${embed.title} | ⚙ ${msg.arguments[0]} ⚙`);
          if (commands.length === 0) {
            embed.addField("No commands!", "🤔");
          } else {
            commands.forEach((command) => {
              embed.addField(
                command.commandName,
                `${command.description}\n\`${
                  process.env.PREFIX + command.syntax
                }\``
              );
            });
          }
        }
        if (msg.channel.type !== "dm") {
          msg.tempReply("\nSent you a DM with details!").catch(debug.error);
        }
        msg.author.send(embed).catch(debug.error);
      });
    },
  },

  Init: (Bot) => {
    sql = Bot.sql;
  },
};
