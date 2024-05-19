"use client";
import CallAPI from "./call-api";
import IUser from "@/interfaces/user-interface";

const userRoutes = {
  login: "/api/users/login",
  signUp: "/api/users/sign-up",
  getUserByToken: "/api/users",
  refreshAccessToken: "/api/users/refresh-access-token",
  follow: "/api/users/follow",
  getFollower: "/api/users/follower",
  getFollowing: "/api/users/following",
  getFriend: "/api/users/friends",
  updateUser: "/api/users",
};

let headersPost: object = {};

if (typeof localStorage !== "undefined") {
  console.log("use localStorage user api");
  let accessToken = localStorage.getItem("accessToken") as string;
  headersPost = { Authorization: `Bearer ${accessToken}` };
} else {
  console.log("👉️ can't use localStorage user api");
}

export default class UserService {
  static login = async (email: string, password: string) => {
    try {
      let config: Object = {
        data: { email, password },
      };
      let response = await CallAPI.call(userRoutes.login, {
        method: "POST",
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  static signUp = async ({ firstName, lastName, email, password, dob, sex }: IUser) => {
    try {
      const config = {
        data: { firstName, lastName, email, password, dob, sex },
      };
      let response = await CallAPI.call(userRoutes.signUp, {
        method: "POST",
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  static getUserByToken = async (token: string) => {
    try {
      const response = await CallAPI.call(`${userRoutes.getUserByToken}/${token}`, {
        method: "GET",
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  static refreshAccessToken = async (refreshToken: string) => {
    try {
      const config = {
        data: { refreshToken },
      };
      const response = await CallAPI.call(userRoutes.refreshAccessToken, {
        method: "POST",
        ...config,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  static follow = async (follower_id: string) => {
    try {
      const config = {
        data: { follower_id },
        headers: {
          ...headersPost,
        },
      };

      const response = await CallAPI.call(userRoutes.follow, {
        method: "POST",
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  static getFollower = async () => {
    try {
      const config = {
        headers: {
          ...headersPost,
        },
      };

      const response = await CallAPI.call(userRoutes.getFollower, {
        method: "GET",
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  static getFollowing = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Imd6eWcxY2YwdWpodmJjYTA1djN0cTZobmJuNWVqczRkIiwiaWF0IjoxNzAxOTEyOTMwLCJleHAiOjE3MDE5OTkzMzB9.gWGGsRc11JZx4LWRNI_bLI685t3FuwsaLNnsxI8K4kU`,
        },
      };

      const response = await CallAPI.call(userRoutes.getFollowing, {
        method: "GET",
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  static getFriend = async () => {
    try {
      const config = {
        headers: headersPost,
      };

      const response = await CallAPI.call(userRoutes.getFriend, {
        method: "GET",
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  static updateUser = async (avatar: string) => {
    try {
      const config = {
        headers: headersPost,
        data: {
          avatar,
        },
      };

      const response = await CallAPI.call(userRoutes.updateUser, {
        method: "PUT",
        ...config,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };
}
