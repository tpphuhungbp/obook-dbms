import UserService from "@/services/api/user-api";
import { Button, ConfigProvider, Modal, Upload, message } from "antd";
import {
  RcFile,
  UploadChangeParam,
  UploadFile,
  UploadProps,
} from "antd/es/upload/interface";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IoIosCamera } from "react-icons/io";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { IResponse } from "@/interfaces";
type Props = {
  name: string;
  userProfile_id: string;
  avatar: string;
  isFollow: boolean;
  setFollow: Dispatch<SetStateAction<boolean>>;
};

const ProfileHead = ({
  name,
  userProfile_id,
  avatar,
  isFollow,
  setFollow,
}: Props) => {
  const [open, setOpen] = useState(false);
  const imageLoader = ({ src }: any) => {
    return src;
  };
  const handleFollow = async () => {
    try {
      setFollow(!isFollow);
      await UserService.follow(userProfile_id);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="h-[550px] shadow rounded-[15px] mb-20 flex flex-col relative">
      {/* fix image avatar */}
      <Image
        loader={imageLoader}
        src="/mock/cover.jpeg"
        alt="cover photos"
        layout="fill"
        objectFit="cover"
      />
      <div className="absolute bottom-0 -mb-20 left-8 w-full">
        <div className="grid grid-cols-6">
          <div className="h-[220px] w-[220px] relative">
            <img
              src={avatar ? avatar : "../thumb/user.png"}
              className={` h-full w-full rounded-full border-[#0866FF] p-[2px] border-[2px]`}
            />
            <button
              className=" flex items-center justify-center absolute right-[20px] bottom-[20px] w-[40px] h-[40px] rounded-full bg-[#4E4F50]"
              onClick={() => setOpen(true)}
            >
              <IoIosCamera className=" text-[32px]" />
            </button>
            <ModalAvatar open={open} setOpen={setOpen} />
          </div>
          <div className="col-span-3">
            <strong className="bottom-2 absolute text-2xl">{name}</strong>
          </div>
          <div className="col-span-2">
            <div className="bottom-2 absolute right-11">
              <div className="flex flex-row">
                <Button
                  className="mr-2 bg-blue-600 border-none text-white font-bold w-fit text-sm flex items-center justify-center"
                  onClick={handleFollow}
                >
                  {isFollow ? "Đang theo dõi" : "Theo dõi"}
                </Button>
                <Button className="mr-2 bg-[#3A3B3C] border-none text-white font-bold w-fit text-sm flex items-center justify-center">
                  Nhắn tin
                </Button>
                <Button className="mr-2 bg-[#3A3B3C] border-none text-white font-bold w-fit text-sm flex items-center justify-center">
                  ...
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileNavBar = () => {
  return (
    <div className=" flex flex-col items-center justify-center p-5">
      <div className="w-full">
        <hr className="border-1 border-gray-700" />
      </div>
      <div className="w-full flex justify-between">
        <div className="flex flex-row text-sm">
          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Bài viết
          </span>

          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Giới thiệu
          </span>

          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Bạn bè
          </span>

          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Ảnh
          </span>

          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Videos
          </span>

          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Reels
          </span>

          <span className=" flex justify-center p-3 m-2 h-full items-center cursor-pointer hover:max-h-[60px] hover:rounded-[10px] hover:bg-[#3A3B3C]">
            Xem thêm
          </span>
        </div>
        <Button className="bg-[#3A3B3C] m-2 p-5 border-none text-white font-bold w-fit text-sm flex items-center justify-center">
          ...
        </Button>
      </div>
    </div>
  );
};

type ModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const ModalAvatar = ({ open, setOpen }: ModalProps) => {
  const router = useRouter();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      console.log(imageUrl);
      const response = await UserService.updateUser(imageUrl as string);

      if (response && response.type === "Success") {
        window.location.reload();
      }
    } catch (err) {
      throw err;
    }
    setTimeout(() => {
      setOpen(false);
      setImageUrl("");
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setImageUrl("");
    setOpen(false);
  };
  return (
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
        title="Chọn ảnh đại diện"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          action="https://run.mocky.io/v3/0713439f-7371-44db-93f5-1ddd3f2b8630"
          onChange={handleChange}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="avatar"
              className="w-full h-full rounded-full"
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </Modal>
    </ConfigProvider>
  );
};

export { ProfileHead, ProfileNavBar };
