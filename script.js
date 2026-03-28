import { ministerMap } from "./data/ministermap.js";

async function loadMinistries() {
  const select = document.getElementById("ministry");

  // Populate <select> with ministries
  const ministries = Object.keys(ministerMap);
  ministries.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });

  // Fetch minister info when selection changes
  select.addEventListener("change", fetchMinister);

  // Auto-fetch first ministry on load
  if (ministries.length > 0) {
    select.value = ministries[0];
    fetchMinister();
  }
}

async function fetchMinister() {
  const ministry = document.getElementById("ministry").value;
  const result = document.getElementById("result");

  result.textContent = "Loading...";

  try {
    const res = await fetch(`/api/ministers?ministry=${encodeURIComponent(ministry)}`);
    const data = await res.json();

    if (!res.ok) {
      result.textContent = data.error || "Unknown error";
      return;
    }

    // Display AI-generated text directly
    result.textContent = data.result || "No response from AI.";

  } catch (err) {
    console.error(err);
    result.textContent = "Error fetching data.";
  }
}

// Initialize
loadMinistries();
