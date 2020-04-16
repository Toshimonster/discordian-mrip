const debug = require("log4js").getLogger("Bot:Receptions");
debug.level = process.env.DEBUG;
let Bot = "";

module.exports = {
  Client: {
    message: (msg) => {
      msg.command("addnewrole", (msg) => {
        debug.info("addNewRoles Command Executing");
        if (!msg.checkPermission()) {
          msg.channel.tempSend(
            "You do not have permission to run this command!"
          );
        } else {
          if (msg.guild.roles.cache.has(msg.arguments[0])) {
            Bot.sql.statements.Receptions.addRole.run({
              guildId: msg.guild.id,
              roleId: msg.arguments[0],
            });
            msg.tempReply("Done!");
          } else {
            msg.channel.tempSend("Invalid argument!");
          }
        }
      });

      msg.command("removenewroles", (msg) => {
        debug.info("removeNewRoles Command Executing");
        if (!msg.checkPermission()) {
          msg.channel.tempSend(
            "You do not have permission to run this command!"
          );
        } else {
          Bot.sql.statements.Receptions.removeRoles.run({
            guildId: msg.guild.id,
          });
          msg.tempReply("Done!");
        }
      });
    },

    guildMemberAdd: (member) => {
      if (!member.bot) {
        let roles = [];
        Bot.sql.statements.Receptions.getRoles
          .all({
            guildId: member.guild.id,
          })
          .forEach((roleDat) => {
            roles.push(roleDat.roleId);
          });
        debug.info(
          `Adding ${roles.join(", ") || "No"} Role(s) from guild ${
            member.guild.id
          }`
        );
        if (roles.length != 0) {
          member.roles.add(roles).catch(debug.warn);
        }
      }
    },
  },

  Init: (bot) => {
    Bot = bot;
  }
};
