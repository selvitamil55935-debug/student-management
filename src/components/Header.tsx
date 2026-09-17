import React from "react";
import { GraduationCap, Database, Terminal, RefreshCw, Layers } from "lucide-react";
import { SystemStats } from "../types";

interface HeaderProps {
  stats: SystemStats | null;
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenApiTester: () => void;
  onOpenArchitecture: () => void;
  activeView: "app" | "tester";
  setActiveView: (view: "app" | "tester") => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onResetDemo,
  isResetting,
  onOpenArchitecture,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  STUDENT MANAGEMENT SYSTEM
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  REST API & SQLite
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Full-Stack CRUD Application • React Frontend • SQLite Persistence
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Switcher: Management vs Postman Runner */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                id="tab-students"
                onClick={() => setActiveView("app")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === "app"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student Records
              </button>
              <button
                id="tab-api-tester"
                onClick={() => setActiveView("tester")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeView === "tester"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                API Testing Console
              </button>
            </div>

            {/* Architecture Modal Button */}
            <button
              id="btn-architecture"
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="View Architecture & ER Diagram"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Architecture & DB</span>
            </button>

            {/* Reset Demo Button */}
            <button
              id="btn-reset-demo"
              onClick={onResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
              title="Reset records to default sample students"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isResetting ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Stats Pill */}
            {stats && (
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-xs text-slate-500">Total:</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {stats.totalStudents} Students
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
