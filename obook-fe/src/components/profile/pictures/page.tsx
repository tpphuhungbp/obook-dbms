import Image from "next/image";

const PersonImages = () => {
  return (
    <div className="bg-[#242526] rounded-xl p-4">
      <div className="flex justify-between">
        <strong className="text-xl">Ảnh</strong>
        <span className="text-blue-6 hover:underline">Xem tất cả ảnh</span>
      </div>
      <div className="grid grid-cols-3 w-full py-3">
        <Image
          src="/mock/mock-image1.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image2.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image1.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image1.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image2.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image1.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image2.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image2.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />

        <Image
          src="/mock/mock-image1.png"
          alt=""
          width={0}
          height={0}
          objectFit="cover"
          sizes="100vw"
          className="w-full rounded-xl p-1"
        />
      </div>
    </div>
  );
};

export default PersonImages;
