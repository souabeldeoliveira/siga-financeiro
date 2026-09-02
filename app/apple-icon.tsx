import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#8b3156",
          color: "#fffaf4",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          fontSize: 110,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          letterSpacing: -8,
          width: "100%",
        }}
      >
        C
      </div>
    ),
    size,
  );
}
