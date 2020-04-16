SELECT
    hostels_activeRooms.channelId,
    hostels_hostels.guildId
FROM hostels_activeRooms
INNER JOIN hostels_hostels ON
hostels_activeRooms.hostelId = hostels_hostels.channelId