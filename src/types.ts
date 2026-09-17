export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  course: string;
  age: number;
  created_at?: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  course: string;
  age: string | number;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  age?: string;
  general?: string;
}

export interface SystemStats {
  totalStudents: number;
  totalCourses: number;
  averageAge: number;
  courseBreakdown: Record<string, number>;
}

export interface TestCaseResult {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  description: string;
  expectedResult: string;
  status: "idle" | "running" | "pass" | "fail";
  httpStatus?: number;
  durationMs?: number;
  requestPayload?: any;
  responsePayload?: any;
  errorDetail?: string;
}
