import axios from 'axios';
import { HttpClient, HttpRequestConfig, HttpResponse } from './http.client';

export class AxiosClient extends HttpClient {
  async post<T>(
    url: string,
    data: any,
    headers?: Record<string, string>,
    params?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    const response = await axios.post<T>(url, data, { headers, params });
    return { status: response.status, data: response.data };
  }

  async get<T>(
    url: string,
    headers?: Record<string, string>,
    params?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    const response = await axios.get<T>(url, { headers, params });
    return { status: response.status, data: response.data };
  }

  async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const response = await axios.request<T>(config);
    return { status: response.status, data: response.data };
  }
}
