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
  static getAllPost = async (user_id: string) => {
    try {
      // const recordPosts = await neo4j.run(
      //   `MATCH (user:User)-[:CONTAIN]->(post:Post)-[:HAS]->(photo:Photo)
      //           RETURN user, post, COLLECT(photo) as photos`
      // );
      // const recordLike = await neo4j.run(
      //   `MATCH (user:User{user_id:"${user_id}"})-[:LIKE]->(post:Post)
      //           RETURN COLLECT(DISTINCT post.post_id) AS liked_post_ids`
      // );
      // const users = await getList(recordPosts.records, "user");
      // const posts = await getList(recordPosts.records, "post");
      // const photos = await getList(recordPosts.records, "photos", true);
      // const listPostLike = recordLike.records[0].get("liked_post_ids");
      // Giả sử bạn đã thiết lập kết nối với PostgreSQL và có hàm để chạy truy vấn
      const userResult = await dbClient.query(`
      SELECT * from users;
      `);

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

      let users = [];
      for (let i = 0; i < userResult.rows.length; i++) {
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
        })
      }

      const postsResult = await dbClient.query(`
      SELECT * from posts;
      `);
      let posts = [];
      for (let i = 0; i < postsResult.rows.length; i++) {
        const getUserByPost = await dbClient.query(`
        SELECT * from users where user_id = $1;
        `, [postsResult.rows[i].user_id]);
        const getLikesOfPost = await dbClient.query(`
        SELECT COUNT(*)
        FROM likes where post_id = $1
        GROUP BY post_id;
        `, [postsResult.rows[i].post_id])
        posts.push({
          post_id: postsResult.rows[i].post_id,
          isGroup: false,
          user: {
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
          },
          description: postsResult.rows[i].description,
          comments: {
            user: postsResult.rows[i].user_id,
            message: '',
          },
          countLikes: getLikesOfPost.rows[0].count
        })
      }
      let photos = [];
      for (let i = 0; i < postsResult.rows.length; i++) {
        photos[i] = []
        const getPhotosByPost = await dbClient.query(`
          select photos.photo_id, photos.source, photos.status
          from photos, post_has_photos 
          where post_has_photos.photo_id = photos.photo_id and post_has_photos.post_id = $1
        `, [posts[i].post_id])
        if (getPhotosByPost.rows.length != 0) {
          for (let j = 0; j < getPhotosByPost.rows.length; j++) {
            photos[i] = getPhotosByPost.rows
          }
        }
      }
      let listPostLike = []
      for (let i = 0; i < recordLikeResult.rows.length; i++) {
        listPostLike.push(recordLikeResult.rows[i].liked_post_ids)
      }

      return {
        type: "Success",
        code: StatusCodes.OK,
        message: {
          users,
          posts,
          photos,
          listPostLike,
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
      //     if (user_id == "" || description == "" || fileList == null) {
      //       return {
      //         type: "Error",
      //         code: 400,
      //         message: "Content of the post error ",
      //       } as IResponse;
      //     }

      //     const post_id: String = generateUniqueId({
      //       length: 32,
      //       useLetters: true,
      //     });

      //     if (fileList) {
      //       // get url image from clouddinary
      //       const uploadImages = (await UploadService.uploadImages(fileList)) as IImageUpload[];
      //       // generate string Post-[:HAS]-Photo
      //       let strPhoto: String = "";
      //       uploadImages.forEach((image, index) => {
      //         strPhoto += `(p${index}:Photo {photo_id:'${image.photo_id}', source: '${image.url}', status: 'public'}),
      //                   (n)-[:HAS]->(p${index}),`;
      //       });
      //       const recordPost = await neo4j.run(
      //         `MATCH (u:User {user_id:'${user_id}'})
      //                   CREATE (n:Post {post_id:'${post_id}', description:'${description}', countLikes:0, status: 'public'}),
      //                   ${strPhoto}
      //                   (u)-[:CONTAIN]->(n)
      //                   RETURN n AS post, u AS user
      //                   `
      //       );
      //       const recordPhoto = await neo4j.run(`
      //               MATCH (n:Post{post_id:'${post_id}'})-[:HAS]->(p:Photo) RETURN p AS photos`);

      //       let user = await getValue(recordPost.records[0], "user");
      //       let post = await getValue(recordPost.records[0], "post");
      //       let photos = await getList(recordPhoto.records, "photos");
      //       return {
      //         type: "Success",
      //         code: 200,
      //         message: {
      //           user,
      //           post,
      //           photos: photos,
      //         },
      //       } as IResponse;
      //     }

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
      //     if (post_id == "") {
      //       return {
      //         type: "Error",
      //         code: StatusCodes.BAD_REQUEST,
      //         message: "Invalid post",
      //       } as IResponse;
      //     }

      //     const recordPost = await neo4j.run(
      //       `MATCH (user:User)-[:CONTAIN]->(post:Post {post_id:'${post_id}'})-[:HAS]->(photo:Photo)
      //               RETURN user, post, COLLECT(photo) as photos`
      //     );

      //     if (recordPost && recordPost.records.length > 0) {
      //       const user = await getList(recordPost.records, "user");
      //       const post = await getList(recordPost.records, "post");
      //       const photos = await getList(recordPost.records, "photos", true);

      //       return {
      //         type: "Success",
      //         code: StatusCodes.OK,
      //         message: {
      //           user: user[0],
      //           post: post[0],
      //           photos: photos[0],
      //         },
      //       } as IResponse;
      //     } else {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Post not found",
      } as IResponse;
      // }
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
      // if (user_id == "") {
      //   return {
      //     type: "Error",
      //     code: StatusCodes.BAD_REQUEST,
      //     message: "Invalid post",
      //   } as IResponse;
      // }

      // const recordPost = await neo4j.run(
      //   `MATCH (user:User {user_id:'${user_id}'})
      //            OPTIONAL MATCH (user)-[:CONTAIN]->(post:Post)-[:HAS]->(photo:Photo)
      //            RETURN user, post, COLLECT(photo) as photos`
      // );
      // const recordLike = await neo4j.run(
      //   `MATCH (user:User{user_id:"${current_user_id}"})-[:LIKE]->(post:Post)
      //           RETURN COLLECT(DISTINCT post.post_id) AS liked_post_ids`
      // );

      // if (recordPost && recordPost.records.length > 0) {
      //   const user = await getList(recordPost.records, "user");
      //   const listPostLike = recordLike.records[0].get("liked_post_ids");
      //   try {
      //     const posts = await getList(recordPost.records, "post");
      //     const photos = await getList(recordPost.records, "photos", true);
      //     return {
      //       type: "Success",
      //       code: StatusCodes.OK,
      //       message: {
      //         user: user[0],
      //         posts,
      //         photos,
      //         listPostLike,
      //       },
      //     } as IResponse;
      //   } catch (err) {
      //     return {
      //       type: "Success",
      //       code: StatusCodes.OK,
      //       message: {
      //         user: user[0],
      //         posts: [],
      //         photos: [],
      //         listPostLike,
      //       },
      //     } as IResponse;
      //   }
      // } else {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Post not found",
      } as IResponse;
      // }
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
      // if (post_id == "") {
      //   return {
      //     type: "Error",
      //     code: StatusCodes.BAD_REQUEST,
      //     message: "Invalid post",
      //   } as IResponse;
      // }

      // const recordPost = await neo4j.run(
      //   `MATCH (post:Post {post_id: "${post_id}"})-[:HAS]->(photo:Photo) DETACH DELETE post RETURN post, photo`
      // );

      // if (recordPost && recordPost.records.length > 0) {
      //   const photos = (await getList(recordPost.records, "photo")) as IPhoto[];
      //   UploadService.removeImages(photos);
      //   return {
      //     type: "Success",
      //     code: StatusCodes.OK,
      //     message: "Delete post successfully",
      //   } as IResponse;
      // } else {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Post not found",
      } as IResponse;
      // }
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
