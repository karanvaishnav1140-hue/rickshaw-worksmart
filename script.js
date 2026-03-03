let currentUser = "";
let editIndex = -1;
let allData = [];

function login() {
  const userId = document.getElementById("userId").value;
  if (!userId) return alert("Enter ID");

  currentUser = userId;
  localStorage.setItem("currentUser", currentUser);

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("welcomeUser").innerText = "Welcome, " + currentUser;

  loadData();
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function saveTank() {
  const cap = document.getElementById("tankCapacity").value;
  if (!cap) return alert("Enter tank capacity");
  localStorage.setItem(currentUser + "_tank", cap);
  alert("Tank capacity saved");
}

function addEntry() {

  const entry = {
    date: date.value,
    km: Number(km.value),
    earning: Number(earning.value),
    cngFilled: Number(cngFilled.value || 0),
    cngRemaining: Number(cngRemaining.value || 0),
    cngPrice: Number(cngPrice.value || 0)
  };

  if (!entry.date || !entry.km || !entry.earning)
    return alert("Fill required fields");

  if (editIndex === -1)
    allData.push(entry);
  else {
    allData[editIndex] = entry;
    editIndex = -1;
  }

  saveData();
  clearForm();
  renderTable(allData);
  calculateSummary(allData);
}

function loadData() {
  allData = JSON.parse(localStorage.getItem(currentUser)) || [];
  renderTable(allData);
  calculateSummary(allData);
}

function saveData() {
  localStorage.setItem(currentUser, JSON.stringify(allData));
}

function renderTable(data) {
  const table = document.getElementById("dataTable");
  table.innerHTML = "";

  data.forEach((item, index) => {
    table.innerHTML += `
      <tr>
        <td>${item.date}</td>
        <td>${item.km}</td>
        <td>${item.earning}</td>
        <td>${item.cngFilled}</td>
        <td>${item.cngRemaining}</td>
        <td>
          <button onclick="editEntry(${index})">Edit</button>
          <button onclick="deleteEntry(${index})" style="background:red;">Delete</button>
        </td>
      </tr>
    `;
  });
}

function editEntry(index) {
  const item = allData[index];
  date.value = item.date;
  km.value = item.km;
  earning.value = item.earning;
  cngFilled.value = item.cngFilled;
  cngRemaining.value = item.cngRemaining;
  cngPrice.value = item.cngPrice;
  editIndex = index;
}

function deleteEntry(index) {
  allData.splice(index, 1);
  saveData();
  renderTable(allData);
  calculateSummary(allData);
}

function calculateSummary(data) {

  let totalKM = 0;
  let totalEarn = 0;
  let totalCNG = 0;
  let totalCNGCost = 0;
  let lastRemaining = 0;

  data.forEach(item => {
    totalKM += item.km;
    totalEarn += item.earning;
    totalCNG += item.cngFilled;
    totalCNGCost += (item.cngFilled * item.cngPrice);
    lastRemaining = item.cngRemaining;
  });

  totalKMSpan = document.getElementById("totalKM");
  totalEarningSpan = document.getElementById("totalEarning");

  totalKMSpan.innerText = totalKM;
  totalEarningSpan.innerText = totalEarn;

  document.getElementById("aiEstimate").innerText =
    data.length ? Math.round(totalEarn / data.length) : 0;

  document.getElementById("totalCNG").innerText = totalCNG;
  document.getElementById("totalCNGCost").innerText = totalCNGCost;

  document.getElementById("netProfit").innerText =
    totalEarn - totalCNGCost;

  const avgKmPerKg = totalCNG ? (totalKM / totalCNG) : 0;
  document.getElementById("kmLeft").innerText =
    Math.round(lastRemaining * avgKmPerKg);

  const tankCap = localStorage.getItem(currentUser + "_tank");

  if (tankCap && lastRemaining < tankCap * 0.2)
    document.getElementById("fuelWarning").innerText =
      "⚠ Low Fuel! Please Fill CNG Soon!";
  else
    document.getElementById("fuelWarning").innerText = "";
}

function filterMonth() {
  const selected = monthFilter.value;
  if (!selected) return renderTable(allData);

  const filtered = allData.filter(item =>
    item.date.startsWith(selected)
  );

  renderTable(filtered);
  calculateSummary(filtered);
}

function clearForm() {
  date.value = "";
  km.value = "";
  earning.value = "";
  cngFilled.value = "";
  cngRemaining.value = "";
  cngPrice.value = "";
}

window.onload = function () {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    loginBox.style.display = "none";
    app.style.display = "block";
    welcomeUser.innerText = "Welcome, " + currentUser;
    loadData();
  }
};