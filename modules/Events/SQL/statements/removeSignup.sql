DELETE FROM events_signups
WHERE
  userId = $userId
  AND eventId = $eventId