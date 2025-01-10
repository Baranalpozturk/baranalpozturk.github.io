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

// == Firebase Config ==
// Burayı kendi Firebase bilgilerinle güncelledim (baranalp-6ebb3 projesi).
const firebaseConfig = {
  apiKey: "AIzaSyB5vAeN2_RpXftWn69gDFUCdytSoEYFkAY",
  authDomain: "baranalp-6ebb3.firebaseapp.com",
  databaseURL: "https://baranalp-6ebb3-default-rtdb.firebaseio.com",
  projectId: "baranalp-6ebb3",
  storageBucket: "baranalp-6ebb3.firebasestorage.app",
  messagingSenderId: "294752201728",
  appId: "1:294752201728:web:7936e664587148428c7ce5",
  measurementId: "G-N34PZLV3JQ"
};

// == Initialize Firebase ==
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// == UI Elements ==
const authSection = document.getElementById("auth-section");
const dataSection = document.getElementById("data-section");
const profileSection = document.getElementById("profile-section");
const adminSection = document.getElementById("admin-section");
const resetSection = document.getElementById("reset-section");
const verifySection = document.getElementById("verify-section");

const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const resetBtn = document.getElementById("reset-btn");
const resendVerificationBtn = document.getElementById("resend-verification-btn");

const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const resetEmail = document.getElementById("reset-email");

const registerInfo = document.getElementById("register-info");
const loginInfo = document.getElementById("login-info");
const dataInfo = document.getElementById("data-info");
const profileInfo = document.getElementById("profile-info");
const resetInfo = document.getElementById("reset-info");
const resendInfo = document.getElementById("resend-info");
const verifyInfo = document.getElementById("verify-info");
const userInfo = document.getElementById("user-info");

const dataForm = document.getElementById("data-form");
const dataList = document.getElementById("data-list");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const applyFiltersBtn = document.getElementById("apply-filters-btn");

const profileNameInput = document.getElementById("profile-name");
const profilePhotoInput = document.getElementById("profile-photo");
const profileSaveBtn = document.getElementById("profile-save-btn");

const navBar = document.getElementById("nav-bar");

const adminUserTabBtn = document.getElementById("admin-users-tab");
const adminStatsTabBtn = document.getElementById("admin-stats-tab");
const userManagementDiv = document.getElementById("user-management");
const statsDiv = document.getElementById("stats");

const userChartCanvas = document.getElementById("userChart");
const messageChartCanvas = document.getElementById("messageChart");

// == Navigation Buttons ==
const navDataBtn = document.getElementById("nav-data");
const navProfileBtn = document.getElementById("nav-profile");
const navAdminBtn = document.getElementById("nav-admin");

// == i18n (çok dilli destek) ==
const translations = {
  en: {
    "app-title": "Firebase Admin Role Management",
    "auth-title": "Authentication",
    "register-title": "Register",
    "login-title": "Login",
    "register-btn": "Register",
    "login-btn": "Login",
    "forgot-pw-link": "Forgot Password?",
    "reset-title": "Reset Password",
    "reset-btn": "Send Reset Link",
    "verify-title": "Email Verification Required",
    "verify-info": "Please verify your email before logging in. Check your inbox.",
    "resend-verification-btn": "Resend Verification Email",
    "data-title": "Data Management",
    "data-add-btn": "Add Data",
    "apply-filters-btn": "Apply Filters",
    "nav-data": "Data",
    "nav-profile": "Profile",
    "nav-admin": "Admin Panel",
    "logout-btn": "Logout",
    "profile-title": "Profile Settings",
    "profile-save-btn": "Save",
    "admin-title": "Admin Panel",
    "user-management-title": "User Management",
    "stats-title": "Statistics"
  },
  tr: {
    "app-title": "Firebase Admin Rol Yönetimi",
    "auth-title": "Kimlik Doğrulama",
    "register-title": "Kayıt Ol",
    "login-title": "Giriş Yap",
    "register-btn": "Kayıt Ol",
    "login-btn": "Giriş",
    "forgot-pw-link": "Şifremi Unuttum",
    "reset-title": "Şifre Sıfırla",
    "reset-btn": "Sıfırlama Bağlantısı Gönder",
    "verify-title": "E-posta Doğrulaması Gerekli",
    "verify-info": "Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın. Gelen kutunuzu kontrol edin.",
    "resend-verification-btn": "Doğrulama E-postası Gönder",
    "data-title": "Veri Yönetimi",
    "data-add-btn": "Veri Ekle",
    "apply-filters-btn": "Filtreleri Uygula",
    "nav-data": "Veri",
    "nav-profile": "Profil",
    "nav-admin": "Admin Paneli",
    "logout-btn": "Çıkış",
    "profile-title": "Profil Ayarları",
    "profile-save-btn": "Kaydet",
    "admin-title": "Admin Paneli",
    "user-management-title": "Kullanıcı Yönetimi",
    "stats-title": "İstatistikler"
  }
};

