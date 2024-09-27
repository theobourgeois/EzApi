"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const zod_1 = require("zod");
const _1 = require(".");
const config = {
    url: "https://jsonplaceholder.typicode.com",
};
// Example usage
exports.api = (0, _1.createApiSchema)(config, {
    posts: {
        updatePost: {
            endpoint: "/posts/update/{id}",
            type: "PUT",
            payload: {
                content: zod_1.z.string(),
                title: zod_1.z.string(),
            },
            return: {
                id: zod_1.z.number(),
            },
        },
    },
});
exports.api.posts.updatePost({
    payload: {
        content: "Hello world, lorem ipsum",
        title: "Hello world I am here",
    },
    params: {
        id: "1",
    },
});
