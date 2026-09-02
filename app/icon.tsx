import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#8b3156",
          color: "#fffaf4",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: 310,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          letterSpacing: -24,
          width: "100%",
        }}
      >
        C
      </div>
    ),
    size,
  );
}
