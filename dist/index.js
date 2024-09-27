"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiSchema = createApiSchema;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
function addParamsToUrl(url, params = {}) {
    return url.replace(/{([^{}]*)}/g, (_, key) => {
        return params[key] || "";
    });
}
function createApiSchema(config, schema) {
    const routes = Object.keys(schema);
    const returnVal = {};
    for (const route of routes) {
        const endpoints = Object.keys(schema[route]);
        for (const endpoint of endpoints) {
            const endpointData = schema[route][endpoint];
            returnVal[route] = returnVal[route] || {};
            returnVal[route][endpoint] = (_a) => __awaiter(this, [_a], void 0, function* ({ payload, params, }) {
                let axiosFunction = axios_1.default.get;
                switch (endpointData.type) {
                    case "POST":
                        axiosFunction = axios_1.default.post;
                        break;
                    case "PUT":
                        axiosFunction = axios_1.default.put;
                        break;
                    case "DELETE":
                        axiosFunction = axios_1.default.delete;
                        break;
                }
                // Validate payload if it exists
                if (endpointData.payload && payload) {
                    const parsedPayload = zod_1.z
                        .object(endpointData.payload)
                        .safeParse(payload);
                    if (!parsedPayload.success) {
                        throw new Error(parsedPayload.error.errors[0].message);
                    }
                }
                const url = config.url + addParamsToUrl(endpointData.endpoint, params);
                const response = yield axiosFunction(url, Object.assign({ data: payload }, endpointData.config));
                // Validate response data
                const parsedResponse = zod_1.z
                    .object(endpointData.return)
                    .safeParse(response.data);
                if (!parsedResponse.success) {
                    throw new Error(parsedResponse.error.errors[0].message);
                }
                return parsedResponse.data;
            });
        }
    }
    return returnVal;
}
