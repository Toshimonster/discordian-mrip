--This is an example statement, to get all entries in the example table.
--This will be accessable in sql.statements.Example.exampleStatement
DELETE FROM events_signups
WHERE
  eventId IN (
    SELECT
      messageId
    FROM events_events
    INNER JOIN events_eventBoards ON events_eventBoards.channelId = events_events.eventBoardId
    WHERE
      events_eventBoards.guildId = $guildId
  )