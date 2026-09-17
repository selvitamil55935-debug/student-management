import React, { useState, useEffect } from "react";
import { User, Mail, Phone, BookOpen, Calendar, UserPlus, Check, X, Sparkles, AlertCircle } from "lucide-react";
import { Student, StudentFormData, ValidationErrors } from "../types";

interface StudentFormProps {
  editingStudent: Student | null;
  onSubmit: (data: StudentFormData) => Promise<boolean>;
  onCancelEdit: () => void;
  isSubmitting: boolean;
  serverError: string | null;
  existingEmails: string[];
}

const COMMON_COURSES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Comm.",
  "Data Science",
  "Mechanical Engineering",
  "Civil Engineering",
];

export const StudentForm: React.FC<StudentFormProps> = ({
  editingStudent,
  onSubmit,
  onCancelEdit,
  isSubmitting,
  serverError,
  existingEmails,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    phone: "",
    course: "",
    age: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // When editing student changes, populate or clear form
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        email: editingStudent.email,
        phone: editingStudent.phone,
        course: editingStudent.course,
        age: editingStudent.age,
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        age: "",
      });
      setErrors({});
      setTouched({});
    }
  }, [editingStudent]);

  // Client-side validator
  const validate = (data: StudentFormData): ValidationErrors => {
    const errs: ValidationErrors = {};

    // Name validation
    if (!data.name || data.name.trim().length === 0) {
      errs.name = "Name is required.";
    } else if (data.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters long.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = data.email.trim().toLowerCase();
    if (!data.email || data.email.trim().length === 0) {
      errs.email = "Email is required.";
    } else if (!emailRegex.test(cleanEmail)) {
      errs.email = "Please enter a valid email address (e.g. rahul@gmail.com).";
    } else {
      // Duplicate email check on client side
      const isDuplicate = existingEmails.some(
        (e) =>
          e.toLowerCase() === cleanEmail &&
          (!editingStudent || editingStudent.email.toLowerCase() !== cleanEmail)
      );
      if (isDuplicate) {
        errs.email = "A student with this email address already exists.";
      }
    }

    // Phone validation
    const digitsOnly = data.phone.replace(/\D/g, "");
    if (!data.phone || data.phone.trim().length === 0) {
      errs.phone = "Phone number is required.";
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errs.phone = "Phone must contain between 7 and 15 digits.";
    }

    // Course validation
    if (!data.course || data.course.trim().length === 0) {
      errs.course = "Course is required.";
    }

    // Age validation
    const ageNum = parseInt(String(data.age), 10);
    if (data.age === "" || data.age === undefined || data.age === null) {
      errs.age = "Age is required.";
    } else if (isNaN(ageNum)) {
      errs.age = "Age must be a valid number.";
    } else if (ageNum < 10 || ageNum > 100) {
      errs.age = "Age must be within student range (10 to 100).";
    }

    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // If already touched, validate on change
    if (touched[name]) {
      const fieldErrors = validate(updatedData);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof ValidationErrors],
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: currentErrors[field as keyof ValidationErrors],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      course: true,
      age: true,
    });

    const currentErrors = validate(formData);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    const success = await onSubmit(formData);
    if (success && !editingStudent) {
      // Reset form upon successful creation
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        age: "",
      });
      setTouched({});
      setErrors({});
    }
  };

  const handlePreFillSample = () => {
    const samples = [
      { name: "Rahul Kumar", email: "rahul@gmail.com", phone: "9876543210", course: "Computer Science", age: 20 },
      { name: "Priya Sharma", email: "priya@gmail.com", phone: "9876543211", course: "Information Technology", age: 21 },
      { name: "Aarav Sharma", email: `aarav.${Math.floor(Math.random() * 900 + 100)}@gmail.com`, phone: "9811223344", course: "Data Science", age: 22 },
      { name: "Ananya Iyer", email: `ananya.${Math.floor(Math.random() * 900 + 100)}@gmail.com`, phone: "9844556677", course: "Electronics & Comm.", age: 19 },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setFormData(pick);
    setErrors({});
    setTouched({});
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-slate-800 uppercase flex items-center gap-2">
            {editingStudent ? (
              <>
                <Check className="w-4 h-4 text-indigo-600" />
                Edit Student Information
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Add New Student
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {editingStudent
              ? `Updating record for Student ID #${editingStudent.id}`
              : "Enter student details to store in the database"}
          </p>
        </div>

        {!editingStudent && (
          <button
            type="button"
            id="btn-prefill-sample"
            onClick={handlePreFillSample}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
            title="Auto-fill sample student data for quick testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Data</span>
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Operation failed:</span> {serverError}
            </div>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label htmlFor="student-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Student Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="student-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              placeholder="e.g. Rahul Kumar"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                touched.name && errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
          </div>
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="student-email" className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="student-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              placeholder="e.g. rahul@gmail.com"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                touched.email && errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
          </div>
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="student-phone" className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="student-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur("phone")}
              placeholder="e.g. 9876543210"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                touched.phone && errors.phone
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
          </div>
          {touched.phone && errors.phone && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Course Field */}
        <div>
          <label htmlFor="student-course" className="block text-xs font-semibold text-slate-700 mb-1">
            Course / Department <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <input
              id="student-course"
              name="course"
              type="text"
              value={formData.course}
              onChange={handleChange}
              onBlur={() => handleBlur("course")}
              placeholder="e.g. Computer Science"
              list="courses-datalist"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                touched.course && errors.course
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
            <datalist id="courses-datalist">
              {COMMON_COURSES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          {/* Quick Course Suggestions */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {COMMON_COURSES.slice(0, 4).map((courseName) => (
              <button
                key={courseName}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, course: courseName }));
                  if (touched.course) {
                    setErrors((prev) => ({ ...prev, course: undefined }));
                  }
                }}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
              >
                {courseName}
              </button>
            ))}
          </div>
          {touched.course && errors.course && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.course}
            </p>
          )}
        </div>

        {/* Age Field */}
        <div>
          <label htmlFor="student-age" className="block text-xs font-semibold text-slate-700 mb-1">
            Age (Years) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="student-age"
              name="age"
              type="number"
              min="10"
              max="100"
              value={formData.age}
              onChange={handleChange}
              onBlur={() => handleBlur("age")}
              placeholder="e.g. 20"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 transition-colors ${
                touched.age && errors.age
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900"
                  : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900"
              }`}
            />
          </div>
          {touched.age && errors.age && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              {errors.age}
            </p>
          )}
        </div>

        {/* Form Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="submit"
            id="btn-submit-student"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm text-white shadow-xs transition-all flex items-center justify-center gap-2 ${
              editingStudent
                ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : editingStudent ? (
              <>
                <Check className="w-4 h-4" />
                Update Student
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Student
              </>
            )}
          </button>

          {editingStudent && (
            <button
              type="button"
              id="btn-cancel-edit"
              onClick={onCancelEdit}
              className="py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
