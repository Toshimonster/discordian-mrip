const { Client } = require('pg');
require("dotenv").config()
console.log(process.env.DATABASE_URL)
const client = new Client({
  connectionString: 'postgres://ytxzvfhgylsijw:590d9189f8caa22e8d979e751e9350dbc5739d5d8a28f381bd0d38ed22fabdf9@ec2-54-247-103-43.eu-west-1.compute.amazonaws.com:5432/dc72d8rdk9oohe',
  ssl: true
});

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});