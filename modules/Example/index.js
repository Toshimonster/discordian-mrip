const debug = require("log4js").getLogger("Bot:Example");
const discord = require("discord.js");
const util = require("util");
debug.level = process.env.DEBUG;
let Bot;

module.exports = {
  Client: {
    message: (msg) => {
      msg.command("ping", (msg) => {
        let time = Date.now();
        msg.channel
          .send("Pong")
          .then((msg) => msg.edit(`Pong ${Date.now() - time}ms`));
      })
      msg.command("eval", (msg) => {
        if (msg.author.id == 138679451322941440) {
          //Is me
          try {
            let evalu = eval(msg.arguments.join(" "));
            if (typeof evalu !== "string") {
              msg.channel.send(clean(util.inspect(evalu)), {code: "js"});
              if (evalu instanceof Promise) {
                evalu
                  .catch((err) => {
                    msg.channel.send(`**Catch**:\n\`\`\`js\n${clean(util.inspect(err))}\`\`\``)
                  })
                  .then((res) => {
                    msg.channel.send(`**Then**:\n\`\`\`js\n${clean(util.inspect(res))}\`\`\``)
                  })
              }
            } else {
              msg.channel.send(evalu)
            }
          } catch (error) {
            msg.channel.send(`**ERROR**:\n\`\`\`js\n${clean(error)}\`\`\``)
          }
        }
      })
      msg.command("sql", (msg) => {
        if (msg.author.id == 138679451322941440) {
          //Is me
          try {
            let evalu = Bot.sql.db.query(msg.arguments.join(" "))
              .then(evalu => {
                if (typeof evalu !== "string") {
                  msg.channel.send(clean(util.inspect(evalu.rows)), {code: "js"});
                } else {
                  msg.channel.send(evalu.rows)
                }
              })
              .catch(err => {
                msg.channel.send(`**ERROR**:\n\`\`\`js\n${clean(err)}\`\`\``)
              })
            
          } catch (error) {
            msg.channel.send(`**ERROR**:\n\`\`\`js\n${clean(error)}\`\`\``)
          }
        }
      })
    },
  },

  Init: (bot) => {
    Bot = bot;
  },
};

function clean(text) {
  if (typeof(text) !== 'string') {
      text = util.inspect(text, { depth: 0 });
  }
  text = text
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
      .replace(Bot.token, "<TOKEN>")
      .replace(process.env.DATABASE_URL, "<PG_URL>")
  
  if (text.length > 1800) {
    text = text.slice(0, 1800) + "\n\n ... "
  }

  return text
}