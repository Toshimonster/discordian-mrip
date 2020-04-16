const fs = require("fs");
const path = require("path");

module.exports = class Sql {
  constructor(location = "./Sql/db.sqlite3") {
    this.db = new require("better-sqlite3")(location);
    this.statements = {};

    this.log = require("log4js").getLogger("Sql");
    this.log.level = process.env.DEBUG;

    process.on("exit", () => this.db.close());

    this.log.info("Sql class initialized");
  }

  exec(file) {
    this.log.info(`Executing sql file ${file}`);

    this.db.exec(fs.readFileSync(file, "utf-8"));
  }

  addModule(moduleName) {
    this.log.info(`Initializing ${moduleName}`);

    const directory = path.join(__dirname, "../modules", moduleName, "SQL");
    const initFile = path.join(directory, "init.sql");
    const stmtsDir = path.join(directory, "statements");

    if (fs.existsSync(directory)) {
      if (fs.existsSync(initFile)) {
        this.exec(initFile);
      }

      if (fs.existsSync(stmtsDir)) {
        this.statements[moduleName] = {};
        fs.readdirSync(stmtsDir).forEach((stmtFile) => {
          this.log.info(
            `Parsing statement in module ${moduleName}: ${stmtFile}`
          );
          this.statements[moduleName][
            stmtFile.replace(".sql", "")
          ] = this.db.prepare(
            fs.readFileSync(path.join(stmtsDir, stmtFile), "utf-8")
          );
        });
      }
    }

    this.log.info(`Finished sql init for ${moduleName}`);
  }
};
