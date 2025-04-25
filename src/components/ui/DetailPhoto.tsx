import Image from "next/image";

const DetailPhoto = (props) => {
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
