import { ministerMap } from "./data/ministermap.js";

async function loadMinistries() {
  const select = document.getElementById("ministry");
  Object.keys(ministerMap).forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });
  select.addEventListener("change", fetchMinister);
}

// fetch minister AI text
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

    result.textContent = data.result || "No response from AI";

  } catch (err) {
    console.error(err);
    result.textContent = "Error fetching data.";
  }
}

// Load ministries first, then fetch first minister
loadMinistries().then(() => fetchMinister());
