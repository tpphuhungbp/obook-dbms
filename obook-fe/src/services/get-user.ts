"use client";

import checkTokenExpiration from "@/utils/check-token-expiration";
import UserService from "./api/user-api";

const getUser = async () => {
  if (typeof localStorage !== "undefined") {
    console.log("use localStorage get user");

    const accessToken = localStorage.getItem("accessToken") as string;
    const refreshToken = localStorage.getItem("refreshToken") as string;

    if (accessToken && refreshToken) {
      const isAccessTokenExpired = checkTokenExpiration(accessToken); // true: token expired,
      const isRefreshTokenExpired = checkTokenExpiration(refreshToken); // refresh token expired

      if (isAccessTokenExpired && !isRefreshTokenExpired) {
        // refresh access token
        try {
          console.log("refresh access token");
          const response = await UserService.refreshAccessToken(refreshToken);
          if (response && response.type == "Success") {
            localStorage.setItem("accessToken", String(response.message.accessToken));
          }
          const response1 = await UserService.getUserByToken(refreshToken);
          if (response && response.type == "Success") {
            return response1.message;
          }
        } catch (error) {
          throw error;
        }
      }

      if (!isAccessTokenExpired && !isRefreshTokenExpired) {
        // get user
        try {
          console.log("Get user");
          const response = await UserService.getUserByToken(refreshToken);
          if (response && response.type == "Success") {
            return response.message;
          }
        } catch (err) {
          throw err;
        }
      }
    }
  } else {
    console.log("👉️ can't use localStorage get user");
  }
};

export default getUser;
