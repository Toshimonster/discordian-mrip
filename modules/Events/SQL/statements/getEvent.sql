SELECT
  events_eventBoards.channelId,
  events_events.messageId,
  events_events.name,
  events_events.description,
  events_events.time,
  events_events.maxPlayers
FROM events_events
INNER JOIN events_eventBoards ON events_eventBoards.channelId = events_events.eventBoardId
WHERE
  messageId = $messageId