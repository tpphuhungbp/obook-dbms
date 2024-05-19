"use client";

import React from "react";
import Image from "next/image";
import SignUpForm from "@/components/authen/signup/page";

const SignUp = () => {
  return (
    <div className=" w-full bg-gray-100 h-screen flex items-center justify-center">
      <div className="w-1/4">
        <div className="w-full flex items-center justify-center">
          <Image
            src={"/thumb/fakebook-logo.png"}
            width={300}
            height={100}
            alt="Fotobook Logo"
            className="py-4"
          />
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
