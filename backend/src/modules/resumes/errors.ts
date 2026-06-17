import { ApiError } from "@/lib/api-error";

export class ResumeNotFoundError extends ApiError {
  constructor() {
    super("Resume not found", 404);
  }
}

export class ResumeVersionConflictError extends ApiError {
  constructor() {
    super("Resume has been modified by another request", 409);
  }
}
