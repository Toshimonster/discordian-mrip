--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS events_eventBoards (
    channelId VARCHAR(18) UNIQUE PRIMARY KEY,
    guildId VARCHAR(18) UNIQUE
);

CREATE TABLE IF NOT EXISTS events_events (
    messageId VARCHAR(18) PRIMARY KEY,
    eventBoardId VARCHAR(18),
    -- events_eventBoards.channelId
    name VARCHAR(30),
    description VARCHAR(100),
    time TIMESTAMP WITH TIME ZONE,
    maxPlayers INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS events_signups (
    userId VARCHAR(18),
    eventId VARCHAR(18),
    -- events_events.messageId
    alternative BOOLEAN,
    PRIMARY KEY (userId, eventId)
);

--Help command
INSERT INTO help_help (moduleName, description)
VALUES
    (
        'Events',
        'Provides event functionality!'
    )
ON CONFLICT(moduleName) DO NOTHING;

--Help commands
INSERT INTO help_commands (
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
    )
ON CONFLICT(commandName) DO NOTHING;