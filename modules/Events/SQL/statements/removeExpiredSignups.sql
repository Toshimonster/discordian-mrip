DELETE FROM events_signups
WHERE
  eventId IN (
    SELECT
      messageId AS eventId
    FROM events_events
    WHERE
      time < datetime('now', 'localtime')
  )