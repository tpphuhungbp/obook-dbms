"use client";
import useUser from "@/stores/user-store";
import checkTokenExpiration from "@/utils/check-token-expiration";
import { useRouter } from "next/navigation";
import UserService from "./api/user-api";

const checkLogin = async () => {
  const router = useRouter();
  if (typeof localStorage !== "undefined") {
    console.log("use localStorage checklogin");

    const accessToken = localStorage.getItem("accessToken") as string;
    const refreshToken = localStorage.getItem("refreshToken") as string;

    if (accessToken && refreshToken) {
      const isAccessTokenExpired = checkTokenExpiration(accessToken); // true: token expired,
      const isRefreshTokenExpired = checkTokenExpiration(refreshToken); // refresh token expired

      const { user, setUser } = useUser();

      if (!isAccessTokenExpired && !isRefreshTokenExpired && !user?.email) {
        // get user
        try {
          console.log("Get user");
          const response = await UserService.getUserByToken(refreshToken);
          if (response && response.type == "Success") {
            setUser(response.message);
          }
        } catch (err) {
          throw err;
        }
      } else if (isAccessTokenExpired && !isRefreshTokenExpired) {
        // refresh access token
        try {
          console.log("refresh access token");
          const response = await UserService.refreshAccessToken(refreshToken);
          if (response && response.type == "Success") {
            localStorage.setItem("accessToken", String(response.message.accessToken));
          }
        } catch (error) {
          throw error;
        }
      } else if (isAccessTokenExpired && isRefreshTokenExpired) {
        // login again
        console.log("login again");
        router.push("/authen/login");
      }
    }
  } else {
    console.log("👉️ can't use localStorage check login");
  }
};

export default checkLogin;
