"use client";

import CallAPI from "./call-api";
import type { UploadFile } from "antd/es/upload/interface";

const postRoutes = {
  getAllPost: "/api/posts",
  createPost: "/api/posts/",
  getPostByPostId: "/api/posts/post-id", // + post_id
  getPostByUserId: "/api/posts/user-id", // + user_id
  deletePost: "/api/posts", // + post_id
  liked: "/api/posts/like",
};

let headersPost: object = {};

if (typeof localStorage !== "undefined") {
  console.log("use localStorage post api 2");

  let accessToken = localStorage.getItem("accessToken") as string;
  headersPost = { Authorization: `Bearer ${accessToken}` };
} else {
  console.log("👉️ can't use localStorage, postapi 2");
}

export default class PostService {
  static getAllPost = async () => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
      };
      const response = await CallAPI.call(postRoutes.getAllPost, {
        method: "GET",
        ...config,
      });
      console.log("Line 35 post-api.ts: ", response);
      return response;
    } catch (err) {
      throw err;
    }
  };

  static createPost = async (user_id: string, description: string, fileList: UploadFile[]) => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
        data: { user_id, description, fileList },
      };
      const response = await CallAPI.call(postRoutes.createPost, {
        method: "POST",
        ...config,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  static getPostByPostId = async (post_id: string) => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
      };
      const response = await CallAPI.call(`${postRoutes.getPostByPostId}/${post_id}`, {
        method: "GET",
        ...config,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  static getPostByUserId = async (user_id: string) => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
      };
      const response = await CallAPI.call(`${postRoutes.getPostByUserId}/${user_id}`, {
        method: "GET",
        ...config,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  static deletePost = async (post_id: string) => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
      };
      const response = await CallAPI.call(`${postRoutes.deletePost}/${post_id}`, {
        method: "DELETE",
        ...config,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  static liked = async (post_id: string) => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
        data: { post_id },
      };
      const response = await CallAPI.call(postRoutes.liked, {
        method: "POST",
        ...config,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };
}
