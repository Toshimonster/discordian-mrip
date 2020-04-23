--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS receptions_roleDefs (
    roleId VARCHAR(18) PRIMARY KEY,
    guildId VARCHAR(18)
);

--Help command
INSERT INTO help_help (
    moduleName,
    description
) VALUES (
    'Receptions',
    'Provides a reception functionality to guilds; setting up new member events'
) ON CONFLICT(moduleName) DO NOTHING;

--Help commands
INSERT INTO help_commands (
    commandName,
    description,
    syntax,
    moduleName
) VALUES (
    'addNewRole',
    'Add a new role to give to new members',
    'addNewRole {roleId}',
    'Receptions'
), (
    'removeNewRoles',
    'Remove all new roles set by this module',
    'removeAllRoles',
    'Receptions'
) ON CONFLICT(moduleName) DO NOTHING;