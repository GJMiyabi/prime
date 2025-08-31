export type HttpResponse<T> = {
  status: number;
  data: T;
};

export type HttpRequestConfig = {
  baseUrl?: string;
  data?: any;
  headers?: Record<string, string>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
};

export abstract class HttpClient {
  static readonly HEADERS = {
    contentType: {
      json: { 'Content-type': 'application/json' },
    },
  };

  abstract post<T>(
    url: string,
    data: any,
    headers?: Record<string, string>,
    params?: Record<string, string>,
  ): Promise<HttpResponse<T>>;

  abstract get<T>(
    url: string,
    headers?: Record<string, string>,
    params?: Record<string, string>,
  ): Promise<HttpResponse<T>>;

  abstract request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
}
