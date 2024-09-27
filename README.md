# ts-ez-api
API Schema Generator with Zod Validation

This package provides an easy way to define API schemas with automatic request payload and response validation using Zod. It generates type-safe endpoints and handles API requests with Axios, ensuring your payloads and responses conform to the expected schema at runtime. Ideal for developers looking to build robust, validated REST APIs with minimal effort.

Key features:

Define API routes with payload and return schemas using Zod.
Automatic validation of request payloads and responses.
Supports GET, POST, PUT, and DELETE methods.
Built-in integration with Axios for HTTP requests.

## Create schema 

```typescript
import { z } from "zod";
import { Config, createApiSchema } from ".";

const config: Config = {
  url: "https://jsonplaceholder.typicode.com",
};

// Example usage
export const api = createApiSchema(config, {
  posts: {
    update: {
      endpoint: "/posts/{id}",
      type: "PUT",
      payload: {
        content: z.string(),
        title: z.string(),
      },
      return: {
        id: z.number(),
      },
    },
  },
});
```

## Call your endpoints

```typescript
const result = await api.posts.updatePost({
  payload: {
    content: "This is the updated content of my post!",
    title: "My new post title",
  },
  params: {
    id: "1",
  },
});
```

