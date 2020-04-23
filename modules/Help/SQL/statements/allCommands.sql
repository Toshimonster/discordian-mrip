--Requires moduleName
SELECT 
    commandName,
    description,
    syntax
FROM help_commands
WHERE moduleName = $moduleName ;