import { useState, useEffect } from "react";

const ANIME_QUOTES = [
  "Sugoi! You're doing amazing today! ✨",
  "Ganbatte! Keep building your habits! 💪",
  "Subarashii! Every step counts! 🌸",
  "Kawaii habits bring a happy day! 💖",
  "Great job! I'm super proud of you! 🌟",
  "Consistent effort turns into magic! 🎉",
];

const EXPRESSIONS = {
  idle: { emoji: "🐰", mood: "Kiko-chan is cheering for you!", aura: "rgba(236, 72, 153, 0.2)" },
  happy: { emoji: "😺✨", mood: "Yatta! Great job!", aura: "rgba(16, 185, 129, 0.3)" },
  cheering: { emoji: "🥳🎉", mood: "SUGOI! Habit completed!", aura: "rgba(139, 92, 246, 0.35)" },
  proud: { emoji: "👑💖", mood: "Subarashii! Champion streak!", aura: "rgba(245, 158, 11, 0.35)" },
};

function AnimeMascot({ triggerEvent, completedCount }) {
  const [expression, setExpression] = useState("idle");
  const [speech, setSpeech] = useState("Konnichiwa! Let's conquer today's habits! 🌸");
  const [isBouncing, setIsBouncing] = useState(false);

  // Trigger reaction when a habit is checked/toggled
  useEffect(() => {
    if (!triggerEvent) return;

    const moodKeys = ["cheering", "happy", "proud"];
    const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)];
    const randomQuote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];

    const animTimer = setTimeout(() => {
      setExpression(randomMood);
      setSpeech(randomQuote);
      setIsBouncing(true);
    }, 0);

    const resetTimer = setTimeout(() => {
      setExpression("idle");
      setIsBouncing(false);
    }, 3500);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(resetTimer);
    };
  }, [triggerEvent]);

  const handleMascotClick = () => {
    setIsBouncing(true);
    const quote = ANIME_QUOTES[Math.floor(Math.random() * ANIME_QUOTES.length)];
    setSpeech(quote);
    setTimeout(() => setIsBouncing(false), 1000);
  };

  const current = EXPRESSIONS[expression] || EXPRESSIONS.idle;

  return (
    <div className="anime-mascot-card" onClick={handleMascotClick} title="Click Kiko-chan for motivation!">
      <div className="anime-speech-bubble">
        <span className="anime-speech-sparkle">✨</span>
        {speech}
      </div>

      <div className={`anime-mascot-avatar ${isBouncing ? "bounce-anim" : "float-anim"}`} style={{ boxShadow: `0 0 25px ${current.aura}` }}>
        <span className="anime-mascot-emoji">{current.emoji}</span>
      </div>

      <div className="anime-mascot-info">
        <div className="anime-mascot-name">Kiko-chan 🎀</div>
        <div className="anime-mascot-status">{current.mood}</div>
        {completedCount > 0 && (
          <div className="anime-badge-streak">
            🌸 {completedCount} Done Today!
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimeMascot;
