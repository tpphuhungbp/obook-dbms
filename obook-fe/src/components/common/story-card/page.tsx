"use client";

import IUser from "@/interfaces/user-interface";
import { IoMdAddCircle } from "react-icons/io";

type Props = {
  user?: IUser;
  isStory?: boolean;
  story?: string;
};

const StoryCard = ({ user, isStory, story }: Props) => {
  return (
    <li>
      {isStory == false ? (
        <div className="h-[300px] shadow rounded-[15px] flex flex-col relative  hover:brightness-[80%]">
          <img
            src={user?.avatar ? user.avatar : "./thumb/user.png"}
            className="h-[80%] rounded-t-[15px] bg-white"
          />
          <div className="bg-[#242526] h-[20%] rounded-b-[15px] w-full flex flex-col justify-end">
            <h2 className="font-semibold flex justify-center text-[16px] mb-[10px]">Tạo tin</h2>
          </div>
          <span className="block w-full border-0 absolute bottom-[12%]">
            <IoMdAddCircle className="bg-[#242526] mx-auto border-[#242526] border-[4px] rounded-full text-[45px] text-[#075CE5] " />
          </span>
        </div>
      ) : (
        <div className="h-[300px] shadow rounded-[15px] flex flex-col relative ">
          <img
            src={`./thumb/stories${Math.floor(Math.random() * 3) + 1}.jpg`}
            className="w-full h-full rounded-[15px] transform scale-100 hover:scale-105 transition-transform hover:brightness-[80%]"
          />
          <span className=" absolute top-[15px] left-[15px]">
            <img
              src={user?.avatar ? user.avatar : "./thumb/user.png"}
              className={`h-[45px] w-[45px] rounded-full mr-4  border-[#0866FF] p-[2px] border-[2px] `}
            />
            <span className="bg-[#46AB5E] rounded-full block w-[12px] h-[12px] absolute right-[18px] bottom-0  border-black border-[2px]"></span>
          </span>
          <span className="absolute bottom-[10px] left-[15px] font-semibold ">{`${user?.firstName} ${user?.lastName}`}</span>
        </div>
      )}
    </li>
  );
};

export default StoryCard;
