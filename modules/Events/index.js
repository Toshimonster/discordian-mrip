const discord = require("discord.js");
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
                    Bot.client.users.fetch(signup.userId)
                  );
                } else {
                  signups.eventees.push(Bot.client.users.fetch(signup.userId));
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
                        .fetch(event.channelId)
                        .then((channel) => {
                          channel.messages
                            .fetch(eventId)
                            .then((message) => {
                              debug.info("constructing embed");

                              if (!message.embeds[0] && !member)
                                reject("Member not defined for new message");

                              //From YYYY-DD-MM HH-MM
                              //To   YYYY-DD-MM HH:MM
                              let time = event.time;
                              time = time.split(" ");
                              time[1] = time[1].replace("-", ":");
                              time = new Date(time.join(" "));

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
                                    `Time ${time.toLocaleDateString("en-GB", {
                                      hour: "numeric",
                                      minute: "numeric",
                                    })}`
                                  );
                              embed.fields[0].value =
                                users.join(", ") || "None";
                              embed.fields[1].value = alts.join(", ") || "None";
                              embed.fields[2].name = `${users.length}/${event.maxPlayers}`;
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
            Promise.all(sqlPromises).catch(debug.error);
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
            .catch(debug.error)
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
            channelId = channelId.channelId;

            let member = msg.member;
            let args = msg.arguments.join(" ").split("|");
            let name = args[0] || "No Name Set";
            let description = args[1] || "No Description Set";
            let timeArgs = args[2].split(" ");
            let dateTime = timeArgs[0].split("/"); //dd/mm/yyyy
            let timeStamp = timeArgs[1].split("/"); //hh/mm
            let time = new Date(
              Number(dateTime[2]),
              Number(dateTime[1] - 1),
              Number(dateTime[0]),
              Number(timeStamp[0]),
              Number(timeStamp[1])
            );
            let maxPlayers = Number(args[3] || 5);

            if (isNaN(time)) {
              msg.channel.tempSend(
                "Invalid Time! Ensure format of `dd/mm/yyyy hh/mm`!"
              );
            } else if (isNaN(maxPlayers) || !Number.isInteger(maxPlayers)) {
              msg.channel.tempSend(
                "Invalid Max Players! Remember to have it as a integer!"
              );
            } else {
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
                      time: `${dateTime[2]}-${dateTime[1]}-${dateTime[0]} ${timeStamp[0]}-${timeStamp[1]}`,
                      maxPlayers: maxPlayers,
                    })
                    .then(() => {
                      updateEvent(msg.id, member /*Original member*/);
                    })
                    .catch(debug.error);
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
          .catch(debug.error)
          .then((res) => {
            res.rows.forEach(() => {
              Bot.sql.statements.Events.addSignup.run({
                userId: user.id,
                eventId: reaction.message.id,
              });
              updateEvent(reaction.message.id);
              debug.info("Added event user");
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
          .catch(debug.error)
          .then((res) => {
            res.rows.forEach(() => {
              Bot.sql.statements.Events.removeSignup.run({
                userId: user.id,
                eventId: reaction.message.id,
              });
              updateEvent(reaction.message.id);
              debug.info("Removed event user");
            });
          });
      }
    },

    ready: () => {
      Bot.sql.statements.Events.getEvents.run().then((res) => {
        res.rows.forEach((event) => {
          try {
            Bot.client.channels
              .fetch(event.channelId)
              .then((c) => {
                c.messages
                  .fetch(event.messageId)
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
                              eventId: event.messageId,
                            })
                            .catch(debug.error)
                            .then(() => {
                              debug.info(
                                `Adding old reactor ${user.id} to event ${event.messageId}`
                              );
                            });
                        });
                        let removedUsers = [];
                        Bot.sql.statements.Events.getSignups
                          .run({
                            eventId: event.messageId,
                          })
                          .catch(debug.error)
                          .then((res) => {
                            let sqlPromises = [];
                            res.rows.forEach((signup) => {
                              if (!users.has(signup.userId)) {
                                sqlPromises.push(
                                  Bot.sql.statements.Events.removeSignup.run({
                                    userId: signup.userId,
                                    eventId: event.messageId,
                                  })
                                );
                              }
                            });
                            Promise.all(sqlPromises)
                              .then(() => {
                                updateEvent(event.messageId);
                              })
                              .catch(debug.error);
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
                  `Could not find channel! Assuming it has been deleted.${e.msg}`
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
        .catch(debug.error)
        .then((res) => {
          res.rows.forEach((event) => {
            if (!events[event.messageId])
              events[event.messageId] = {
                name: event.name,
                channelId: event.eventBoardId,
                joined: [],
                alts: [],
              };
            if (event.userId) {
              //If exists
              if (event.alternative) {
                events[event.messageId].alts.push(`<@${event.userId}>`);
              } else {
                events[event.messageId].joined.push(`<@${event.userId}>`);
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