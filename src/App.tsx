import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { StudentForm } from "./components/StudentForm";
import { StudentList } from "./components/StudentList";
import { StudentDetailModal } from "./components/StudentDetailModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { ApiTestRunner } from "./components/ApiTestRunner";
import { ArchitectureModal } from "./components/ArchitectureModal";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  resetDemoData,
  fetchStats,
  ApiError,
} from "./api/client";
import { Student, StudentFormData, SystemStats } from "./types";
import { CheckCircle2, AlertCircle, Info, Database, Layers, Terminal, Sparkles } from "lucide-react";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<"app" | "tester">("app");
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  // Load records and statistics from API
  const loadData = useCallback(async (query = "") => {
    try {
      setIsLoading(true);
      const [studentsData, statsData] = await Promise.all([
        fetchStudents(query),
        fetchStats().catch(() => null),
      ]);
      setStudents(studentsData);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      console.error("Error loading student data:", err);
      showToast(err.message || "Failed to connect to backend", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, loadData]);

  // Handle Create or Update Student
  const handleFormSubmit = async (formData: StudentFormData): Promise<boolean> => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (editingStudent) {
        // PUT /api/students/:id/
        const res = await updateStudent(editingStudent.id, formData);
        showToast(res.message || "Student information updated successfully.", "success");
        setEditingStudent(null);
      } else {
        // POST /api/students/
        const res = await createStudent(formData);
        showToast(res.message || "Student successfully added.", "success");
      }

      await loadData(searchQuery);
      return true;
    } catch (err: any) {
      console.error("Form submission error:", err);
      setServerError(err.message || "Operation failed. Please verify your inputs.");
      showToast(err.message || "Failed to save student", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);

    try {
      const res = await deleteStudent(deletingStudent.id);
      showToast(res.message || "Student deleted successfully.", "success");
      if (editingStudent?.id === deletingStudent.id) {
        setEditingStudent(null);
      }
      setDeletingStudent(null);
      await loadData(searchQuery);
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete student", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Reset Demo Data
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await resetDemoData();
      showToast(res.message || "Demo records restored successfully.", "info");
      setEditingStudent(null);
      setSearchQuery("");
      await loadData("");
    } catch (err: any) {
      console.error("Reset error:", err);
      showToast("Failed to reset database", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-indigo-50 border-indigo-300 text-indigo-800"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-indigo-600 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        stats={stats}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        onOpenApiTester={() => setActiveView("tester")}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === "app" ? (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
                  <p className="text-xl font-black text-indigo-600 mt-0.5">{stats.totalStudents} Students</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unique Courses</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{stats.totalCourses} Departments</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Age</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{stats.averageAge} Years</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Database</p>
                    <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">SQLite 3 (db.sqlite3)</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            )}

            {/* Split Grid: Left Form, Right Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Student Form */}
              <div className="lg:col-span-5 sticky top-20">
                <StudentForm
                  editingStudent={editingStudent}
                  onSubmit={handleFormSubmit}
                  onCancelEdit={() => setEditingStudent(null)}
                  isSubmitting={isSubmitting}
                  serverError={serverError}
                  existingEmails={students.map((s) => s.email)}
                />
              </div>

              {/* Right Column: Student Table */}
              <div className="lg:col-span-7">
                <StudentList
                  students={students}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onEdit={(student) => {
                    setEditingStudent(student);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDelete={(student) => setDeletingStudent(student)}
                  onView={(student) => setViewingStudent(student)}
                  activeEditId={editingStudent?.id || null}
                />
              </div>
            </div>
          </div>
        ) : (
          /* API Testing Suite & Postman Console */
          <div className="space-y-6">
            <ApiTestRunner onRefreshRecords={() => loadData(searchQuery)} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Student Management System</span>
            <span>•</span>
            <span>React & SQLite Full-Stack CRUD</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Endpoints: GET, POST, PUT, DELETE /api/students/</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentDetailModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(student) => {
          setEditingStudent(student);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <DeleteConfirmModal
        student={deletingStudent}
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
