const discord = require("discord.js");
const moment = require("moment")
const debug = require("log4js").getLogger("Bot:Events");
debug.level = process.env.DEBUG;
let Bot;

let updateEvent = (eventId, member = null) => {
  debug.info(`Updating event ${eventId}`);
  return new Promise((resolve, reject) => {
    Bot.sql.statements.Events.getEvent
      .run({
        messageId: eventId,
      })
      .then((res) => {
        res.rows.forEach((event) => {
          let signups = {
            eventees: [],
            alternatives: [],
          };
          Bot.sql.statements.Events.getSignups
            .run({
              eventId: eventId,
            })
            .then((res) => {
              res.rows.forEach((signup) => {
                if (signup.alternative) {
                  signups.alternatives.push(
                    Bot.client.users.fetch(signup.userid)
                  );
                } else {
                  signups.eventees.push(Bot.client.users.fetch(signup.userid));
                }
              });
              Promise.all(signups.eventees)
                .then((eventees) => {
                  let users = [];
                  eventees.forEach((eventee) => {
                    users.push(eventee.username);
                  });

                  Promise.all(signups.alternatives)
                    .then((alternatives) => {
                      let alts = [];
                      alternatives.forEach((alternative) => {
                        alts.push(alternative.username);
                      });

                      Bot.client.channels
                        .fetch(event.channelid)
                        .then((channel) => {
                          channel.messages
                            .fetch(eventId)
                            .then((message) => {
                              debug.info("constructing embed");

                              if (!message.embeds[0] && !member)
                                reject("Member not defined for new message");

                              let time = moment(event.time)

                              let embed =
                                message.embeds[0] ||
                                new discord.MessageEmbed()
                                  .setTitle(event.name)
                                  .setDescription(event.description)
                                  .setTimestamp(event.time)
                                  .setAuthor(member.displayName)
                                  .setFooter(
                                    `Created by ${member.displayName}`,
                                    member.user.displayAvatarURL
                                  )
                                  .addField(
                                    "Users Joined:",
                                    "ToBeChanged",
                                    true
                                  )
                                  .addField(
                                    "Alternatives:",
                                    "ToBeChanged",
                                    true
                                  )
                                  .addField(
                                    "ToBeChanged",
                                    `${time.format("Do MMM YYYY h:mm a")}`
                                  );
                              embed.fields[0].value =
                                users.join(", ") || "None";
                              embed.fields[1].value = alts.join(", ") || "None";
                              embed.fields[2].name = `${users.length}/${event.maxplayers}`;
                              message
                                .edit({
                                  content: "",
                                  embed: embed,
                                })
                                .then(resolve)
                                .catch(reject);
                            })
                            .catch(reject);
                        })
                        .catch(reject);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        });
      });
  });
};

module.exports = {
  Client: {
    message: (msg) => {
      msg.command("seteventboard", (msg) => {
        debug.info("setEventBoard command executing");
        if (!msg.checkPermission()) {
          msg.channel.tempSend(
            "You do not have permission to run this command"
          );
        } else {
          if (
            msg.arguments[0] &&
            msg.guild.channels.cache.has(msg.arguments[0]) &&
            msg.guild.channels.resolve(msg.arguments[0]).type === "text"
          ) {
            //delete old table data
            let sqlPromises = [
              Bot.sql.statements.Events.removeGuildSignups.run({
                guildId: msg.guild.id,
              }),
              Bot.sql.statements.Events.removeGuildEvents.run({
                guildId: msg.guild.id,
              }),
              Bot.sql.statements.Events.removeGuildBoard.run({
                guildId: msg.guild.id,
              }),
              //create the table
              Bot.sql.statements.Events.createEventBoard.run({
                guildId: msg.guild.id,
                channelId: msg.arguments[0],
              }),
            ];
            Promise.all(sqlPromises).catch(e => debug.error(e));
            msg.channel.tempSend("eventBoard set");
            debug.info(`New eventboard set for ${msg.guild.name}`);
          } else {
            msg.channel.tempSend("Invalid argument!");
          }
        }
      });

      msg.command("removeeventboard", (msg) => {
        debug.info("removeEventBoard command executing");
        if (!msg.checkPermission()) {
          msg.channel.tempSend(
            "You do not have permission to run this command"
          );
        } else {
          //delete old table data
          let sqlPromises = [
            Bot.sql.statements.Events.removeGuildSignups.run({
              guildId: msg.guild.id,
            }),
            Bot.sql.statements.Events.removeGuildEvents.run({
              guildId: msg.guild.id,
            }),
            Bot.sql.statements.Events.removeGuildBoard.run({
              guildId: msg.guild.id,
            }),
          ];
          Promise.all(sqlPromises)
            .catch(e => debug.error(e))
            .then(() => {
              msg.channel.tempSend("EventBoard removed");
              debug.info(`Removed the eventboard for ${msg.guild.name}`);
            });
        }
      });

      msg.command("postevent", (msg) => {
        debug.info("postEvent command executing");
        let channelId = Bot.sql.statements.Events.getEventBoard
          .run({
            guildId: msg.guild.id,
          })
          .then((res) => {
            channelId = res.rows[0];

            if (!channelId) {
              msg.channel.tempSend("There is no eventboard in this guild!");
              return;
            }
            channelId = channelId.channelid;

            let member = msg.member;
            let args = msg.arguments.join(" ").split("|");
            let name = args[0] || "No Name Set";
            let description = args[1] || "No Description Set";
            let timeArgs = args[2]
            let time = moment(timeArgs, "DD-MM-YYYY HH:mm A").toDate()
            let maxPlayers = Number(args[3] || 5);

            if (isNaN(time)) {
              msg.channel.tempSend(
                "Invalid Time! Ensure format of `DD-MM-YYYY HH:mm AM/PM`!"
              );
            } else if (isNaN(maxPlayers) || !Number.isInteger(maxPlayers)) {
              msg.channel.tempSend(
                "Invalid Max Players! Remember to have it as a integer!"
              );
            } else {
              msg.channel.tempSend(
                "Event Created!"
              )
              let channel = msg.guild.channels.resolve(channelId);
              channel
                .send("Creating Event... <:thonk:700285084900524112>")
                .then((msg) => {
                  msg.react("➕");
                  Bot.sql.statements.Events.addEvent
                    .run({
                      messageId: msg.id,
                      channelId: channel.id,
                      name: name,
                      description: description,
                      //Time should be DD-MM-YYYY MM:SS AM/PM
                      time: time,
                      maxPlayers: maxPlayers,
                    })
                    .then(() => {
                      updateEvent(msg.id, member /*Original member*/)
                        .catch(e => debug.error(e))
                    })
                    .catch(e => debug.error(e));
                });
            }
          });
      });
    },

    messageReactionAdd: (reaction, user) => {
      if (user.bot) return;
      if (reaction.emoji.toString() === "➕") {
        Bot.sql.statements.Events.getEvent
          .run({
            messageId: reaction.message.id,
          })
          .catch(e => debug.error(e))
          .then((res) => {
            res.rows.forEach(() => {
              Bot.sql.statements.Events.addSignup.run({
                userId: user.id,
                eventId: reaction.message.id,
              })
                .catch(e => debug.error(e))
                .then(() => {
                  updateEvent(reaction.message.id)
                    .catch(e => debug.error(e))
                  debug.info("Added event user");
                })
            });
          });
      }
    },

    messageReactionRemove: (reaction, user) => {
      if (user.bot) return;
      if (reaction.emoji.name === "➕") {
        Bot.sql.statements.Events.getEvent
          .run({
            messageId: reaction.message.id,
          })
          .catch(e => debug.error(e))
          .then((res) => {
            res.rows.forEach(() => {
              Bot.sql.statements.Events.removeSignup.run({
                userId: user.id,
                eventId: reaction.message.id,
              })
                .catch(e => debug.error(e))
                .then(() => {
                  updateEvent(reaction.message.id)
                    .catch(e => debug.error(e))
                  debug.info("Removed event user");
                })
            });
          });
      }
    },

    ready: () => {
      Bot.sql.statements.Events.getEvents.run().then((res) => {
        res.rows.forEach((event) => {
          try {
            Bot.client.channels
              .fetch(event.channelid)
              .then((c) => {
                c.messages
                  .fetch(event.messageid)
                  .then((msg) => {
                    let reaction = msg.reactions.resolve("➕");
                    reaction.users
                      .fetch()
                      .then((users) => {
                        users.forEach((user) => {
                          if (user.bot) return;
                          Bot.sql.statements.Events.addSignup
                            .run({
                              userId: user.id,
                              eventId: event.messageid,
                            })
                            .catch(e => debug.error(e))
                            .then(() => {
                              debug.info(
                                `Adding old reactor ${user.id} to event ${event.messageid}`
                              );
                            });
                        });
                        Bot.sql.statements.Events.getSignups
                          .run({
                            eventId: event.messageid,
                          })
                          .catch(e => debug.error(e))
                          .then((res) => {
                            let sqlPromises = [];
                            res.rows.forEach((signup) => {
                              if (!users.has(signup.userid)) {

                                sqlPromises.push(
                                  Bot.sql.statements.Events.removeSignup.run({
                                    userId: signup.userid,
                                    eventId: event.messageid,
                                  })
                                );
                              }
                            });
                            Promise.all(sqlPromises)
                              .then(() => {
                                updateEvent(event.messageid)
                                  .catch(e => debug.error(e));
                              })
                              .catch(e => debug.error(e));
                          });
                      })
                      .catch((e) => debug.warn(e));
                  })
                  .catch((e) =>
                    debug.warn(
                      `Could not find message! Assuming it has been deleted. ${e.msg}`
                    )
                  );
              })
              .catch((e) =>
                debug.warn(
                  `Could not find channel! Assuming it has been deleted. ${e}`
                )
              );
          } catch (e) {
            debug.warn(e);
          }
        });
      });
    },
  },

  Init: (bot) => {
    Bot = bot;

    Bot.client.setInterval(() => {
      if (Bot.client.uptime == 0) return;
      debug.info("Iteration executing");

      let events = {};
      Bot.sql.statements.Events.getExpiredEvents
        .run()
        .catch(e => debug.error(e))
        .then((res) => {
          res.rows.forEach((event) => {
            if (!events[event.messageid])
              events[event.messageid] = {
                name: event.name,
                channelId: event.eventboardid,
                joined: [],
                alts: [],
              };
            if (event.userid) {
              //If exists
              if (event.alternative) {
                events[event.messageid].alts.push(`<@${event.userid}>`);
              } else {
                events[event.messageid].joined.push(`<@${event.userid}>`);
              }
            }
          });
          Object.keys(events).forEach((eventKey) => {
            Bot.client.channels
              .fetch(events[eventKey].channelId)
              .then((channel) => {
                channel.messages
                  .fetch(eventKey)
                  .then((msg) => {
                    msg.delete().catch((e) => debug.warn(e));

                    let value = events[eventKey].joined.join(", ") || "None";
                    let aValue = events[eventKey].alts.join(", ") || "None";
                    channel
                      .send(
                        `Calling: ${value}\nFor ${events[eventKey].name}\nWith Alts: ${aValue}`
                      )
                      .then((m) => {
                        m.delete({
                          timeout: 5000 * 60, //5 min
                        });
                      })
                      .catch((e) => debug.warn(e));
                  })
                  .catch((e) => debug.warn(e));
              })
              .catch((e) => debug.warn(e));
          });
          //Delte expired
          Bot.sql.statements.Events.removeExpiredSignups.run();
          Bot.sql.statements.Events.removeExpiredEvents.run();
        });
    }, 5000); //repeat every 5 sec
  },
};


//NEED TO TEST!!!!