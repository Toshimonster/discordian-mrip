DELETE FROM events_events
WHERE
  time < NOW();