import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
  get,
  update
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

// == Firebase Config ==
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  databaseURL: "DATABASE_URL",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGING_SENDER_ID",
  appId: "APP_ID",
  measurementId: "MEASUREMENT_ID"
};

// == Initialize Firebase ==
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// == UI Elements ==
const authSection = document.getElementById("auth-section");
const dataSection = document.getElementById("data-section");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const dataForm = document.getElementById("data-form");
const dataList = document.getElementById("data-list");
const searchInput = document.getElementById("search-input");
const applyFiltersBtn = document.getElementById("apply-filters-btn");
const messageChartCanvas = document.getElementById("messageChart");

// == State Variables ==
let currentUserId = null;
let allMessages = [];

// == Helper Functions ==
function renderData() {
  dataList.innerHTML = "";
  const filtered = allMessages.filter(msg => 
    msg.message.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${item.name}</strong>: ${item.message}`;
    dataList.appendChild(div);
  });

  renderPieChart(filtered);
}

function renderPieChart(filteredData) {
  const wordCount = {};
  filteredData.forEach(item => {
    const words = item.message.split(" ");
    words.forEach(word => {
      word = word.toLowerCase();
      if (wordCount[word]) {
        wordCount[word]++;
      } else {
        wordCount[word] = 1;
      }
    });
  });

  const labels = Object.keys(wordCount);
  const data = Object.values(wordCount);
  
  const ctx = messageChartCanvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Word Frequency',
        data: data,
        backgroundColor: ['#5564f2', '#f25454', '#ffdf5d', '#c94343', '#4548c9']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      }
    }
  });
}

// == Load Data ==
function loadData() {
  onValue(ref(database, "messages"), (snapshot) => {
    allMessages = [];
    snapshot.forEach(child => {
      allMessages.push(child.val());
    });
    renderData();
  });
}

// == Authentication Handling ==
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    loadData();
    authSection.style.display = "none";
    dataSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    dataSection.style.display = "none";
  }
});

// == Event Listeners ==
registerBtn.addEventListener("click", () => {
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Registration Successful"))
    .catch(err => alert(err.message));
});

loginBtn.addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Login Successful"))
    .catch(err => alert(err.message));
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => alert("Logout Successful"))
    .catch(err => alert(err.message));
});

dataForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;
  push(ref(database, "messages"), { name, message, timestamp: Date.now() });
});

applyFiltersBtn.addEventListener("click", () => {
  renderData();
});
