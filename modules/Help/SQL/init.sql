--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS help_help (
    --Snowflakes (discord id's) are 18 characters/digits long.
    moduleName TEXT(20) PRIMARY KEY,
    description TEXT(100),
    hidden BOOLEAN DEFAULT 0
);
CREATE TABLE IF NOT EXISTS help_commands (
    commandName TEXT(20) PRIMARY KEY,
    description TEXT(100),
    syntax TEXT(100),
    moduleName TEXT(20)
);

DELETE FROM help_help;
DELETE FROM help_commands;

--Help command
INSERT OR IGNORE INTO help_help (
    moduleName,
    description
) VALUES (
    'Help',
    'Provides the `help` command'
);

--Help commands
INSERT OR IGNORE INTO help_commands (
    commandName,
    description,
    syntax,
    moduleName
) VALUES (
    'Help',
    'Displays help on modules',
    'help {moduleName}',
    'Help'
);
