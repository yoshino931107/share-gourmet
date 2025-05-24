import Image from "next/image";

type ResultPhotoProps = {
  src: string;
  alt: string;
};

const ResultPhoto = (props: ResultPhotoProps) => {
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
