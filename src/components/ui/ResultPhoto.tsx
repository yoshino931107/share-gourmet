import Image from "next/image";

const ResultPhoto = (props) => {
  return (
    <Image
      src={props.src}
      alt={props.alt}
      width={150}
      height={150}
      className="aspect-square rounded object-cover"
    />
  );
};

export default ResultPhoto;
