// import backgroundImage from "././public/header_back.jpg";

export default function Header() {
  return (
    <>
      <header className="top-0 z-20 w-full max-w-[420px] border-b bg-[url('/header_back.jpg')] bg-cover bg-center bg-no-repeat p-3 backdrop-blur">
        {/* 半透明の白レイヤー */}
        <div className="pointer-events-none absolute inset-0 bg-white/78"></div>
        <img
          src="/share_gourmet_logo.svg"
          alt="Logo"
          className="relative z-10 h-8 w-auto"
        />
      </header>
    </>
  );
}
