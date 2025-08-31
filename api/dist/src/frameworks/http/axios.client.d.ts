import { HttpClient, HttpRequestConfig, HttpResponse } from './http.client';
export declare class AxiosClient extends HttpClient {
    post<T>(url: string, data: any, headers?: Record<string, string>, params?: Record<string, string>): Promise<HttpResponse<T>>;
    get<T>(url: string, headers?: Record<string, string>, params?: Record<string, string>): Promise<HttpResponse<T>>;
    request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
}
