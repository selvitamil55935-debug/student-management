import { Student, StudentFormData, SystemStats } from "../types";

const BASE_URL = "/api";

export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;
  
  constructor(message: string, status: number, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function fetchStudents(searchQuery = ""): Promise<Student[]> {
  const url = searchQuery 
    ? `${BASE_URL}/students/?search=${encodeURIComponent(searchQuery)}`
    : `${BASE_URL}/students/`;
  
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || "Failed to fetch students", res.status);
  }
  return res.json();
}

export async function getStudent(id: number): Promise<Student> {
  const res = await fetch(`${BASE_URL}/students/${id}/`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(errorData.error || `Student with ID ${id} not found`, res.status);
  }
  return res.json();
}

export async function createStudent(data: StudentFormData): Promise<{ message: string; student: Student }> {
  const payload = {
    ...data,
    age: parseInt(String(data.age), 10),
  };

  const res = await fetch(`${BASE_URL}/students/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      responseData.message || responseData.error || "Failed to create student",
      res.status,
      responseData.details
    );
  }

  return responseData;
}

export async function updateStudent(id: number, data: StudentFormData): Promise<{ message: string; student: Student }> {
  const payload = {
    ...data,
    age: parseInt(String(data.age), 10),
  };

  const res = await fetch(`${BASE_URL}/students/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      responseData.message || responseData.error || "Failed to update student",
      res.status,
      responseData.details
    );
  }

  return responseData;
}

export async function deleteStudent(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${BASE_URL}/students/${id}/`, {
    method: "DELETE",
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      responseData.message || responseData.error || "Failed to delete student",
      res.status
    );
  }

  return responseData;
}

export async function resetDemoData(): Promise<{ message: string; students: Student[] }> {
  const res = await fetch(`${BASE_URL}/reset-demo`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new ApiError("Failed to reset demo data", res.status);
  }
  return res.json();
}

export async function fetchStats(): Promise<SystemStats> {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) {
    throw new ApiError("Failed to fetch statistics", res.status);
  }
  return res.json();
}
