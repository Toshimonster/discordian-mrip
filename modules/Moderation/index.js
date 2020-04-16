const debug = require("log4js").getLogger("Bot:Moderator");
debug.level = process.env.DEBUG;
let Bot;

module.exports = {
  Client: {
    message: (msg) => {
      msg.command("purge", (msg) => {
        debug.info("purge Command Executing");
        if (
          msg.channel.type == "text" &&
          msg.checkPermission("MANAGE_MESSAGES")
        ) {
          if (Number(msg.arguments[0]) > 100 || Number(msg.arguments[0]) < 0)
            msg.arguments[0] = "100";
          msg.channel
            .bulkDelete(Number(msg.arguments[0]) || 100)
            .then((msgs) => {
              msg.channel.tempSend(`Purged ${msgs.size} messages!`);
            })
            .catch((e) => {
              debug.warn(e);
              msg.channel.tempSend(
                `Messages exist that are more than 2 weeks old!`
              );
            });
        } else {
          msg.tempReply("You do not have permission to run this command!");
        }
      });
    },
  },

  Init: (bot) => {
    Bot = bot;
  },
};
