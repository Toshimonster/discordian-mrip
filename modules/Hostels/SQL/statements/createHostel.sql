--This is an example statement, to get all entries in the example table.
INSERT OR IGNORE INTO hostels_hostels (
    channelId,
    roomName,
    guildId
) VALUES (
    $channelId,
    $roomName,
    $guildId
);