function applyTranslations(lang) {
  document.documentElement.setAttribute("data-lang", lang);
  for (const key in translations[lang]) {
    const el = document.getElementById(key);
    if (el) el.textContent = translations[lang][key];
  }
}

const languageSelector = document.getElementById("language-selector");
languageSelector.addEventListener("change", () => {
  applyTranslations(languageSelector.value);
});

// Varsayılan dil İngilizce
applyTranslations("en");

// == State Variables ==
let currentUserId = null;
let isAdmin = false;
let allMessages = [];
let allUsers = [];

// == Helper Functions ==
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function showSection(section) {
  const sections = [
    authSection,
    dataSection,
    profileSection,
    adminSection,
    resetSection,
    verifySection
  ];
  sections.forEach(sec => {
    sec.classList.remove("visible");
    sec.classList.add("hidden");
  });
  section.classList.remove("hidden");
  section.classList.add("visible");
}

function clearMessages() {
  registerInfo.textContent = "";
  loginInfo.textContent = "";
  dataInfo.textContent = "";
  profileInfo.textContent = "";
  resetInfo.textContent = "";
  resendInfo.textContent = "";
  verifyInfo.textContent = "";
  userInfo.textContent = "";
}

function setupNav(visible) {
  if (visible) {
    navBar.classList.remove("hidden");
  } else {
    navBar.classList.add("hidden");
  }
}

function showAdminFeatures(show) {
  const adminElements = document.querySelectorAll(".admin-only");
  adminElements.forEach(el => {
    el.style.display = show ? "inline-block" : "none";
  });
}

// Veri yükleme
function loadData() {
  onValue(ref(database, "messages"), (snapshot) => {
    if (!snapshot.exists()) {
      allMessages = [];
      renderData();
      return;
    }
    const msgs = [];
    snapshot.forEach(child => {
      const val = child.val();
      msgs.push({ ...val, id: child.key });
    });
    allMessages = msgs;
    renderData();
  });
}

function renderData() {
  dataList.innerHTML = "";
  if (allMessages.length === 0) {
    dataList.innerHTML = "<p>No data available.</p>";
    return;
  }

  let filtered = [...allMessages];
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(searchTerm) ||
      m.message.toLowerCase().includes(searchTerm)
    );
  }

  const sortType = sortSelect.value;
  if (sortType === "newest") {
    filtered.sort((a, b) => b.id.localeCompare(a.id));
  } else if (sortType === "oldest") {
    filtered.sort((a, b) => a.id.localeCompare(b.id));
  } else if (sortType === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === "za") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (filtered.length === 0) {
    dataList.innerHTML = "<p>No matching data.</p>";
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.className = "data-item";
    div.innerHTML = `<span><strong>${item.name}</strong>: ${item.message}</span>`;
    if (isAdmin) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-btn";
      deleteButton.dataset.id = item.id;
      div.appendChild(deleteButton);
    }
    dataList.appendChild(div);
  });
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const dataId = event.target.dataset.id;
    if (isAdmin) {
      remove(ref(database, `messages/${dataId}`))
        .then(() => {
          dataInfo.textContent = "Data deleted!";
        })
        .catch((error) => {
          dataInfo.textContent = `Error deleting data: ${error.message}`;
        });
    } else {
      dataInfo.textContent = "Only admin users can delete data!";
    }
  }
});

