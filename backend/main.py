from fastapi import FastAPI
import google.generativeai as genai
import os
import json
from pydantic import BaseModel

app = FastAPI(title="FanPulse 2.0 Backend")

# Setup Gemini (make sure to set GEMINI_API_KEY env var)
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class UserProfile(BaseModel):
    user_id: str
    recent_win_rate: float
    favorite_prediction: str
    current_streak: int

@app.get("/")
def read_root():
    return {"message": "Welcome to FanPulse 2.0 Gamification Engine"}

@app.post("/api/v1/gamification/generate_quest")
def generate_quest(profile: UserProfile):
    prompt = f"""
    You are an AI game master for a live sports prediction app. 
    The user's stats are:
    - Recent Win Rate: {profile.recent_win_rate}
    - Favorite Event to Predict: {profile.favorite_prediction}
    - Current Winning Streak: {profile.current_streak}
    
    Based on this, generate a personalized daily quest for them to complete during today's match.
    - If their win rate is low (< 0.4), make the quest very easy (a 'Safe Bet') to build their confidence.
    - If their streak is high (> 3), give them a high-risk, high-reward 'Expert Challenge'.
    
    Return the response STRICTLY as a valid JSON object with these exact keys:
    "quest_title" (string), "quest_description" (string), "target_event" (string), "reward_coins" (integer)
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}

# To run locally: uvicorn main:app --reload
