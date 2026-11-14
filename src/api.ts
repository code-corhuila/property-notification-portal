/**
 * What the container hands this portal when it mounts it (ADR-012, rule 3): a framework-neutral
 * client that wraps the container's own, with the gateway URL, the token, the X-Correlation-Id,
 * the time limit and one error shape. This portal never calls fetch and never reads a token.
 */
export interface ApiClient {
  get<T>(path: string): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
}

/** A failed call rejects with this shape; userMessage is decided by the container. */
export interface ApiError {
  status: number;
  code: string;
  userMessage: string;
}

/** E-16 and E-17 of notification-service.yaml. */
export interface Preferencias {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export function messageOf(err: unknown): string {
  return typeof err === 'object' && err !== null && 'userMessage' in err
    ? String((err as ApiError).userMessage)
    : 'Algo salió mal de nuestro lado';
}
