--Make sure to name the table with {modulename}:{tablename}, to ensure no conflicts.
CREATE TABLE IF NOT EXISTS example_example (
    --Snowflakes (discord id's) are 18 characters/digits long.
    exampleColumnId TEXT(18) PRIMARY KEY
);