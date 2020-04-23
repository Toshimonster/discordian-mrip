--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS hostels_hostels (
    channelId VARCHAR(18) PRIMARY KEY,
    roomName VARCHAR(100),
    guildId VARCHAR(18)
);

CREATE TABLE IF NOT EXISTS hostels_activeRooms (
    channelId VARCHAR(18) PRIMARY KEY,
    hostelId VARCHAR(18) -- hostels_hostels.channelId
);

--Help command
INSERT INTO help_help (
    moduleName,
    description
) VALUES (
    'Hostels',
    'Provides hostel functionalities.'
) ON CONFLICT(moduleName) DO NOTHING;

--Help commands
INSERT INTO help_commands (
    commandName,
    description,
    syntax,
    moduleName
) VALUES (
    'makeHostel',
    'Make a voice channel a hostel',
    'makeHostel {voiceChannel_id}',
    'Hostels'
),
(
    'removeHostel',
    'remove all hostels in the guild',
    'removeHostel',
    'Hostels'
) ON CONFLICT(moduleName) DO NOTHING;