applyFiltersBtn.addEventListener("click", () => {
  renderData();
});

// Kullanıcı Profil Yükleme
function loadUserProfile(uid) {
  get(ref(database, `users/${uid}`)).then(snapshot => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      profileNameInput.value = userData.fullName || "";
      profilePhotoInput.value = userData.photoURL || "";
    } else {
      profileNameInput.value = "";
      profilePhotoInput.value = "";
    }
  });
}

// Tüm kullanıcıları yükle (Admin)
function loadAllUsers() {
  get(ref(database, "users")).then(snapshot => {
    allUsers = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        allUsers.push({ uid: child.key, ...child.val() });
      });
    }
    renderUserList();
  });
}

function renderUserList() {
  const userListDiv = document.getElementById("user-list");
  userListDiv.innerHTML = "";
  if (allUsers.length === 0) {
    userListDiv.innerHTML = "<p>No users found.</p>";
    return;
  }
  allUsers.forEach(user => {
    const div = document.createElement("div");
    div.className = "user-item";
    div.innerHTML = `
      <span>${user.email} ${user.admin ? "(admin)" : ""}</span>
    `;
    if (currentUserId !== user.uid) {
      const toggleAdminBtn = document.createElement("button");
      toggleAdminBtn.textContent = user.admin ? "Remove Admin" : "Make Admin";
      toggleAdminBtn.addEventListener("click", () => toggleAdmin(user.uid, !user.admin));
      div.appendChild(toggleAdminBtn);
    }
    userListDiv.appendChild(div);
  });
}

function toggleAdmin(uid, makeAdmin) {
  update(ref(database, `users/${uid}`), { admin: makeAdmin })
    .then(() => {
      userInfo.textContent = "User updated successfully.";
      loadAllUsers();
    });
}

// İstatistik Chart
function renderCharts() {
  const totalUsers = allUsers.length;
  const adminCount = allUsers.filter(u => u.admin).length;
  const normalCount = totalUsers - adminCount;
  const totalMessages = allMessages.length;

  const userCtx = userChartCanvas.getContext('2d');
  new Chart(userCtx, {
    type: 'doughnut',
    data: {
      labels: ['Admins', 'Normal Users'],
      datasets: [{
        data: [adminCount, normalCount],
        backgroundColor: ['#5564f2', '#f25454']
      }]
    }
  });

  const msgCtx = messageChartCanvas.getContext('2d');
  new Chart(msgCtx, {
    type: 'bar',
    data: {
      labels: ['Messages'],
      datasets: [{
        label: 'Total Messages',
        data: [totalMessages],
        backgroundColor: ['#ffdf5d']
      }]
    },
    options: {
      indexAxis: 'y'
    }
  });
}

// Auth İşlemleri
registerBtn.addEventListener("click", () => {
  clearMessages();
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();

  if (!validateEmail(email)) {
    registerInfo.textContent = "Please enter a valid email.";
    return;
  }
  if (password.length < 6) {
    registerInfo.textContent = "Password must be at least 6 characters.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      const adminRef = ref(database, "admin");

      get(adminRef).then((snapshot) => {
        if (!snapshot.exists()) {
          // İlk üye admin olsun
          set(ref(database, `users/${userId}`), { email, admin: true });
          set(adminRef, userId);
          registerInfo.textContent = "Registration successful! First user set as admin.";
        } else {
          // Devam edenler normal kullanıcı
          set(ref(database, `users/${userId}`), { email, admin: false });
          registerInfo.textContent = "Registration successful! You are a normal user.";
        }
        sendEmailVerification(auth.currentUser).then(() => {
          registerInfo.textContent += " Verification email sent. Please verify before login.";
        });
        registerEmail.value = "";
        registerPassword.value = "";
      });
    })
    .catch((error) => {
      registerInfo.textContent = `Error: ${error.message}`;
    });
});

