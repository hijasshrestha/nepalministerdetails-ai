import { ministerMap } from "./data/ministermap.js";

async function loadMinistries() {
  const select = document.getElementById("ministry");

  // Populate dropdown
  Object.keys(ministerMap).forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });

  // Trigger AI fetch on selection
  select.addEventListener("change", fetchMinister);
}

// Fetch AI description for selected minister
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

    // Display AI free-text response
    result.textContent = data.result || "No response from AI";

  } catch (err) {
    console.error(err);
    result.textContent = "Error fetching data.";
  }
}

// Load ministries first, then fetch first minister
loadMinistries().then(() => fetchMinister());
