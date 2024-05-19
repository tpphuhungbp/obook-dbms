"use client";

import React, { useState } from "react";
import { ConfigProvider, Modal, Upload } from "antd";
import Link from "next/link";
import useUser from "@/stores/user-store";
import ImgCrop from "antd-img-crop";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import PostService from "@/services/api/post-api";
import usePost from "@/stores/post-store";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// fix css component
const ModalPost = ({ open, setOpen }: Props) => {
  const { user } = useUser();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { post, addPost } = usePost();
  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    console.log(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as RcFile);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const getDescription = (event: any) => {
    setDescription(event.target.value);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    // create new post and update state post in store
    const response = await PostService.createPost(
      user.user_id as string,
      description,
      fileList
    );

    if (response && response.type == "Success") {
      addPost(
        response?.message.user,
        response.message.post,
        response.message.photos
      );
    }

    setTimeout(() => {
      setOpen(false);
      setFileList([]);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-center">
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#242526",
              headerBg: "#242526",
              titleColor: "#ffff",
              titleFontSize: 25,
            },
          },
        }}
      >
        <Modal
          className="bg-[#242526]  rounded-[10px] "
          title="Tạo bài viết"
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <header className=" flex items-center text-white">
            <Link href={`/profile/${user.user_id}`} className="relative">
              <img
                src={user.avatar != "" ? user.avatar : "./thumb/user.png"}
                className="h-[50px] w-[50px] rounded-full mr-4"
              />
            </Link>
            <div className="flex flex-col justify-between">
              <h1 className="font-semibold text-[18px]">{`${user.firstName} ${user.lastName}`}</h1>
              <h3 className=" bg-[#3A3B3C] p-1 rounded-[4px] text-center">
                Công khai
              </h3>
            </div>
          </header>
          <input
            type="text"
            className=" w-full bg-transparent h-[30px]  text-[22px] mt-[20px] text-white"
            placeholder={`${user.firstName} ${user.lastName} ơi, bạn đang nghĩ gì thế ?`}
            onChange={getDescription}
          />

          <ol className="mt-[50px]">
            <ImgCrop rotationSlider>
              <Upload
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                listType="picture-card"
                fileList={fileList}
                onChange={onChange}
                onPreview={onPreview}
              >
                {fileList.length < 5 && "+ Upload"}
              </Upload>
            </ImgCrop>
          </ol>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default ModalPost;
