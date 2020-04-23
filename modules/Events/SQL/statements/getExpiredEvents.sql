SELECT
  events_events.messageId,
  events_events.eventBoardId,
  events_events.name,
  events_signups.userId,
  events_signups.alternative
FROM events_events
LEFT JOIN events_signups ON events_signups.eventId = events_events.messageId
WHERE
  events_events.time < NOW();