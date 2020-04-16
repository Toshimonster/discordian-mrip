DELETE FROM events_events
WHERE
  time < datetime('now', 'localtime');