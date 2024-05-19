"use client";

import DefaultLayout from "@/components/layout/default-layout/page";
import { SidebarLeft, SidebarRight } from "@/components/component-layout";
import { StoryCard, CreatePost, Post } from "@/components/common";
import { IPost, IUser } from "@/interfaces";
import { useEffect, useState } from "react";
import { Skeleton } from "antd";
import useUser from "@/stores/user-store";
import PostService from "@/services/api/post-api";
import getUser from "@/services/get-user";
import usePost from "@/stores/post-store";
import UserService from "@/services/api/user-api";

export default function Home() {
  // checkLogin();
  const { user, setUser } = useUser();
  const { post, setPost } = usePost();
  const [follower, setFollower] = useState<IUser>();
  const [friends, setFriend] = useState<IUser[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user.user_id) setUser(await getUser());
        setLoading(true);

        if (post.posts.length == 0) {
          const response = await PostService.getAllPost();
          if (response && response.type == "Success") {
            setPost(
              response?.message?.users,
              response?.message?.posts,
              response?.message?.photos,
              response?.message?.listPostLike
            );
          }
        }

        const response1 = await UserService.getFollower();
        if (response1 && response1.type == "Success") {
          setFollower(response1.message.follower[0]);
        }

        const response2 = await UserService.getFriend();
        if (response2 && response2.type == "Success") {
          setFriend(response2.message.friends);
        }
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DefaultLayout>
      <SidebarLeft current_user={user} />
      <div className="content col-span-6 px-[32px] mt-[25px]">
        <div className="max-w-[750px] mx-auto h-[10000px] ">
          <ul className="w-full grid grid-cols-4 gap-3">
            <StoryCard isStory={false} user={user} />
            <StoryCard isStory={true} user={user} />
            <StoryCard isStory={true} user={user} />
            <StoryCard isStory={true} user={user} />
          </ul>

          <CreatePost current_user={user} />

          {isLoading && <Skeleton className=" bg-white" active />}
          {!isLoading &&
            post.posts.map((childPost: IPost, index: number) => {
              let isLike: boolean = post.listPostLike.find((ele) => childPost.post_id == ele)
                ? true
                : false;
              return (
                <Post
                  key={childPost.post_id}
                  user={post.users[index]}
                  post={childPost}
                  photos={post.photos[index]}
                  isLike={isLike}
                  isOwner={user.user_id == post.users[index].user_id}
                />
              );
            })}
        </div>
      </div>
      <SidebarRight follower={follower as IUser} friends={friends} />
    </DefaultLayout>
  );
}
