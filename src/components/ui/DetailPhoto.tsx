import Image from "next/image";

type DetailPhotoProps = {
  src: string;
  alt: string;
};

const DetailPhoto = (props: DetailPhotoProps) => {
  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={410}
      height={250}
      className="w-full object-cover"
    />
  );
};

export default DetailPhoto;
