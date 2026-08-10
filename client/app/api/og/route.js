import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawNote = searchParams.get("note") || searchParams.get("msg") || "";
    const note = rawNote.trim() || "A special digital bouquet created with love for you.";
    const sender = (searchParams.get("sender") || searchParams.get("from") || "").trim();
    const count = searchParams.get("count") || "7";
    const giftTitle = searchParams.get("title") || "Digital Bouquet";
    const type = searchParams.get("type") || "bouquet";

    const emojiMap = {
      bouquet: "💐 🌸 🌹",
      cake: "🎂 ✨ 🕯️",
      card: "💌 💖 🌸",
      hug: "🤗 💖 ✨",
      plushie: "🧸 🎁 ✨",
    };

    const emojis = emojiMap[type] || "💐 🌸 🌹";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff5f6",
            backgroundImage: "radial-gradient(circle at 40px 40px, #fbc4ab 2.5%, transparent 0%), radial-gradient(circle at 120px 120px, #e48d9c 2.5%, transparent 0%)",
            backgroundSize: "160px 160px",
            padding: "50px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              borderRadius: "36px",
              padding: "45px 55px",
              boxShadow: "0 25px 60px rgba(124, 67, 67, 0.18)",
              border: "2.5px solid #e48d9c",
              textAlign: "center",
              width: "100%",
              maxWidth: "1080px",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>{emojis}</div>
            
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#a65d5d",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Petals and Words • {giftTitle}
            </div>

            <div
              style={{
                fontSize: 34,
                color: "#3d3028",
                fontStyle: "italic",
                lineHeight: 1.4,
                marginBottom: 24,
                maxHeight: "140px",
                overflow: "hidden",
              }}
            >
              "{note.length > 110 ? note.substring(0, 110) + "..." : note}"
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "#fff5f6",
                border: "1.5px solid #e48d9c",
                borderRadius: "999px",
                padding: "10px 28px",
              }}
            >
              <span style={{ fontSize: 18, color: "#7c4343", fontWeight: 700 }}>
                {sender ? `From: ${sender}` : "Made specially for you"}
              </span>
              {type === "bouquet" && (
                <span style={{ fontSize: 16, color: "#a65d5d" }}>
                  • {count} Custom Flowers
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err) {
    return new Response(`Failed to generate OG image`, { status: 500 });
  }
}
