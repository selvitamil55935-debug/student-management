import React, { useState } from "react";
import { X, User, Mail, Phone, BookOpen, Calendar, Clock, Code, Copy, Check, Edit2 } from "lucide-react";
import { Student } from "../types";

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!student) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(student, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/20">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">{student.name}</h3>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-mono">
                  ID: #{student.id}
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">{student.course}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Email Address
              </div>
              <p className="text-sm font-medium text-slate-900 break-all">{student.email}</p>
            </div>

            {/* Phone */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                Phone Number
              </div>
              <p className="text-sm font-medium text-slate-900">{student.phone}</p>
            </div>

            {/* Course */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Enrolled Course
              </div>
              <p className="text-sm font-medium text-slate-900">{student.course}</p>
            </div>

            {/* Age */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Age
              </div>
              <p className="text-sm font-medium text-slate-900">{student.age} years old</p>
            </div>
          </div>

          {/* Registration time if available */}
          {student.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 px-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Record created in database: {new Date(student.created_at).toLocaleString()}</span>
            </div>
          )}

          {/* JSON REST API Inspector Toggle */}
          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showJson ? "Hide JSON Entity Payload" : "Inspect Raw JSON (REST API Response)"}</span>
            </button>

            {showJson && (
              <div className="mt-2.5 relative">
                <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                  {JSON.stringify(student, null, 2)}
                </pre>
                <button
                  onClick={handleCopyJson}
                  className="absolute top-2.5 right-2.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
                  title="Copy JSON"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onEdit(student);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit This Student
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
