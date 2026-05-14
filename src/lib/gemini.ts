import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!apiKey) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export async function generateCommentary(
  username: string,
  prediction: string,
  outcome: string,
  won: boolean,
  matchContext: string
): Promise<string> {
  const client = getGenAI();
  if (!client) return "";

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an enthusiastic, witty IPL cricket commentator on a fan prediction app.
A fan named "${username}" predicted "${prediction}" and the outcome was "${outcome}". They ${won ? "WON" : "LOST"}.
Match context: ${matchContext}

Write ONE SHORT, punchy, personalized commentary line (max 20 words) that:
- Addresses the fan by name
- Is excited if they won, sympathetic but funny if they lost
- Uses cricket slang and emojis
- Feels like a real commentator speaking to the fan

Only return the commentary line, nothing else.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateMoodInsight(messages: string[]): Promise<{
  mood: "frustrated" | "neutral" | "hyped" | "tense";
  score: number;
  summary: string;
}> {
  const client = getGenAI();
  if (!client) return { mood: "hyped", score: 75, summary: "Fans are loving it!" };

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Analyze the sentiment of these IPL fan chat messages and respond with ONLY valid JSON:
Messages: ${JSON.stringify(messages.slice(-15))}

Return exactly this JSON format:
{"mood": "hyped|frustrated|tense|neutral", "score": <0-100>, "summary": "<one short sentence about the fan mood>"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, "");
    return JSON.parse(text);
  } catch {
    return { mood: "hyped", score: 75, summary: "Fans are buzzing!" };
  }
}

export async function generatePostMatchStory(
  username: string,
  stats: {
    totalPredictions: number;
    correctPredictions: number;
    finalStreak: number;
    rank: number;
    fansCoinsEarned: number;
    matchName: string;
    badges: string[];
  }
): Promise<string> {
  const client = getGenAI();
  if (!client) return "What a match! You played brilliantly today.";

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Write a short, thrilling, personalized 3-sentence post-match story for an IPL fan on a prediction app.

Fan: ${username}
Match: ${stats.matchName}
Predictions: ${stats.correctPredictions} correct out of ${stats.totalPredictions}
Winning streak: ${stats.finalStreak}
Leaderboard rank: #${stats.rank}
FanCoins earned: ${stats.fansCoinsEarned}
Badges earned: ${stats.badges.join(", ") || "none"}

Make it epic, emotional, and feel like a highlight reel narration. Address the fan by name.
Keep it under 80 words. Use cricket metaphors and emojis.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function translateMessage(text: string, targetLanguage: string): Promise<string> {
  const client = getGenAI();
  if (!client) return `[Translated] ${text}`;

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Translate this fan chat message to ${targetLanguage}. Keep emojis and cricket slang intact. Return ONLY the translated text, nothing else.
Message: "${text}"`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return text; // fallback to original if failed
  }
}

export async function getFantasyAdvice(matchName: string): Promise<string> {
  const client = getGenAI();
  if (!client) return "Pick Jasprit Bumrah as Captain today! The pitch favors pace and his form is undeniable.";

  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an expert IPL fantasy cricket analyst.
Match: ${matchName}

Give me a quick 2-sentence fantasy cricket advice. Suggest 1 must-have player (Captain pick) and why, based on typical pitch conditions and recent form. Keep it punchy and use emojis.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return "Pick Virat Kohli as Captain today! He loves this ground and is due for a big score. 🔥";
  }
}
