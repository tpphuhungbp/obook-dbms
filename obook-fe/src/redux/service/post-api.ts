"use client";
import IResponse from "@/interfaces/response-interface";
import { axiosBaseQuery } from "@/utils/axios-base-query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let accessToken: string;

if (typeof localStorage !== "undefined") {
  console.log("use localStorage post api");
  accessToken = localStorage.getItem("accessToken") as string;
} else {
  console.log("👉️ can't use localStorage post api");
}

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_DOMAIN_SERVER}/api/posts`,
  }),
  endpoints: (build) => ({
    getAllPost: build.query<IResponse, void>({
      query: () => ({
        url: `/`,
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    }),

    getPost: build.query<IResponse, string>({
      query: (post_id) => ({
        url: `/${post_id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    }),

    liked: build.mutation<IResponse, string>({
      query: (post_id) => ({
        url: "/like",
        method: "POST",
        data: {
          post_id,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    }),
  }),
});

export const { useGetAllPostQuery, useGetPostQuery, useLikedMutation } = postApi;
