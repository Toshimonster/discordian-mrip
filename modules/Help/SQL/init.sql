--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS help_help (
    --Snowflakes (discord id's) are 18 characters/digits long.
    moduleName VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100),
    hidden BOOLEAN DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS help_commands (
    commandName VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100),
    syntax VARCHAR(100),
    moduleName VARCHAR(20)
);

--Help command
INSERT INTO help_help (
    moduleName,
    description
) VALUES (
    'Help',
    'Provides the `help` command'
) ON CONFLICT(moduleName) DO NOTHING;

--Help commands
INSERT INTO help_commands (
    commandName,
    description,
    syntax,
    moduleName
) VALUES (
    'Help',
    'Displays help on modules',
    'help {moduleName}',
    'Help'
) ON CONFLICT(commandName) DO NOTHING;
