import IPost from "../models/post-model";
import generateUniqueId from "generate-unique-id";
import getValue from "../helpers/get-value";
import getList from "../helpers/get-list";
import { IResponse } from "../interfaces/response-interface";
import { StatusCodes } from "http-status-codes";
import checkLike from "../helpers/check-like";
import type { UploadFile } from "antd/es/upload/interface";
import UploadService from "./upload-service";
import { IImageUpload } from "../interfaces/image-upload-interface";
import IPhoto from "../models/photo-model";
import { dbClient } from "../utils/connect-pg";

class PostService {
  // tim tat ca cac post,
  static getAllPost = async (user_id: string) => {
    try {
      console.log("Get all post trigger");

      //tim tat ca user
      const userResult = await dbClient.query(`
      SELECT * from users;
      `);
      console.log(`user result succes:`, userResult);

      //lay tat ca post id ma user id like
      const recordLikeResult = await dbClient.query(`
      SELECT 
          p.post_id AS liked_post_ids
      FROM 
          likes l
      JOIN 
          posts p ON l.post_id = p.post_id
      WHERE 
          l.user_id = '${user_id}';
      `);
      console.log(`recordLikeResult:`, recordLikeResult);
      let users = [];
      for (let i = 0; i < (userResult.rowCount ? userResult.rowCount : 0); i++) {
        users.push({
          user_id: userResult.rows[i].user_id,
          email: userResult.rows[i].email,
          password: userResult.rows[i].password,
          firstName: userResult.rows[i].first_name,
          lastName: userResult.rows[i].last_name,
          avatar: userResult.rows[i].avatar,
          age: 18,
          sex: userResult.rows[i].sex,
          dob: userResult.rows[i].dob,
          accessToken: userResult.rows[i].refreshtoken,
        });
      }

      // lay tat ca post
      const postsResult = await dbClient.query(`SELECT * from posts;`);
      console.log(`postsResult:`, postsResult);

      let posts = [];
      for (let i = 0; i < (postsResult.rowCount ? postsResult.rowCount : 0); i++) {
        // lay lay thong tin user cua tung post
        const getUserByPost = await dbClient.query(`SELECT * from users where user_id = $1;`, [
          postsResult.rows[i].user_id,
        ]);
        console.log("getUserByPost: ", getUserByPost);

        //lay so luong like cua cai post do
        const getLikesOfPost = await dbClient.query(
          `SELECT COUNT(*) FROM likes where post_id = $1 GROUP BY post_id;`,
          [postsResult.rows[i].post_id]
        );

        console.log("getLikesOfPost: ", getLikesOfPost);

        console.log("getUserByPost: ", getUserByPost.rows[0]);
        console.log("aaasdofijoasijdf");
        const newUser = {
          user_id: getUserByPost.rows[0].user_id,
          email: getUserByPost.rows[0].email,
          password: getUserByPost.rows[0].password,
          firstName: getUserByPost.rows[0].first_name,
          lastName: getUserByPost.rows[0].last_name,
          avatar: getUserByPost.rows[0].avatar,
          age: 18,
          sex: getUserByPost.rows[0].sex,
          dob: getUserByPost.rows[0].dob,
          accessToken: getUserByPost.rows[0].refreshtoken,
        };
        const newPost = {
          post_id: postsResult.rows[i].post_id,
          isGroup: false,
          user: newUser,
          description: postsResult.rows[i].description,
          comments: {
            user: postsResult.rows[i].user_id,
            message: "",
          },
          countLikes: getLikesOfPost.rowCount ? getLikesOfPost.rows[0].count : 0,
        };
        console.log("newPost: ", newPost);
        posts.push(newPost);
      }
      console.log("Posts: ", posts);

      let photos = [];
      for (let i = 0; i < (postsResult.rowCount ? postsResult.rowCount : 0); i++) {
        photos[i] = [];
        const getPhotosByPost = await dbClient.query(
          `select photos.photo_id, photos.source, photos.status from photos, post_has_photos where post_has_photos.photo_id = photos.photo_id and post_has_photos.post_id = $1;`,
          [posts[i].post_id]
        );
        if (getPhotosByPost.rows.length != 0) {
          for (let j = 0; j < getPhotosByPost.rows.length; j++) {
            photos[i] = getPhotosByPost.rows;
          }
        }
      }
      let listPostLike = [];
      for (let i = 0; i < recordLikeResult.rows.length; i++) {
        listPostLike.push(recordLikeResult.rows[i].liked_post_ids);
      }
      console.log("success: ");
      return {
        type: "Success",
        code: StatusCodes.OK,
        message: {
          users,
          posts,
          photos, //[], []
          listPostLike,
          // users: userResult.rows
        },
      } as IResponse;
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Get all posts failed",
      } as IResponse;
    }
  };

  static createPost = async ({ user_id, description }: IPost, fileList: UploadFile[]) => {
    try {
      if (user_id == "" || description == "" || fileList == null) {
        return {
          type: "Error",
          code: 400,
          message: "Content of the post error ",
        } as IResponse;
      }

      const post_id: String = generateUniqueId({
        length: 32,
        useLetters: true,
      });
      console.log("userResult: ", fileList);

      if (fileList) {
        // get url image from clouddinary
        const uploadImages = (await UploadService.uploadImages(fileList)) as IImageUpload[];
        const userResult = await dbClient.query(
          `
              SELECT * from users where user_id = $1;
            `,
          [user_id]
        );
        console.log("userResult: ", userResult.rows);
        const user = {
          user_id: userResult.rows[0].user_id,
          email: userResult.rows[0].email,
          password: userResult.rows[0].password,
          firstName: userResult.rows[0].first_name,
          lastName: userResult.rows[0].last_name,
          avatar: userResult.rows[0].avatar,
          sex: userResult.rows[0].sex,
          dob: userResult.rows[0].dob,
          accessToken: userResult.rows[0].refreshtoken,
        };
        const post = {
          post_id: post_id,
          isGroup: false,
          user: user,
          description: description,
        };
        const create = await dbClient.query(
          `
              insert into posts (post_id, description, status, user_id)
              values ($1, $2, $3, $4);
            `,
          [post_id, description, "public", user_id]
        );

        let photos = [];
        for (let i = 0; i < uploadImages.length; i++) {
          let uploadpt = await dbClient.query(
            `
                insert into photos (photo_id, status, source)
                values ($1, $2, $3)
              `,
            [uploadImages[i].photo_id, "public", uploadImages[i].url]
          );
          let uploadImg = await dbClient.query(
            `
                insert into post_has_photos (post_id, photo_id) values ($1, $2)
              `,
            [post_id, uploadImages[i].photo_id]
          );
          photos.push({
            photo_id: uploadImages[i].photo_id,
            source: uploadImages[i].url,
            status: "public",
          });
        }
        return {
          type: "Success",
          code: 200,
          message: {
            user,
            post,
            photos,
          },
        } as IResponse;
      }

      return {
        type: "Error",
        code: 400,
        message: "Create post failed",
      } as IResponse;
    } catch (err) {
      throw err;
    }
  };

  static getPostByPostId = async (post_id: String) => {
    try {
      if (post_id == "") {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Invalid post",
        } as IResponse;
      }

      const recordPost = await dbClient.query(
        `
            select * from posts where post_id = $1
          `,
        [post_id]
      );

      if (recordPost && recordPost.rows.length > 0) {
        //   const user = await getList(recordPost.records, "user");
        //   const post = await getList(recordPost.records, "post");
        //   const photos = await getList(recordPost.records, "photos", true);

        return {
          type: "Success",
          code: StatusCodes.OK,
          message: {
            // user,
            // post,
            // photos,
            post: recordPost.rows,
          },
        } as IResponse;
      } else {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Post not found",
        } as IResponse;
      }
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Get a post failed",
      } as IResponse;
    }
  };

  static getPostByUserId = async (user_id: string, current_user_id: string) => {
    try {
      if (user_id == "") {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Invalid post",
        } as IResponse;
      }

      const recordPost = await dbClient.query(
        `
        select * from posts where user_id = $1
      `,
        [user_id]
      );
      const recordLike = await dbClient.query(
        `
        select post_id from likes where user_id = $1
      `,
        [current_user_id]
      );

      if (recordPost && recordPost.rows.length > 0) {
        const userResult = await dbClient.query(
          `
          select * from users where user_id = $1
        `,
          [user_id]
        );
        const user = {
          user_id: userResult.rows[0].user_id,
          email: userResult.rows[0].email,
          password: userResult.rows[0].password,
          firstName: userResult.rows[0].first_name,
          lastName: userResult.rows[0].last_name,
          avatar: userResult.rows[0].avatar,
          sex: userResult.rows[0].sex,
          dob: userResult.rows[0].dob,
          accessToken: userResult.rows[0].refreshtoken,
        };
        const listPostLike = [];
        for (let i = 0; i < recordLike.rows.length; i++)
          listPostLike.push(recordLike.rows[i].post_id);
        const posts = [];
        const photos = [];
        for (let i = 0; i < recordPost.rows.length; i++) {
          posts.push({
            post_id: recordPost.rows[i].post_id,
            isGroup: false,
            user: user,
            description: recordPost.rows[i].description,
            status: recordPost.rows[i].status,
          });
          photos[i] = [];
          const getPhotosByPost = await dbClient.query(
            `
            select photos.photo_id, photos.source, photos.status
            from photos, post_has_photos 
            where post_has_photos.photo_id = photos.photo_id and post_has_photos.post_id = $1
          `,
            [recordPost.rows[i].post_id]
          );
          if (getPhotosByPost.rows.length != 0) {
            for (let j = 0; j < getPhotosByPost.rows.length; j++) {
              photos[i] = getPhotosByPost.rows;
            }
          }
        }

        return {
          type: "Success",
          code: StatusCodes.OK,
          message: {
            user,
            posts,
            photos,
            listPostLike,
          },
        } as IResponse;
      } else {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Post not found",
        } as IResponse;
      }
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Get a post failed",
      } as IResponse;
    }
  };

  static updatePost = async () => {
    throw new Error("Method not implemented.");
  };

  static deletePost = async (post_id: String) => {
    try {
      if (post_id == "") {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Invalid post",
        } as IResponse;
      }
      const getPhotosByPost = await dbClient.query(
        `
            select photos.photo_id, photos.source, photos.status
            from photos, post_has_photos 
            where post_has_photos.photo_id = photos.photo_id and post_has_photos.post_id = $1
      `,
        [post_id]
      );
      const deleteLikePost = await dbClient.query(
        `
        delete from likes where post_id = $1;
      `,
        [post_id]
      );
      const deletePhotos = await dbClient.query(
        `
        delete from post_has_photos where post_id = $1;  
      `,
        [post_id]
      );
      const deletePost = await dbClient.query(
        `
        delete from posts where post_id = $1;
      `,
        [post_id]
      );
      // const photos = (await getList(recordPost.records, "photo")) as IPhoto[];
      // UploadService.removeImages(photos);
      return {
        type: "Success",
        code: StatusCodes.OK,
        message: "Delete post successfully",
      } as IResponse;
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Delete a post failed",
      } as IResponse;
    }
  };

  static likePost = async (user_id: String, post_id: String) => {
    try {
      // if (user_id == "" || post_id == "") {
      //   return {
      //     type: "Error",
      //     code: StatusCodes.BAD_REQUEST,
      //     message: "Error like",
      //   } as IResponse;
      // }

      // const recordLike = await neo4j.run(checkLike(user_id, post_id));

      // if (recordLike && recordLike.records.length > 0) {
      //   if (recordLike.records[0].get("action")) {
      //     return {
      //       type: "Success",
      //       code: StatusCodes.OK,
      //       message: "Like post successfully",
      //     } as IResponse;
      //   } else {
      //     return {
      //       type: "Success",
      //       code: StatusCodes.OK,
      //       message: "UnLike post successfully",
      //     } as IResponse;
      //   }
      // } else {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "User or Post not found",
      } as IResponse;
      // }
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Like a post failed",
      } as IResponse;
    }
  };
}

export default PostService;
