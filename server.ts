import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getDatabase, persistDatabase, StudentRecord } from "./src/server/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // Email regex validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone regex: must contain at least 7 to 15 digits
  const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

  // Helper function to map SQLite rows to typed objects
  function mapRows(results: any[]): StudentRecord[] {
    if (!results || results.length === 0) return [];
    const columns = results[0].columns;
    const values = results[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        obj[col] = row[index];
      });
      return obj as StudentRecord;
    });
  }

  // --- API Endpoints ---

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", service: "Student Management System REST API", db: "SQLite 3" });
  });

  // GET /api/stats - Statistics overview
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const db = await getDatabase();
      const allStudentsResult = db.exec("SELECT * FROM students ORDER BY id ASC;");
      const students = mapRows(allStudentsResult);
      const total = students.length;
      const courses = Array.from(new Set(students.map(s => s.course)));
      const avgAge = total > 0 ? (students.reduce((acc, curr) => acc + curr.age, 0) / total).toFixed(1) : 0;
      
      const courseCounts: Record<string, number> = {};
      students.forEach(s => {
        courseCounts[s.course] = (courseCounts[s.course] || 0) + 1;
      });

      res.json({
        totalStudents: total,
        totalCourses: courses.length,
        averageAge: Number(avgAge),
        courseBreakdown: courseCounts,
      });
    } catch (err: any) {
      console.error("Error in /api/stats:", err);
      res.status(500).json({ error: "Failed to retrieve statistics" });
    }
  });

  // GET /api/students and /api/students/ - Read all / Search
  const handleGetStudents = async (req: Request, res: Response) => {
    try {
      const db = await getDatabase();
      const search = (req.query.search as string || "").trim().toLowerCase();
      
      let query = "SELECT * FROM students";
      const params: any[] = [];

      if (search) {
        query += " WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(course) LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) LIKE ?";
        const wildcard = `%${search}%`;
        params.push(wildcard, wildcard, wildcard, wildcard, wildcard);
      }

      query += " ORDER BY id ASC;";
      
      const stmt = db.prepare(query);
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      const students: StudentRecord[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject() as any;
        students.push(row);
      }
      stmt.free();

      res.status(200).json(students);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Internal server error reading students from database." });
    }
  };

  app.get("/api/students", handleGetStudents);
  app.get("/api/students/", handleGetStudents);

  // GET /api/students/:id and /api/students/:id/ - Read one
  const handleGetStudentById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID. ID must be an integer." });
      }

      const db = await getDatabase();
      const rows = mapRows(db.exec(`SELECT * FROM students WHERE id = ${id};`));
      
      if (rows.length > 0) {
        return res.status(200).json(rows[0]);
      } else {
        return res.status(404).json({ error: `Student with ID ${id} not found.` });
      }
    } catch (err: any) {
      console.error("Error fetching student by ID:", err);
      res.status(500).json({ error: "Internal server error fetching student." });
    }
  };

  app.get("/api/students/:id", handleGetStudentById);
  app.get("/api/students/:id/", handleGetStudentById);

  // POST /api/students and /api/students/ - Create student
  const handleCreateStudent = async (req: Request, res: Response) => {
    try {
      const { name, email, phone, course, age } = req.body || {};

      // Server-side validations
      const errors: Record<string, string> = {};

      if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.name = "Name is required and must be at least 2 characters.";
      }

      if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        errors.email = "Valid email address is required (e.g. rahul@gmail.com).";
      }

      if (!phone || typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
        errors.phone = "Valid phone number is required (at least 7 digits).";
      }

      if (!course || typeof course !== "string" || course.trim().length === 0) {
        errors.course = "Course is required.";
      }

      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 100) {
        errors.age = "Age must be a valid number between 10 and 100.";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          error: "Validation failed.",
          details: errors,
          message: Object.values(errors)[0],
        });
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const cleanCourse = course.trim();

      const db = await getDatabase();

      // Check unique email
      const checkStmt = db.prepare("SELECT id FROM students WHERE LOWER(email) = ?;");
      checkStmt.bind([cleanEmail]);
      if (checkStmt.step()) {
        checkStmt.free();
        return res.status(400).json({
          error: "A student with this email address already exists.",
          field: "email",
          message: "A student with this email address already exists.",
        });
      }
      checkStmt.free();

      // Insert record
      db.run(
        "INSERT INTO students (name, email, phone, course, age) VALUES (?, ?, ?, ?, ?);",
        [cleanName, cleanEmail, cleanPhone, cleanCourse, parsedAge]
      );
      persistDatabase(db);

      // Get inserted record
      const createdRows = mapRows(
        db.exec(`SELECT * FROM students WHERE LOWER(email) = '${cleanEmail}' LIMIT 1;`)
      );
      const createdStudent = createdRows[0] || null;

      return res.status(201).json({
        message: "Student successfully added.",
        student: createdStudent,
      });
    } catch (err: any) {
      console.error("Error creating student:", err);
      res.status(500).json({ error: "Failed to create student in database." });
    }
  };

  app.post("/api/students", handleCreateStudent);
  app.post("/api/students/", handleCreateStudent);

  // PUT /api/students/:id and /api/students/:id/ - Update student
  const handleUpdateStudent = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID. ID must be an integer." });
      }

      const { name, email, phone, course, age } = req.body || {};

      // Validate inputs
      const errors: Record<string, string> = {};

      if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.name = "Name is required and must be at least 2 characters.";
      }

      if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        errors.email = "Valid email address is required.";
      }

      if (!phone || typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
        errors.phone = "Valid phone number is required.";
      }

      if (!course || typeof course !== "string" || course.trim().length === 0) {
        errors.course = "Course is required.";
      }

      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 100) {
        errors.age = "Age must be a valid number between 10 and 100.";
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          error: "Validation failed.",
          details: errors,
          message: Object.values(errors)[0],
        });
      }

      const db = await getDatabase();

      // Check if student exists
      const existStmt = db.prepare("SELECT id FROM students WHERE id = ?;");
      existStmt.bind([id]);
      if (!existStmt.step()) {
        existStmt.free();
        return res.status(404).json({ error: `Student with ID ${id} not found.` });
      }
      existStmt.free();

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const cleanCourse = course.trim();

      // Check duplicate email for another student
      const dupStmt = db.prepare("SELECT id FROM students WHERE LOWER(email) = ? AND id != ?;");
      dupStmt.bind([cleanEmail, id]);
      if (dupStmt.step()) {
        dupStmt.free();
        return res.status(400).json({
          error: "A student with this email address already exists.",
          field: "email",
          message: "A student with this email address already exists.",
        });
      }
      dupStmt.free();

      // Update student
      db.run(
        "UPDATE students SET name = ?, email = ?, phone = ?, course = ?, age = ? WHERE id = ?;",
        [cleanName, cleanEmail, cleanPhone, cleanCourse, parsedAge, id]
      );
      persistDatabase(db);

      const updatedRows = mapRows(db.exec(`SELECT * FROM students WHERE id = ${id};`));
      const updatedStudent = updatedRows[0] || null;

      return res.status(200).json({
        message: "Student information updated successfully.",
        student: updatedStudent,
      });
    } catch (err: any) {
      console.error("Error updating student:", err);
      res.status(500).json({ error: "Failed to update student in database." });
    }
  };

  app.put("/api/students/:id", handleUpdateStudent);
  app.put("/api/students/:id/", handleUpdateStudent);
  app.patch("/api/students/:id", handleUpdateStudent);
  app.patch("/api/students/:id/", handleUpdateStudent);

  // DELETE /api/students/:id and /api/students/:id/ - Delete student
  const handleDeleteStudent = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID. ID must be an integer." });
      }

      const db = await getDatabase();

      // Check if student exists
      const existStmt = db.prepare("SELECT id FROM students WHERE id = ?;");
      existStmt.bind([id]);
      if (!existStmt.step()) {
        existStmt.free();
        return res.status(404).json({ error: `Student with ID ${id} not found.` });
      }
      existStmt.free();

      db.run("DELETE FROM students WHERE id = ?;", [id]);
      persistDatabase(db);

      return res.status(200).json({
        message: "Student deleted successfully.",
        id,
      });
    } catch (err: any) {
      console.error("Error deleting student:", err);
      res.status(500).json({ error: "Failed to delete student from database." });
    }
  };

  app.delete("/api/students/:id", handleDeleteStudent);
  app.delete("/api/students/:id/", handleDeleteStudent);

  // POST /api/reset-demo - Restore sample demonstration data
  app.post("/api/reset-demo", async (req: Request, res: Response) => {
    try {
      const db = await getDatabase();
      db.run("DELETE FROM students;");
      db.run("DELETE FROM sqlite_sequence WHERE name='students';");
      db.run(`
        INSERT INTO students (id, name, email, phone, course, age) VALUES
        (1, 'Rahul Kumar', 'rahul@gmail.com', '9876543210', 'Computer Science', 20),
        (2, 'Priya Sharma', 'priya@gmail.com', '9876543211', 'Information Technology', 21),
        (3, 'Amit Patel', 'amit.patel@gmail.com', '9876543212', 'Electronics & Comm.', 22),
        (4, 'Sneha Reddy', 'sneha.reddy@gmail.com', '9876543213', 'Data Science', 19);
      `);
      persistDatabase(db);

      const all = mapRows(db.exec("SELECT * FROM students ORDER BY id ASC;"));
      res.status(200).json({
        message: "Demo database reset to default records successfully.",
        students: all,
      });
    } catch (err: any) {
      console.error("Error resetting demo:", err);
      res.status(500).json({ error: "Failed to reset demo data" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
