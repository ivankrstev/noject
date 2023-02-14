import Image from "next/image";
import logo from "@/public/logo.svg";

export default function LogoWrapper() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Image
        width={90}
        src={logo}
        alt='Logo Icon'
        style={{
          filter:
            "invert(29%) sepia(100%) saturate(2765%) hue-rotate(201deg) brightness(96%) contrast(96%)",
        }}
      />
      <h1>Noject</h1>
    </div>
  );
}
