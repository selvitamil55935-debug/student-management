import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

let dbInstance: Database | null = null;
const DB_FILE = path.join(process.cwd(), "db.sqlite3");

export interface StudentRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  course: string;
  age: number;
  created_at?: string;
}

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn("Could not load existing db.sqlite3, creating new one:", err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create table if it doesn't exist
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      course TEXT NOT NULL,
      age INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if we need to seed the required initial students (Rahul Kumar and Priya Sharma)
  const countResult = dbInstance.exec("SELECT COUNT(*) as count FROM students;");
  const count = countResult[0]?.values[0]?.[0] as number ?? 0;

  if (count === 0) {
    dbInstance.run(`
      INSERT INTO students (name, email, phone, course, age) VALUES
      ('Rahul Kumar', 'rahul@gmail.com', '9876543210', 'Computer Science', 20),
      ('Priya Sharma', 'priya@gmail.com', '9876543211', 'Information Technology', 21),
      ('Amit Patel', 'amit.patel@gmail.com', '9876543212', 'Electronics & Comm.', 22),
      ('Sneha Reddy', 'sneha.reddy@gmail.com', '9876543213', 'Data Science', 19);
    `);
    persistDatabase(dbInstance);
  }

  return dbInstance;
}

export function persistDatabase(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("Failed to save db.sqlite3 to disk:", err);
  }
}
