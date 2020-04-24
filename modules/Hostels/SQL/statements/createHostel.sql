--This is an example statement, to get all entries in the example table.
INSERT INTO hostels_hostels (
    channelId,
    roomName,
    guildId
) VALUES (
    $channelId,
    $roomName,
    $guildId
) ON CONFLICT(channelId) DO NOTHING;