loginBtn.addEventListener("click", () => {
  clearMessages();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!validateEmail(email)) {
    loginInfo.textContent = "Please enter a valid email.";
    return;
  }
  if (password.length < 6) {
    loginInfo.textContent = "Password must be at least 6 characters.";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      loginInfo.textContent = `Error: ${error.message}`;
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    isAdmin = false;
    currentUserId = null;
    showAdminFeatures(false);
    setupNav(false);
    clearMessages();
    showSection(authSection);
  });
});

document.getElementById("forgot-pw-link").addEventListener("click", (e) => {
  e.preventDefault();
  clearMessages();
  showSection(resetSection);
});

resetBtn.addEventListener("click", () => {
  const email = resetEmail.value.trim();
  if (!validateEmail(email)) {
    resetInfo.textContent = "Please enter a valid email.";
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => {
      resetInfo.textContent = "Password reset email sent!";
    })
    .catch(error => {
      resetInfo.textContent = `Error: ${error.message}`;
    });
});

resendVerificationBtn.addEventListener("click", () => {
  if (auth.currentUser) {
    sendEmailVerification(auth.currentUser)
      .then(() => {
        resendInfo.textContent = "Verification email sent again!";
      })
      .catch(error => {
        resendInfo.textContent = `Error: ${error.message}`;
      });
  }
});

profileSaveBtn.addEventListener("click", () => {
  const fullName = profileNameInput.value.trim();
  const photoURL = profilePhotoInput.value.trim();
  update(ref(database, `users/${currentUserId}`), { fullName, photoURL })
    .then(() => {
      profileInfo.textContent = "Profile updated successfully!";
    })
    .catch(error => {
      profileInfo.textContent = `Error: ${error.message}`;
    });
});

dataForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    dataInfo.textContent = "Please provide both name and message.";
    return;
  }

  push(ref(database, "messages"), { name, message, timestamp: Date.now() })
    .then(() => {
      dataInfo.textContent = "Data added!";
      nameInput.value = "";
      messageInput.value = "";
    })
    .catch((error) => {
      dataInfo.textContent = `Error adding data: ${error.message}`;
    });
});

// Navigasyon butonları
[navDataBtn, navProfileBtn, navAdminBtn].forEach(btn => {
  btn.addEventListener("click", () => {
    const sectionId = btn.dataset.section;
    if (sectionId === "admin-section" && !isAdmin) {
      dataInfo.textContent = "Only admins can access this section.";
      return;
    }
    showSection(document.getElementById(sectionId));
    if (sectionId === "profile-section") loadUserProfile(currentUserId);
    if (sectionId === "admin-section" && isAdmin) {
      loadAllUsers();
      renderCharts();
    }
  });
});

// Admin sekme geçişi
[adminUserTabBtn, adminStatsTabBtn].forEach(t => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab-content").forEach(c => {
      c.classList.remove("visible");
      c.classList.add("hidden");
    });
    const tabId = t.dataset.tab;
    document.getElementById(tabId).classList.remove("hidden");
    document.getElementById(tabId).classList.add("visible");
    if (tabId === "user-management") loadAllUsers();
    if (tabId === "stats") renderCharts();
  });
});

// Auth durumu değiştiğinde
onAuthStateChanged(auth, (user) => {
  clearMessages();
  if (user) {
    if (!user.emailVerified) {
      showSection(verifySection);
      return;
    }
    currentUserId = user.uid;
    get(ref(database, `users/${currentUserId}`)).then(snapshot => {
      if (snapshot.exists()) {
        isAdmin = snapshot.val().admin;
        showAdminFeatures(isAdmin);
        setupNav(true);
        loadUserProfile(currentUserId);
        loadData();
        showSection(dataSection);
        if (isAdmin) {
          loadAllUsers();
        }
      } else {
        isAdmin = false;
        showAdminFeatures(false);
        setupNav(true);
        loadData();
        showSection(dataSection);
      }
    });
  } else {
    currentUserId = null;
    isAdmin = false;
    showAdminFeatures(false);
    setupNav(false);
    showSection(authSection);
  }
});

// Sayfa ilk açıldığında Auth ekranını göster
showSection(authSection);
