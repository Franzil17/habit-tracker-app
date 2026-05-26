const habitForm = document.getElementById("habitForm");
const habitList = document.getElementById("habits");

habitForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const habitName = document.getElementById("habitName").value;
  const habitFrequency = document.getElementById("habitFrequency").value;

  const habit = {
    id: Date.now(),
    name: habitName,
    frequency: habitFrequency,
    completed: false
  };

  // Send to backend
  await fetch("http://127.0.0.1:8000/habits/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit)
  });

  // Update UI
  addHabitToList(habit);
  habitForm.reset();
});

function addHabitToList(habit) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span>${habit.name} (${habit.frequency})</span>
    <button onclick="toggleHabit(${habit.id})">Mark Done</button>
  `;
  habitList.appendChild(li);
}

async function toggleHabit(id) {
  // For now, just update UI
  alert("Habit marked as done!");
}