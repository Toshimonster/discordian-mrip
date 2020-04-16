--This is an example statement, to get all entries in the example table.
--This will be accessable in sql.statements.Example.exampleStatement
DELETE FROM events_events
WHERE
  eventBoardId IN (
    SELECT
      channelId
    FROM events_eventBoards
    WHERE
      guildId = $guildId
  )