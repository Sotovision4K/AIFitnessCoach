interface ApiError {
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

class ApiClient {
  private baseUrl: string;
  // private needsAuth: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL;
    // this.needsAuth = true;
  }

  // private getHeaders(authToken? : string): HeadersInit {
  //   const headers: HeadersInit = { 'Content-Type': 'application/json' };
  //   if (this.needsAuth) {
  //     headers['Authorization'] = `Bearer ${authToken}`;
  //   }
  //   return headers;
  // }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = (await response.json()) as ApiError;
      throw new ApiRequestError(
        errorBody.message,
        response.status,
        errorBody,
      );
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async put<T>(path: string, body: unknown, token?: string): Promise<T> {

    return this.request<T>('PUT', path, body, token ? { 'Authorization': `Bearer ${token}` , 'Content-Type': 'application/json'} : undefined);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: ApiError,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const api = new ApiClient();
