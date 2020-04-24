const fs = require("fs");
const path = require("path");
const postgres = require("pg")

class Stmt {
    constructor(query, moduleName, name, parent) {
        this.parent = parent
        this.query = query
        this.moduleName
        this.name = name
        this.log = require("log4js").getLogger(`Sql:${moduleName}:${name}`)
        this.log.level = process.env.DEBUG
    }

    exec(parameters=[]) {
        this.log.info(`Running SQL`)
        return this.parent.db.query(this.query, parameters)
    }

    run(parameters={}) {

      this.log.info(`Running SQL`)
      return new Promise((resolve, reject) => {
        let temp = this.query
        let arr = []

        let matched = temp.match(/\$[^ ,)\n]+/g) || []
        matched.forEach(key => {
          let value = parameters[key.slice(1)]
          if (!value) {
            this.log.error("Key does not exist:")
            reject(`Expected key ${key.slice(1)}, but does not exist`)
          }
          temp = temp.replace(key, `$${arr.length + 1}`)
          arr.push(value)
        })


        this.parent.db.query(temp, arr)
          .then(resolve)
          .catch(reject)
      })
    }
}

class Sql {
  constructor(databaseURI = process.env.DATABASE_URL) {
    this.db = new postgres.Pool({
      connectionString: databaseURI,
      ssl: !process.env.DB_NOT_SSL,
    });
    this.statements = {};

    this.db.connect();

    this.log = require("log4js").getLogger("Sql");
    this.log.level = process.env.DEBUG

    process.on("beforeExit", this.db.end);

    this.log.info("Sql class initialized");
  }

  exec(file) {
    this.log.info(`Executing sql file ${file}`)
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) reject(err);
        resolve(this.db.query(data.toString()));
      });
    });
  }

  addModule(moduleName) {
    return new Promise((resolve, reject) => {
      this.log.info(`Initializing ${moduleName}`);

      const directory = path.join(__dirname, "../modules", moduleName, "SQL");
      const initFile = path.join(directory, "init.sql");
      const stmtsDir = path.join(directory, "statements");

      if (fs.existsSync(directory)) {
        if (fs.existsSync(stmtsDir)) {
          this.statements[moduleName] = {};
          fs.readdirSync(stmtsDir).forEach((stmtFile) => {
            this.log.info(
              `Parsing statement in module ${moduleName}: ${stmtFile}`
            );
            this.statements[moduleName][
              stmtFile.replace(".sql", "")
            ] = new Stmt(
                fs.readFileSync(path.join(stmtsDir, stmtFile), "utf-8"),
                moduleName,
                stmtFile.replace(".sql", ""),
                this
            )
          });
        }

        if (fs.existsSync(initFile)) {
          this.exec(initFile).catch(reject).then(resolve)
          .catch(reject);
        }
      }
    });
  }
}

module.exports = Sql;