import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon for "Add to Dock"/Home Screen. iOS rounds the corners.
// The cloud is built from plain divs so no emoji/font is needed at build time.
function puff(left: number, top: number, d: number) {
  return {
    position: "absolute" as const,
    left,
    top,
    width: d,
    height: d,
    borderRadius: d / 2,
    background: "#ffffff",
    display: "flex",
  };
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(160deg, #38bdf8, #0284c7)",
        }}
      >
        <div style={{ position: "absolute", left: 42, top: 96, width: 96, height: 40, borderRadius: 20, background: "#ffffff", display: "flex" }} />
        <div style={puff(40, 82, 54)} />
        <div style={puff(66, 56, 72)} />
        <div style={puff(100, 80, 56)} />
      </div>
    ),
    { ...size },
  );
}
