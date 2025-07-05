import { HttpClient } from "./HttpClient";

// TODO: who is using it?
export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  private buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(this.buildUrl(path));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}
