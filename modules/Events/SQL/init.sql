--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS events_eventBoards (
    channelId TEXT(18) UNIQUE PRIMARY KEY,
    guildId TEXT(18) UNIQUE
);

CREATE TABLE IF NOT EXISTS events_events (
    messageId TEXT(18) PRIMARY KEY,
    eventBoardId TEXT(18),
    -- events_eventBoards.channelId
    name TEXT(30),
    description TEXT(100),
    time DATETIME,
    maxPlayers INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events_signups (
    userId TEXT(18),
    eventId TEXT(18),
    -- events_events.messageId
    alternative BOOLEAN,
    PRIMARY KEY (userId, eventId)
);

--Help command
INSERT
    OR IGNORE INTO help_help (moduleName, description)
VALUES
    (
        'Events',
        'Provides event functionality!'
    );

--Help commands
INSERT
    OR IGNORE INTO help_commands (
        commandName,
        description,
        syntax,
        moduleName
    )
VALUES
    (
        'setEventBoard',
        'Set a text channel as the event board for the guild',
        'setEventBoard {textChannelId}',
        'Events'
    ),
    (
        'removeEventBoard',
        'Deletes the event board from the guild',
        'removeEventBoard',
        'Events'
    ),
    (
        'postEvent',
        'Posts an event to the guilds event board',
        'postEvent {name}|{description}|{dd/mm/yyyy hh/mm}|{max players}',
        'Events'
    );