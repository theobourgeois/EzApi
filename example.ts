import { z } from "zod";
import { Config, createApiSchema } from ".";

const config: Config = {
  url: "https://jsonplaceholder.typicode.com",
};

// Example usage
export const api = createApiSchema(config, {
  posts: {
    updatePost: {
      endpoint: "/posts/update/{id}",
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

api.posts.updatePost({
  payload: {
    content: "Hello world, lorem ipsum",
    title: "Hello world I am here",
  },
  params: {
    id: "1",
  },
});