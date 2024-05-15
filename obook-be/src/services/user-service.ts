import IUser from "../models/user-model";
import { IResponse } from "../interfaces/response-interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import getValue from "../helpers/get-value";
import brycpt from "bcrypt";
import generateUniqueId from "generate-unique-id";
import { StatusCodes } from "http-status-codes";
import checkFollow from "../helpers/check-follow";
import getList from "../helpers/get-list";
import cloudinary from "../utils/connect-cloudinary";
import { dbClient } from "../utils/connect-pg";
import { text } from "body-parser";

class UserService {
  static createUser = async (userInfor: IUser): Promise<IResponse> => {
    try {
      console.log("create user service");
      if (
        userInfor.email == "" ||
        userInfor.password == "" ||
        userInfor.firstName == "" ||
        userInfor.lastName == ""
      ) {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Invalid input error",
        };
      }
      const existUser = await dbClient.query({
        text: `SELECT * FROM users WHERE email = $1;`,
        values: [userInfor.email],
      });
      if (existUser && existUser.rowCount) {
        console.log("exist user");
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Email already exists",
        };
      }

      const id: String = generateUniqueId({
        length: 32,
        useLetters: true,
      });

      const recordUser = await dbClient.query({
        text: `INSERT INTO users
        (user_id, last_name, first_name, email, password, avatar, dob, sex, refreshToken)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        values: [
          id,
          userInfor.lastName,
          userInfor.firstName,
          userInfor.email,
          userInfor.password,
          "",
          userInfor.dob,
          userInfor.sex,
          "",
        ],
      });

      const newUser = recordUser.rows[0];

      if (newUser) {
        console.log("new user ", newUser);
        newUser.password = "hidden";
        const refreshToken = await UserService.generateRefreshToken(id);
        return {
          type: "Success",
          code: StatusCodes.OK,
          message: {
            ...newUser,
            refreshToken,
            accessToken: UserService.generateAccessToken(id),
          },
        };
      }
      console.log("error");
      return {
        type: "Error",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Server error",
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  static loginUser = async ({ email, password }: IUser): Promise<IResponse> => {
    try {
      const recordUser = await dbClient.query({
        text: `SELECT * FROM users WHERE email = $1;`,
        values: [email],
      });

      if (recordUser && !recordUser.rowCount) {
        return {
          type: "Error",
          code: StatusCodes.BAD_REQUEST,
          message: "Account does not exist",
        };
      }

      if (recordUser && recordUser.rowCount == 1) {
        let user = recordUser.rows[0];
        const refreshToken = await UserService.generateRefreshToken(user.user_id);
        const result = await brycpt.compare(String(password), user?.password);
        if (result) {
          user.password = "hidden";
          //user.refreshToken='hidden';
          return {
            type: "Success",
            code: StatusCodes.OK,
            message: {
              ...user,
              refreshToken,
              accessToken: UserService.generateAccessToken(user.user_id),
            },
          };
        } else {
          return {
            type: "Error",
            code: StatusCodes.BAD_REQUEST,
            message: "The wrong password",
          };
        }
      }
      return {
        type: "Error",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Server error",
      };
    } catch (error) {
      throw error;
    }
  };

  static generateAccessToken = (id: String): String => {
    try {
      return jwt.sign({ id }, `${process.env.JWT_SECRET_KEY}`, {
        expiresIn: "1d",
      });
    } catch (err) {
      throw err;
    }
  };

  static generateRefreshToken = async (id: String): Promise<String> => {
    try {
      const refreshToken = jwt.sign({ id }, `${process.env.JWT_SECRET_KEY}`, {
        expiresIn: "3d",
      });
      await dbClient.query(
        `UPDATE users SET refreshToken = '${refreshToken}' WHERE user_id = '${id}' RETURNING *;`
      );
      return refreshToken;
    } catch (err) {
      throw err;
    }
  };

  static verifyRefreshToken = (token: string) => {
    try {
      if (token) {
        const decoded = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`) as JwtPayload;
        return {
          type: "Success",
          code: StatusCodes.OK,
          message: {
            accessToken: UserService.generateAccessToken(decoded.id),
          },
        };
      }

      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "No token provided",
      };
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Invalid refresh token",
      };
    }
  };

  static getFollower = async (user_id: string) => {
    try {
      const recordFollowers = await dbClient.query({
        text: `SELECT * FROM users WHERE user_id IN (SELECT follower_id FROM follows WHERE following_id = $1);`,
        values: [user_id],
      });

      const users = recordFollowers.rows;
      return {
        type: "Success",
        code: StatusCodes.OK,
        message: {
          follower: users,
        },
      };
    } catch (err) {
      throw err;
    }
  };

  static getFollowing = async (user_id: string) => {
    try {
      const recordFollowings = await dbClient.query({
        text: `SELECT * FROM users WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = $1);`,
        values: [user_id],
      });

      const users = recordFollowings.rows;
      return {
        type: "Success",
        code: StatusCodes.OK,
        message: {
          following: users,
        },
      };
    } catch (err) {
      throw err;
    }
  };

  static getFriend = async (user_id: string) => {
    try {
      const recordFollowings = await dbClient.query({
        text: `
          SELECT * FROM users 
          WHERE user_id IN (
            SELECT following_id FROM follows WHERE follower_id = $1
          ) AND user_id IN (
            SELECT follower_id FROM follows WHERE following_id = $1
          )
        `,
        values: [user_id],
      });

      const users = recordFollowings.rows;
      return {
        type: "Success",
        code: StatusCodes.OK,
        message: {
          friends: users,
        },
      };
    } catch (err) {
      throw err;
    }
  };

  static follow = async (follower_id: String, following_id: String) => {
    try {
      // if (follower_id == "" || following_id == "") {
      //   return {
      //     type: "Error",
      //     code: StatusCodes.BAD_REQUEST,
      //     message: "Error follow",
      //   } as IResponse;
      // }

      // const recordFollow = await neo4j.run(checkFollow(follower_id, following_id));

      // console.log(recordFollow.records[0].get("action"));

      // if (recordFollow && recordFollow.records.length > 0) {
      //   if (recordFollow.records[0].get("action")) {
      //     return {
      //       type: "Success",
      //       code: StatusCodes.OK,
      //       message: "Follow user successfully",
      //     } as IResponse;
      //   } else {
      //     return {
      //       type: "Success",
      //       code: StatusCodes.OK,
      //       message: "Unfollow user successfully",
      //     } as IResponse;
      //   }
      // } else {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "User not found",
      } as IResponse;
      // }
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Follow user failed",
      } as IResponse;
    }
  };

  static getUserByToken = async (token: string) => {
    try {
      if (token) {
        const decoded = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`) as JwtPayload;
        const userRecord = await dbClient.query(
          `SELECT * FROM users WHERE user_id = '${decoded.id}'`
        );

        const user = userRecord.rows[0];

        return {
          type: "Success",
          code: StatusCodes.OK,
          message: {
            ...user,
          },
        };
      }

      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "No token provided",
      };
    } catch (err) {
      return {
        type: "Error",
        code: StatusCodes.BAD_REQUEST,
        message: "Invalid refresh token",
      };
    }
  };

  static updateUser = async (user_id: string, avatar: string) => {
    try {
      // update features delete avatar in cloudinary in the future
      const resultUploadAvatar = await cloudinary.uploader.upload(avatar);
      const recordUser = await dbClient.query(`
                UPDATE users SET avatar = '${resultUploadAvatar.secure_url}' WHERE user_id = '${user_id}' RETURN *
            `);
      let user = recordUser.rows[0];

      return {
        type: "Success",
        code: StatusCodes.OK,
        message: {
          user,
        },
      };
    } catch (err) {
      throw err;
    }
  };
}

export default UserService;
