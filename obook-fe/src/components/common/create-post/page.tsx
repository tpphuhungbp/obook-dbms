"use client";
import { BiSolidVideoPlus } from "react-icons/bi";
import { IoIosImages } from "react-icons/io";
import { FaSmileBeam } from "react-icons/fa";
import { ModalPost } from "..";
import { useState } from "react";
import IUser from "@/interfaces/user-interface";

type Props = {
  current_user: IUser;
};

const CreatePost = ({ current_user }: Props) => {
  const [open, setOpen] = useState(false);
  console.log(current_user)
  return (
    <div className="bg-[#242526] px-[20px] my-[25px]  h-[150px] rounded-[10px] py-[15px] ">
      <section className="flex items-center ">
        <img
          src={current_user.avatar ? current_user.avatar : "./thumb/user.png"}
          className="w-[50px] h-[50px] rounded-full"
        />
        <button
          className="h-[50px] rounded-[30px] bg-[#3A3B3C] text-[#728087]  ms-[15px] w-full hover:brightness-125"
          onClick={() => setOpen(true)}
        >
          <span className="flex ps-[15px]  bg-transparent h-[30px]  text-[22px]">
            {`${current_user.firstName} ${current_user.lastName}`} ơi, bạn đang
            nghĩ gì thế ?
          </span>
        </button>
      </section>

      <span className="bg-[#3A3B3C]  h-[1.2px] w-full block mt-[15px] mb-[10px]"></span>

      <nav className="grid grid-cols-3 mx-auto gap-2 h-[50px]">
        <span className="flex items-center justify-center hover:rounded-[10px] hover:bg-[#3A3B3C]">
          <BiSolidVideoPlus className="text-[#F23E5C] text-[35px]" />
          <h3 className="text-[#7f8286] font-bold ms-[10px] text-[18px]">
            Video trực tiếp
          </h3>
        </span>

        <span className="flex items-center justify-center hover:rounded-[10px] hover:bg-[#3A3B3C]">
          <IoIosImages className="text-[#58C472] text-[30px]" />
          <h3 className="text-[#7f8286] font-bold ms-[10px] text-[18px]">
            Ảnh/video{" "}
          </h3>
        </span>

        <span className="flex items-center justify-center hover:rounded-[10px] hover:bg-[#3A3B3C]">
          <FaSmileBeam className="text-[#F3BD3E] text-[30px]" />
          <h3 className="text-[#7f8286] font-bold ms-[10px] text-[18px]">
            Cảm xúc/hoạt động
          </h3>
        </span>
      </nav>

      <ModalPost open={open} setOpen={setOpen} />
    </div>
  );
};

export default CreatePost;
