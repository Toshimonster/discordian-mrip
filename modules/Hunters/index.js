const debug = require("log4js").getLogger("Bot:Hunters");
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

  GenerateEmbed: (data) => {
    return new Promise((resolve, reject) => {
      Bot.client.users.fetch(data.userId)
        .then((user) => {
          let embed = discord.MessageEmbed()
            .setTitle(`${data.hunterName || "Hunter"}'s Deeds`)
            .setDescription(`With their trusty pal, ${data.palicoName || "Palico"}!`)
            .addField(
              `And their wonderous ${data.mainWeapon || "very large stick"} skills!`,
              `HR: ${data.HR}\nMR: ${data.MR}`
            )
            .setFooter(`${user.username}'s Profile`)
          resolve(embed)
        })
        .catch(reject)
    })
  },

  Init: (bot) => {
    Bot = bot;
  },
};
