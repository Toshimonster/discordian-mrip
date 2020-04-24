const debug = require("log4js").getLogger("Bot:Hostels");
debug.level = process.env.DEBUG;
let sql;
let Bot;

module.exports = {
  Client: {
    message: (msg) => {
      msg.command("makehostel", (msg) => {
        debug.info("makeHostel command executing");
        if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
          msg.channel.tempSend(
            "You do not have permission to run this command."
          );
        } else {
          if (
            msg.guild.channels.cache.has(msg.arguments[0]) &&
            msg.guild.channels.resolve(msg.arguments[0]).type === "voice"
          ) {
            sql.statements.Hostels.createHostel
              .run({
                channelId: msg.arguments[0],
                guildId: msg.guild.id,
                roomName:
                  msg.arguments.slice(2).join(" ") || "{displayName}'s room",
              })
              .catch((e) => debug.error(e));
            msg.channel.tempSend("Hostel Made!");
          } else {
            msg.channel.tempSend("Invalid argument!");
          }
        }
      });

      msg.command("removehostels", (msg) => {
        debug.info("removeHostels command executing");
        if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
          msg.channel.tempSend(
            "You do not have permission to run this command."
          );
        } else {
          sql.statements.Hostels.removeHostels
            .run({
              guildId: msg.guild.id,
            })
            .catch((e) => debug.error(e));
          msg.channel.tempSend("Done!");
        }
      });
    },

    voiceStateUpdate: (oState, nState) => {
      if (nState.channel) {
        //Joined Channel
        sql.statements.Hostels.getHostel
          .run({
            channelId: nState.channel.id,
            guildId: nState.guild.id,
          })
          .then((res) => {
            res.rows.forEach((data) => {
              let name = data.roomname;
              //Find all cases of {text} and replace with nState.member[text]
              name.match(/{(.*?)}/g).forEach((param) => {
                name = name.replace(param, nState.member[param.slice(1, -1)]);
              });

              nState.guild.channels
                .create(name, {
                  type: "voice",
                  position: nState.channel.position + 1,
                  parent: nState.channel.parent,
                  permissionOverwrites: [
                    {
                      id: nState.member.id,
                      allow: "MANAGE_CHANNELS",
                    },
                  ],
                  reason: "Hostel Module",
                })
                .then((channel) => {
                  nState.setChannel(channel).catch(e => debug.error(e));
                  sql.statements.Hostels.createActiveRoom.run({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                  })
                    .catch(e => debug.error(e));
                  debug.info(`Added ${channel.name}!`);
                });
            });
          });
      }
      if (oState.channel) {
        //Left Channel
        if (oState.channel.members.size === 0) {
          sql.statements.Hostels.getActiveRooms
            .run({
              channelId: oState.channel.id,
            })
            .catch(e => debug.warn(e))
            .then((res) => {
              res.rows.forEach((vc) => {
                oState.channel.delete().catch(e => debug.error(e));
                sql.statements.Hostels.removeActiveRoom.run({
                  channelId: oState.channel.id,
                })
                  .catch(e => debug.error(e))
              });
            })
        }
      }
    },

    ready: () => {
      sql.statements.Hostels.getAllActiveRooms.run()
        .then(res => {
          res.rows.forEach((room) => {
            Bot.client.channels
              .fetch(room.channelId)
              .then((channel) => {
                debug.info(`Deleting active Hostel room ${channel.id} if exists`);
                if (channel.members.size == 0) {
                  channel.delete();
                  sql.statements.Hostels.removeActiveRoom.run({
                    channelId: room.channelId,
                  })
                  . catch(e => debug.error(e))
                }
              })
              .catch(() => {
                sql.statements.Hostels.removeActiveRoom.run({
                  channelId: room.channelId,
                })
                  .catch(e => debug.error(e))
              });
          });
        })
    },
  },

  Init: (bot) => {
    sql = bot.sql;
    Bot = bot;
  },
};
