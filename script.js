import { ministerMap } from "./data/ministermap.js";

// Get DOM elements
const dropdown = document.getElementById("ministry");
const resultBox = document.getElementById("result");

// Add default option
const defaultOption = document.createElement("option");
defaultOption.value = "";
defaultOption.textContent = "-- Select your ministry --";
dropdown.appendChild(defaultOption);

// Populate dropdown from ministerMap
Object.keys(ministerMap).forEach(ministry => {
  const option = document.createElement("option");
  option.value = ministry;
  option.textContent = ministry;
  dropdown.appendChild(option);
});

// Auto-fetch when user selects a ministry
dropdown.addEventListener("change", async () => {
  const ministry = dropdown.value;

  if (!ministry) {
    resultBox.textContent = "";
    return;
  }

  resultBox.textContent = "Loading...";

  try {
    const response = await fetch(`/api/ministers?ministry=${encodeURIComponent(ministry)}`);
    const data = await response.json();

    if (data.error) {
      resultBox.textContent = data.error;
      return;
    }

    // Display results in plain text
    resultBox.textContent = `
Name: ${data.name}
Age: ${data.age}
Education: ${data.education}
Achievements:
- ${data.achievements.join("\n- ")}
    `.trim();

  } catch (err) {
    resultBox.textContent = "Server error";
  }
});
