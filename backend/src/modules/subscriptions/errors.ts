import { ApiError } from "@/lib/api-error";

export class PaymentSystemNotConfiguredError extends ApiError {
  constructor() {
    super("Payment system is not configured", 503);
  }
}

export class PaymentSystemUnavailableError extends ApiError {
  constructor() {
    super("Payment system is not available", 503);
  }
}

export class SubscriptionProductMissingError extends ApiError {
  constructor() {
    super("Subscription product is not configured", 500);
  }
}
