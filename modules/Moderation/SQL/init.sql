--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
--Help command
INSERT INTO help_help (
    moduleName,
    description
) VALUES (
    'Moderation',
    'Provides the Moderation tools'
) ON CONFLICT(moduleName) DO NOTHING;

--Help commands
INSERT INTO help_commands (
    commandName,
    description,
    syntax,
    moduleName
) VALUES (
    'Purge',
    'Purges messages in a channel',
    'Purge {numberOfMessages or 500}',
    'Moderation'
) ON CONFLICT(commandName) DO NOTHING;
