async function loadMinistries() {
  const select = document.getElementById("ministry");

  const ministries = [
    "Prime Minister and Ministry of Defence and Industry",
    "Ministry of Finance",
    "Ministry of Home Affairs",
    "Ministry of Foreign Affairs",
    "Ministry of Education, Science and Technology",
    "Ministry of Health and Population",
    "Ministry of Energy, Water Resources and Irrigation",
    "Ministry of Tourism, Culture and Civil Aviation",
    "Ministry of Agriculture and Livestock Development"
  ];

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

    result.textContent = `
Name: ${data.name}
Age: ${data.age}
Education: ${data.education}
Achievements:
- ${data.achievements.join("\n- ")}
    `.trim();
  } catch (err) {
    result.textContent = "Error fetching data.";
  }
}

loadMinistries();
