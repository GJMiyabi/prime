"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosClient = void 0;
const axios_1 = require("axios");
const http_client_1 = require("./http.client");
class AxiosClient extends http_client_1.HttpClient {
    async post(url, data, headers, params) {
        const response = await axios_1.default.post(url, data, { headers, params });
        return { status: response.status, data: response.data };
    }
    async get(url, headers, params) {
        const response = await axios_1.default.get(url, { headers, params });
        return { status: response.status, data: response.data };
    }
    async request(config) {
        const response = await axios_1.default.request(config);
        return { status: response.status, data: response.data };
    }
}
exports.AxiosClient = AxiosClient;
//# sourceMappingURL=axios.client.js.map