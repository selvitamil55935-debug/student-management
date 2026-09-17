import React from "react";
import { X, Database, Server, Monitor, ArrowRight, ShieldCheck, CheckSquare, Key, Table } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base">Full-Stack Architecture & Database Specification</h3>
              <p className="text-xs text-slate-400">
                React Frontend • REST API Specification • SQLite 3 Persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Workflow Diagram */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              1. Full-Stack Application Workflow
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <Monitor className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
                <h5 className="font-bold text-xs text-indigo-950">1. React Frontend</h5>
                <p className="text-[11px] text-slate-600 mt-1">
                  User input validation, JSON request dispatch, interactive state refresh
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <Server className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <h5 className="font-bold text-xs text-emerald-950">2. REST API Layer</h5>
                <p className="text-[11px] text-slate-600 mt-1">
                  Standard endpoints: GET, POST, PUT, DELETE with JSON payloads
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto mb-1.5" />
                <h5 className="font-bold text-xs text-amber-950">3. Backend Controller</h5>
                <p className="text-[11px] text-slate-600 mt-1">
                  Server-side validation, duplicate email checks, business rules
                </p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                <Database className="w-6 h-6 text-purple-600 mx-auto mb-1.5" />
                <h5 className="font-bold text-xs text-purple-950">4. SQLite 3 Database</h5>
                <p className="text-[11px] text-slate-600 mt-1">
                  Relational persistence in <code className="font-mono text-purple-800">db.sqlite3</code> file
                </p>
              </div>
            </div>
          </div>

          {/* Database Schema & ER Diagram */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Table className="w-4 h-4 text-indigo-600" />
              2. Student Database Entity (SQLite Table)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3.5">Field Name</th>
                    <th className="py-2.5 px-3.5">Data Type</th>
                    <th className="py-2.5 px-3.5">Constraint</th>
                    <th className="py-2.5 px-3.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-indigo-600">id</td>
                    <td className="py-2.5 px-3.5">INTEGER</td>
                    <td className="py-2.5 px-3.5 text-emerald-700 font-semibold">PRIMARY KEY AUTOINCREMENT</td>
                    <td className="py-2.5 px-3.5 font-sans">Unique student identification number</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-indigo-600">name</td>
                    <td className="py-2.5 px-3.5">TEXT</td>
                    <td className="py-2.5 px-3.5 text-amber-700">NOT NULL</td>
                    <td className="py-2.5 px-3.5 font-sans">Student's full name</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-indigo-600">email</td>
                    <td className="py-2.5 px-3.5">TEXT</td>
                    <td className="py-2.5 px-3.5 text-red-700 font-semibold">UNIQUE, NOT NULL</td>
                    <td className="py-2.5 px-3.5 font-sans">Student's verified email address</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-indigo-600">phone</td>
                    <td className="py-2.5 px-3.5">TEXT</td>
                    <td className="py-2.5 px-3.5 text-amber-700">NOT NULL</td>
                    <td className="py-2.5 px-3.5 font-sans">Student's contact telephone number</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-indigo-600">course</td>
                    <td className="py-2.5 px-3.5">TEXT</td>
                    <td className="py-2.5 px-3.5 text-amber-700">NOT NULL</td>
                    <td className="py-2.5 px-3.5 font-sans">Enrolled degree / course name</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3.5 font-bold text-indigo-600">age</td>
                    <td className="py-2.5 px-3.5">INTEGER</td>
                    <td className="py-2.5 px-3.5 text-amber-700">NOT NULL</td>
                    <td className="py-2.5 px-3.5 font-sans">Student's age (10 - 100)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SOP Submission Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              3. SOP Requirements & Submission Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Complete React frontend source code</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>REST API backend with full CRUD</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Real SQLite 3 database persistence</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Client & server-side validation</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Duplicate email prevention logic</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Postman API Test Suite with 8 test cases</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
