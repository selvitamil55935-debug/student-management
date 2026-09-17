import React, { useState, useMemo } from "react";
import { Search, Edit2, Trash2, Eye, X, Filter, ArrowUpDown, Phone, Mail, BookOpen, AlertCircle } from "lucide-react";
import { Student } from "../types";

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
  activeEditId: number | null;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  isLoading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onView,
  activeEditId,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"id_asc" | "id_desc" | "name_asc" | "age_asc">("id_asc");

  // Get unique courses for filter dropdown
  const courses = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.course))).filter(Boolean);
    return list.sort();
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        if (selectedCourse !== "ALL" && student.course !== selectedCourse) {
          return false;
        }
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(q) ||
          student.email.toLowerCase().includes(q) ||
          student.course.toLowerCase().includes(q) ||
          student.phone.includes(q) ||
          String(student.id).includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "id_asc") return a.id - b.id;
        if (sortBy === "id_desc") return b.id - a.id;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "age_asc") return a.age - b.age;
        return 0;
      });
  }, [students, selectedCourse, searchQuery, sortBy]);

  // Color generator for course badges
  const getCourseBadgeColor = (course: string) => {
    const c = course.toLowerCase();
    if (c.includes("computer") || c.includes("cse")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (c.includes("information") || c.includes("it")) {
      return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (c.includes("data")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (c.includes("electronic")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (c.includes("mech")) {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-student-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Student: Name, Email, Course, ID..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2">
            {/* Course Filter */}
            <div className="relative">
              <select
                id="filter-course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="text-xs bg-white py-2 pl-2.5 pr-7 rounded-lg border border-slate-300 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 cursor-pointer appearance-none"
              >
                <option value="ALL">All Courses ({students.length})</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                id="sort-student-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-white py-2 pl-2.5 pr-7 rounded-lg border border-slate-300 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 cursor-pointer appearance-none"
              >
                <option value="id_asc">ID: Low to High</option>
                <option value="id_desc">ID: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="age_asc">Age: Youngest First</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status line */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
          <span>
            Showing <strong className="text-slate-700">{filteredStudents.length}</strong> of{" "}
            <strong className="text-slate-700">{students.length}</strong> students
          </span>
          {searchQuery && (
            <span className="text-indigo-600 font-medium">
              Filtered by: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-16">ID</th>
              <th className="py-3 px-4">Student Info</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4 w-16 text-center">Age</th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
                    Loading student records...
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No student records found</p>
                    <p className="text-xs text-slate-400">
                      {searchQuery
                        ? `No students match "${searchQuery}". Clear your search query to see all students.`
                        : "The database is currently empty. Use the form on the left to add a student."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isEditing = activeEditId === student.id;
                return (
                  <tr
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isEditing ? "bg-indigo-50/60 font-medium" : ""
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        #{student.id}
                      </span>
                    </td>

                    {/* Name & Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{student.name}</p>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        {student.phone}
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCourseBadgeColor(
                          student.course
                        )}`}
                      >
                        {student.course}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {student.age}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View Button */}
                        <button
                          id={`btn-view-${student.id}`}
                          onClick={() => onView(student)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="View student details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          id={`btn-edit-${student.id}`}
                          onClick={() => onEdit(student)}
                          className={`p-1.5 rounded-md transition-colors ${
                            isEditing
                              ? "text-indigo-600 bg-indigo-100"
                              : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          }`}
                          title="Edit student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          id={`btn-delete-${student.id}`}
                          onClick={() => onDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden divide-y divide-slate-100 flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading student records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No student records found.</div>
        ) : (
          filteredStudents.map((student) => {
            const isEditing = activeEditId === student.id;
            return (
              <div
                key={student.id}
                id={`mobile-student-card-${student.id}`}
                className={`p-3.5 rounded-xl border bg-white space-y-2.5 transition-all ${
                  isEditing ? "border-indigo-400 bg-indigo-50/40" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      #{student.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getCourseBadgeColor(
                      student.course
                    )}`}
                  >
                    {student.course}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.phone}</span>
                    <span className="text-slate-300">•</span>
                    <span>Age: {student.age} yrs</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(student)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>
                  <button
                    onClick={() => onEdit(student)}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(student)}
                    className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
