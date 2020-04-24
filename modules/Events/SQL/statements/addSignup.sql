INSERT INTO events_signups (userId, eventId, alternative)
VALUES
  (
    $userId,
    $eventId,
    (
      SELECT
        COALESCE(
          COUNT(userId),
          0
        ) >= (
          SELECT
            maxPlayers
          FROM events_events
          WHERE
            messageId = $eventId
        )
      FROM events_signups
      WHERE
        eventId = $eventId
    )
  )
  ON CONFLICT(userId, eventId) DO NOTHING;