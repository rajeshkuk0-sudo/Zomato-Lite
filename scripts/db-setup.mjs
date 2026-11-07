import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is missing. Put it in .env.local and try again.");
  process.exit(1);
}

const sql = neon(url);
const schemaPath = new URL("../db/schema.sql", import.meta.url);
const schema = await readFile(schemaPath, "utf8");

const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Applied ${statements.length} SQL statements from db/schema.sql.`);
