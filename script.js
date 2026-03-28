import { ministerMap } from "./data/ministermap.js";

async function loadMinistries() {
  const select = document.getElementById("ministry");

  // ✅ Use single source of truth
  const ministries = Object.keys(ministerMap);

  ministries.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    select.appendChild(opt);
  });

  select.addEventListener("change", fetchMinister);
}

async function fetchMinister() {
  const ministry = document.getElementById("ministry").value;
  const result = document.getElementById("result");

  result.textContent = "Loading...";

  try {
    const res = await fetch(`/api/ministers?ministry=${encodeURIComponent(ministry)}`);
    const data = await res.json();

    // Handle API errors safely
    if (!res.ok) {
      result.textContent = data.error || "Unknown error";
      return;
    }

    result.textContent = `
Name: ${data.name}
Age: ${data.age}
Education: ${data.education}
Achievements:
- ${data.achievements.join("\n- ")}
    `.trim();

  } catch (err) {
    console.error(err);
    result.textContent = "Error fetching data.";
  }
}

// ✅ Load + auto fetch first result
loadMinistries().then(fetchMinister);
