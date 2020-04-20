const debug = require("log4js").getLogger("Bot:Example");
const discord = require("discord.js");
debug.level = process.env.DEBUG;
let Bot;

module.exports = {
  Client: {
    message: (msg) => {
      if (!msg.bot && msg.content == "ping") {
        let time = Date.now();
        msg.channel
          .send("Pong")
          .then((msg) => msg.edit(`Pong ${Date.now() - time}ms`));
      }
    },
  },

  Init: (bot) => {
    Bot = bot;
  },
};
