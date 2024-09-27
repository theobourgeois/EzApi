import { z, ZodError, ZodTypeAny } from "zod";
import axios, { AxiosRequestConfig } from "axios";

type InferBetweenBrackets<T extends string> =
  T extends `${string}{${infer U}}${infer Rest}`
  ? U | InferBetweenBrackets<Rest>
  : never;

type PayloadItem<T extends ZodTypeAny> = z.infer<T>;

export type Routers<
  Router extends string,
  Api extends string,
  Payload extends Record<string, ZodTypeAny>,
  Return extends Record<string, ZodTypeAny>,
  Endpoint extends string
> = {
    [name in Api]: {
      [route in Router]: {
        endpoint: Endpoint;
        payload?: Payload;
        type: "GET" | "POST" | "PUT" | "DELETE";
        return: Return;
        config?: AxiosRequestConfig;
      };
    };
  };

export type Config = {
  url: string;
};

export type ApiReturn<
  Route extends string,
  Api extends string,
  Payload extends Record<string, ZodTypeAny>,
  Return extends Record<string, ZodTypeAny>,
  Endpoint extends string
> = {
    [name in Api]: {
      [route in Route]: (data: {
        payload?: PayloadItem<z.ZodObject<Payload>>;
        params?: Record<InferBetweenBrackets<Endpoint>, string>;
      }) =>
        Promise<PayloadItem<z.ZodObject<Return>> | ZodError<PayloadItem<z.ZodObject<Payload>>>>
    };
  };

function addParamsToUrl(url: string, params: Record<string, string> = {}) {
  return url.replace(/{([^{}]*)}/g, (_, key) => {
    return params[key] || "";
  });
}

export function createApiSchema<
  Route extends string,
  Api extends string,
  Payload extends Record<string, ZodTypeAny>,
  Return extends Record<string, ZodTypeAny>,
  Endpoint extends string
>(
  config: Config,
  schema: Routers<Route, Api, Payload, Return, Endpoint>
): ApiReturn<Route, Api, Payload, Return, Endpoint> {
  const routes = Object.keys(schema) as Api[];
  const returnVal = {} as ApiReturn<Route, Api, Payload, Return, Endpoint>;

  for (const route of routes) {
    const endpoints = Object.keys(
      schema[route as keyof typeof schema]
    ) as Route[];

    for (const endpoint of endpoints) {
      const endpointData = schema[route][endpoint];
      returnVal[route] = returnVal[route] || {};

      returnVal[route][endpoint] = async ({
        payload,
        params,
      }: {
        payload?: PayloadItem<z.ZodObject<Payload>>;
        params?: Record<InferBetweenBrackets<Endpoint>, string>;
      }) => {
        let axiosFunction = axios.get;
        switch (endpointData.type) {
          case "POST":
            axiosFunction = axios.post;
            break;
          case "PUT":
            axiosFunction = axios.put;
            break;
          case "DELETE":
            axiosFunction = axios.delete;
            break;
        }

        // Validate payload if it exists
        if (endpointData.payload && payload) {
          const parsedPayload = z
            .object(endpointData.payload)
            .safeParse(payload);

          if (!parsedPayload.success) {
            throw new Error(parsedPayload.error.errors[0].message);
          }
        }

        const url = config.url + addParamsToUrl(endpointData.endpoint, params)
        const response = await axiosFunction(url, {
          data: payload,
          ...endpointData.config,
        });

        // Validate response data
        const parsedResponse = z
          .object(endpointData.return)
          .safeParse(response.data);

        if (!parsedResponse.success) {
          throw new Error(parsedResponse.error.errors[0].message);
        }

        return parsedResponse.data as PayloadItem<z.ZodObject<Return>>;
      };
    }
  }

  return returnVal;
}