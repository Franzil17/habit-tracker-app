from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Habit(BaseModel):
    id: int
    name: str
    frequency: str
    completed: bool = False

habits = []

@app.post("/habits/")
def add_habit(habit: Habit):
    habits.append(habit)
    return {"message": "Habit added successfully"}

@app.get("/habits/")
def list_habits():
    return habits