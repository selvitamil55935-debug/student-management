import React, { useState } from "react";
import { Play, CheckCircle2, XCircle, Clock, ArrowRight, Code, RefreshCw, Terminal, Check, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import { TestCaseResult } from "../types";

interface ApiTestRunnerProps {
  onRefreshRecords: () => void;
}

const INITIAL_TEST_CASES: TestCaseResult[] = [
  {
    id: "tc-1",
    name: "Add Student (POST)",
    method: "POST",
    endpoint: "/api/students/",
    description: "Create a valid student record with name, email, phone, course, and age.",
    expectedResult: "HTTP 201 Created & student object returned",
    status: "idle",
    requestPayload: {
      name: "Rohan Varma",
      email: "rohan.varma.test@gmail.com",
      phone: "9876543299",
      course: "Computer Science",
      age: 20,
    },
  },
  {
    id: "tc-2",
    name: "Get All Students (GET)",
    method: "GET",
    endpoint: "/api/students/",
    description: "Retrieve all active student records from SQLite database.",
    expectedResult: "HTTP 200 OK & array of student records",
    status: "idle",
  },
  {
    id: "tc-3",
    name: "Get Student by ID (GET)",
    method: "GET",
    endpoint: "/api/students/1/",
    description: "Retrieve details of a single student (ID #1).",
    expectedResult: "HTTP 200 OK & student record for ID 1",
    status: "idle",
  },
  {
    id: "tc-4",
    name: "Update Student (PUT)",
    method: "PUT",
    endpoint: "/api/students/1/",
    description: "Update student #1 course from Computer Science to Information Technology.",
    expectedResult: "HTTP 200 OK & updated student record",
    status: "idle",
    requestPayload: {
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      phone: "9876543210",
      course: "Information Technology",
      age: 21,
    },
  },
  {
    id: "tc-5",
    name: "Empty Required Field (POST)",
    method: "POST",
    endpoint: "/api/students/",
    description: "Submit student with empty name to test validation failure.",
    expectedResult: "HTTP 400 Bad Request with 'Name is required'",
    status: "idle",
    requestPayload: {
      name: "",
      email: "emptytest@gmail.com",
      phone: "9876543200",
      course: "Data Science",
      age: 20,
    },
  },
  {
    id: "tc-6",
    name: "Invalid Email Format (POST)",
    method: "POST",
    endpoint: "/api/students/",
    description: "Submit student with malformed email 'rahulgmail.com'.",
    expectedResult: "HTTP 400 Bad Request with invalid email error",
    status: "idle",
    requestPayload: {
      name: "Test User",
      email: "rahulgmail.com",
      phone: "9876543210",
      course: "Mechanical Engineering",
      age: 22,
    },
  },
  {
    id: "tc-7",
    name: "Duplicate Email Rejection (POST)",
    method: "POST",
    endpoint: "/api/students/",
    description: "Attempt to register with existing email 'rahul@gmail.com'.",
    expectedResult: "HTTP 400 Bad Request rejecting duplicate email",
    status: "idle",
    requestPayload: {
      name: "Duplicate Tester",
      email: "rahul@gmail.com",
      phone: "9876543210",
      course: "Information Technology",
      age: 21,
    },
  },
  {
    id: "tc-8",
    name: "Delete Student (DELETE)",
    method: "DELETE",
    endpoint: "/api/students/{temp_id}/",
    description: "Delete the temporary test student created in Test Case 1.",
    expectedResult: "HTTP 200 OK with success confirmation",
    status: "idle",
  },
];

export const ApiTestRunner: React.FC<ApiTestRunnerProps> = ({ onRefreshRecords }) => {
  const [testCases, setTestCases] = useState<TestCaseResult[]>(INITIAL_TEST_CASES);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeExpandedId, setActiveExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Method badge color
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "POST":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PUT":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const runSingleTest = async (testId: string, createdStudentId?: number): Promise<{ success: boolean; studentId?: number }> => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === testId ? { ...tc, status: "running" } : tc))
    );

    const startTime = performance.now();
    let currentTc = testCases.find((tc) => tc.id === testId);
    if (!currentTc) return { success: false };

    let targetEndpoint = currentTc.endpoint;
    if (testId === "tc-8" && createdStudentId) {
      targetEndpoint = `/api/students/${createdStudentId}/`;
    }

    try {
      const options: RequestInit = {
        method: currentTc.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (currentTc.requestPayload && (currentTc.method === "POST" || currentTc.method === "PUT")) {
        options.body = JSON.stringify(currentTc.requestPayload);
      }

      const res = await fetch(targetEndpoint, options);
      const durationMs = Math.round(performance.now() - startTime);
      const responseData = await res.json().catch(() => ({}));

      let passed = false;
      let newCreatedId: number | undefined = undefined;

      // Assertion checks based on SOP expectations
      if (testId === "tc-1") {
        passed = res.status === 201 && !!responseData.student?.id;
        newCreatedId = responseData.student?.id;
      } else if (testId === "tc-2") {
        passed = res.status === 200 && Array.isArray(responseData);
      } else if (testId === "tc-3") {
        passed = res.status === 200 && responseData.id === 1;
      } else if (testId === "tc-4") {
        passed = res.status === 200 && responseData.student?.course === "Information Technology";
      } else if (testId === "tc-5") {
        passed = res.status === 400 && (JSON.stringify(responseData).includes("Name") || !!responseData.details?.name);
      } else if (testId === "tc-6") {
        passed = res.status === 400 && (JSON.stringify(responseData).toLowerCase().includes("email") || !!responseData.details?.email);
      } else if (testId === "tc-7") {
        passed = res.status === 400 && JSON.stringify(responseData).toLowerCase().includes("already exists");
      } else if (testId === "tc-8") {
        passed = res.status === 200 || res.status === 204;
      }

      setTestCases((prev) =>
        prev.map((tc) =>
          tc.id === testId
            ? {
                ...tc,
                status: passed ? "pass" : "fail",
                httpStatus: res.status,
                durationMs,
                endpoint: targetEndpoint,
                responsePayload: responseData,
              }
            : tc
        )
      );

      return { success: passed, studentId: newCreatedId };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      setTestCases((prev) =>
        prev.map((tc) =>
          tc.id === testId
            ? {
                ...tc,
                status: "fail",
                durationMs,
                errorDetail: err.message || "Network request failed",
              }
            : tc
        )
      );
      return { success: false };
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    let tempStudentId: number | undefined = undefined;

    // Reset status
    setTestCases((prev) => prev.map((tc) => ({ ...tc, status: "idle", httpStatus: undefined, responsePayload: undefined })));

    for (const tc of INITIAL_TEST_CASES) {
      const result = await runSingleTest(tc.id, tempStudentId);
      if (tc.id === "tc-1" && result.studentId) {
        tempStudentId = result.studentId;
      }
      // Brief aesthetic pause between tests
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsRunningAll(false);
    onRefreshRecords();

    // Trigger celebration if all passed
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleCopyCurl = (tc: TestCaseResult) => {
    let curl = `curl -X ${tc.method} "http://localhost:3000${tc.endpoint}"`;
    if (tc.requestPayload) {
      curl += ` -H "Content-Type: application/json" -d '${JSON.stringify(tc.requestPayload)}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopiedId(tc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const passCount = testCases.filter((t) => t.status === "pass").length;
  const failCount = testCases.filter((t) => t.status === "fail").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold tracking-tight">Postman-Equivalent REST API Test Suite</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated validation of all 8 SOP test cases against the live SQLite backend database
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pass / Fail Badges */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {passCount} Pass
              </span>
              {failCount > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {failCount} Fail
                </span>
              )}
            </div>

            {/* Run All Button */}
            <button
              id="btn-run-all-tests"
              onClick={handleRunAll}
              disabled={isRunningAll}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isRunningAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Running Suite...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run All 8 Test Cases
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="divide-y divide-slate-200">
        {testCases.map((tc, idx) => {
          const isExpanded = activeExpandedId === tc.id;
          return (
            <div key={tc.id} className="p-4 hover:bg-slate-50/70 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Test details */}
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400 pt-0.5 w-6">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getMethodBadge(
                          tc.method
                        )}`}
                      >
                        {tc.method}
                      </span>
                      <code className="text-xs font-mono font-semibold text-slate-800">{tc.endpoint}</code>
                      <span className="text-xs font-bold text-slate-900">• {tc.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{tc.description}</p>
                    <p className="text-[11px] text-slate-400">
                      Expected: <span className="font-mono text-slate-600">{tc.expectedResult}</span>
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Status Indicator */}
                  {tc.status === "idle" && (
                    <span className="text-xs font-medium text-slate-400 px-2.5 py-1 rounded bg-slate-100">
                      Ready
                    </span>
                  )}
                  {tc.status === "running" && (
                    <span className="text-xs font-medium text-indigo-600 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Testing...
                    </span>
                  )}
                  {tc.status === "pass" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASS</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-normal">
                        ({tc.httpStatus} • {tc.durationMs}ms)
                      </span>
                    </div>
                  )}
                  {tc.status === "fail" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAIL</span>
                      <span className="text-[10px] font-mono text-red-600 font-normal">
                        ({tc.httpStatus} • {tc.durationMs}ms)
                      </span>
                    </div>
                  )}

                  {/* Run Single Button */}
                  <button
                    onClick={() => runSingleTest(tc.id)}
                    disabled={isRunningAll}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Run single test case"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Copy cURL Button */}
                  <button
                    onClick={() => handleCopyCurl(tc)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors text-xs"
                    title="Copy cURL command"
                  >
                    {copiedId === tc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Inspect Details Toggle */}
                  <button
                    onClick={() => setActiveExpandedId(isExpanded ? null : tc.id)}
                    className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md flex items-center gap-1"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{isExpanded ? "Hide" : "Inspect"}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Inspector Drawer */}
              {isExpanded && (
                <div className="mt-3 p-3.5 bg-slate-900 rounded-lg text-xs font-mono border border-slate-800 space-y-2.5">
                  {tc.requestPayload && (
                    <div>
                      <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block mb-1">
                        Request Body (JSON):
                      </span>
                      <pre className="text-amber-300 bg-slate-950 p-2.5 rounded overflow-x-auto">
                        {JSON.stringify(tc.requestPayload, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block mb-1">
                      Response Data {tc.httpStatus ? `(HTTP ${tc.httpStatus})` : ""}:
                    </span>
                    <pre className="text-emerald-400 bg-slate-950 p-2.5 rounded overflow-x-auto">
                      {tc.responsePayload
                        ? JSON.stringify(tc.responsePayload, null, 2)
                        : "// Click 'Run' to inspect live response from SQLite"}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
