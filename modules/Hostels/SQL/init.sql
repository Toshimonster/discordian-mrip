--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS hostels_hostels (
    channelId TEXT(18) PRIMARY KEY,
    roomName TEXT(100),
    guildId TEXT(18)
);

CREATE TABLE IF NOT EXISTS hostels_activeRooms (
    channelId TEXT(18) PRIMARY KEY,
    hostelId TEXT(18) -- hostels_hostels.channelId
);

--Help command
INSERT OR IGNORE INTO help_help (
    moduleName,
    description
) VALUES (
    'Hostels',
    'Provides hostel functionalities.'
);

--Help commands
INSERT OR IGNORE INTO help_commands (
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
);