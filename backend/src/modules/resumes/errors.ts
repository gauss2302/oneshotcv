import { ApiError } from "@/lib/api-error";

export class ResumeNotFoundError extends ApiError {
  constructor() {
    super("Resume not found", 404);
  }
}
