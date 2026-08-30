// ===========================================================
// KINDORF site — scroll reveal, vine progress, nav, language,
// forms, and client-side auth / profile prototype
// ===========================================================

/* -----------------------------------------------------------
   IMPORTANT — read this before deploying:
   The sign up / sign in / password reset / profile system
   below is a fully working FRONT-END PROTOTYPE. It stores
   accounts and project statuses in this browser's
   localStorage only:
     - There is no server, so accounts made on one visitor's
       device are invisible to everyone else (no shared
       database yet).
     - "Sending" a password-reset code just displays it on
       screen (clearly labeled "Demo mode") because there is
       no email server connected.
     - Passwords are obfuscated with a simple non-cryptographic
       hash for this demo only — this is NOT secure storage and
       must not be treated as production-ready.
   To make this real, connect a backend (e.g. a small Node/
   Firebase/Supabase service) that stores users in a real
   database, hashes passwords properly (bcrypt/argon2), and
   sends the reset code by email (SendGrid, Postmark, etc).
----------------------------------------------------------- */

let currentLang = "en";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- mobile nav ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-visible"));
  }

  /* ---------- growing vine scroll progress ---------- */
  const vinePath = document.getElementById("vine-path");
  if (vinePath) {
    const totalLength = vinePath.getTotalLength();
    vinePath.style.strokeDasharray = String(totalLength);
    vinePath.style.strokeDashoffset = String(totalLength);

    const updateVine = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      vinePath.style.strokeDashoffset = String(totalLength * (1 - progress));
    };
    updateVine();
    window.addEventListener("scroll", updateVine, { passive: true });
    window.addEventListener("resize", updateVine);
  }

  /* ---------- language switch (EN default / RU) ---------- */
  const langButtons = document.querySelectorAll(".lang-btn");
  const translatable = document.querySelectorAll("[data-en]");

  function setLanguage(lang) {
    currentLang = lang;
    translatable.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) el.textContent = text;
    });
    langButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    document.documentElement.setAttribute("lang", lang);
    try { localStorage.setItem("kindorf-lang", lang); } catch (e) { /* ignore */ }

    // re-render dynamic (JS-generated) text that isn't covered
    // by the data-en/data-ru scan above
    renderAuthArea();
    if (isModalOpen("modal-profile")) renderProfile();
  }

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  let savedLang = "en";
  try { savedLang = localStorage.getItem("kindorf-lang") || "en"; } catch (e) { /* ignore */ }
  currentLang = savedLang;
  if (savedLang === "ru") setLanguage("ru");

  function t(en, ru) {
    return currentLang === "ru" ? ru : en;
  }

  /* =====================================================
     AUTH / PROFILE PROTOTYPE (localStorage-backed)
  ===================================================== */

  const USERS_KEY = "kindorf-users";
  const SESSION_KEY = "kindorf-session";

  const STAGES = [
    {
      key: "idea",
      title: { en: "Idea", ru: "Идея" },
      desc: {
        en: "You come to KINDORF with your own idea or an already-existing project.",
        ru: "Человек приходит в KINDORF со своей идеей или уже существующим проектом."
      }
    },
    {
      key: "analysis",
      title: { en: "Analysis", ru: "Анализ" },
      desc: {
        en: "We study the project and define its goals, tasks, needs, and which specialists or resources it requires.",
        ru: "Мы изучаем проект, определяем его цели, задачи, потребности и какие специалисты/ресурсы ему необходимы."
      }
    },
    {
      key: "team",
      title: { en: "Team Formation", ru: "Формирование команды" },
      desc: {
        en: "A Project Manager is assigned to the project, then the necessary departments connect.",
        ru: "За проектом закрепляется Project Manager, после чего подключаются необходимые направления проекта."
      }
    },
    {
      key: "development",
      title: { en: "Development", ru: "Разработка" },
      desc: {
        en: "The team, together with the Project Owner (author), works out the plan, tasks, resources, partners, promotion and other necessary elements.",
        ru: "Команда вместе с Project Owner (автором) прорабатывает проект: план, задачи, ресурсы, партнёров, продвижение и другие необходимые элементы."
      }
    },
    {
      key: "implementation",
      title: { en: "Implementation", ru: "Реализация" },
      desc: {
        en: "The team helps the Project Owner implement the project and bring it to a concrete result.",
        ru: "Команда помогает Project Owner реализовать проект и довести его до конкретного результата."
      }
    },
    {
      key: "result",
      title: { en: "Result", ru: "Результат" },
      desc: {
        en: "The project is realized, and its result and case may be featured on the KINDORF platform, with our involvement.",
        ru: "Проект реализуется, а его результат и кейс могут быть представлены на платформе KINDORF, но при этом мы можем это контролировать."
      }
    }
  ];

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveUsers(users) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { /* ignore */ }
  }
  function findUser(email) {
    return getUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
  }
  function updateUser(email, patch) {
    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...patch };
    saveUsers(users);
    return users[idx];
  }
  function getSessionEmail() {
    try { return localStorage.getItem(SESSION_KEY); } catch (e) { return null; }
  }
  function setSessionEmail(email) {
    try { localStorage.setItem(SESSION_KEY, email); } catch (e) { /* ignore */ }
  }
  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }
  function getCurrentUser() {
    const email = getSessionEmail();
    return email ? findUser(email) : null;
  }

  // NOT cryptographically secure — demo-only obfuscation.
  // Real deployments must hash + verify passwords server-side.
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

  /* ---------- modal plumbing ---------- */
  const backdrop = document.getElementById("modal-backdrop");
  const panels = backdrop ? Array.from(backdrop.querySelectorAll(".modal-panel")) : [];

  function isModalOpen(id) {
    return !!(backdrop && backdrop.classList.contains("is-open") &&
      document.getElementById(id) && document.getElementById(id).classList.contains("is-active"));
  }

  function openModal(id) {
    if (!backdrop) return;
    panels.forEach(p => p.classList.toggle("is-active", p.id === id));
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    clearModalErrors();
    if (id === "modal-profile") renderProfile();
    if (id === "modal-forgot") resetForgotFlow();
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function clearModalErrors() {
    document.querySelectorAll(".modal-error").forEach(el => { el.textContent = ""; });
  }

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", closeModal);
  });
  document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-open-modal")));
  });

  const authSigninBtn = document.getElementById("auth-signin-btn");
  if (authSigninBtn) authSigninBtn.addEventListener("click", () => openModal("modal-signin"));

  /* ---------- auth area rendering ---------- */
  function renderAuthArea() {
    const area = document.getElementById("auth-area");
    if (!area) return;
    const user = getCurrentUser();

    updateSubmitHint();

    if (!user) {
      area.innerHTML = "";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-small";
      btn.id = "auth-signin-btn";
      btn.textContent = t("Sign In", "Войти");
      btn.addEventListener("click", () => openModal("modal-signin"));
      area.appendChild(btn);
      return;
    }

    area.innerHTML = "";
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "auth-chip";
    chip.title = t("Open profile", "Открыть профиль");

    const avatar = document.createElement("span");
    avatar.className = "auth-avatar";
    avatar.textContent = (user.name || user.email).trim().charAt(0).toUpperCase();

    const name = document.createElement("span");
    name.className = "auth-name";
    name.textContent = user.name;

    chip.appendChild(avatar);
    chip.appendChild(name);
    chip.addEventListener("click", () => openModal("modal-profile"));
    area.appendChild(chip);
  }

  function updateSubmitHint() {
    const hint = document.getElementById("submit-track-hint");
    if (hint) hint.style.display = getCurrentUser() ? "none" : "";
  }

  /* ---------- sign up ---------- */
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("su-name").value.trim();
      const email = document.getElementById("su-email").value.trim();
      const pass = document.getElementById("su-password").value;
      const pass2 = document.getElementById("su-password2").value;
      const errorEl = document.getElementById("signup-error");

      if (pass.length < 6) {
        errorEl.textContent = t("Password must be at least 6 characters.", "Пароль должен содержать минимум 6 символов.");
        return;
      }
      if (pass !== pass2) {
        errorEl.textContent = t("Passwords do not match.", "Пароли не совпадают.");
        return;
      }
      if (findUser(email)) {
        errorEl.textContent = t("An account with this email already exists.", "Аккаунт с таким email уже существует.");
        return;
      }

      const users = getUsers();
      users.push({
        name,
        email,
        passHash: simpleHash(pass),
        projects: []
      });
      saveUsers(users);
      setSessionEmail(email);
      signupForm.reset();
      closeModal();
      renderAuthArea();
    });
  }

  /* ---------- sign in ---------- */
  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("si-email").value.trim();
      const pass = document.getElementById("si-password").value;
      const errorEl = document.getElementById("signin-error");

      const user = findUser(email);
      if (!user || user.passHash !== simpleHash(pass)) {
        errorEl.textContent = t("Incorrect email or password.", "Неверный email или пароль.");
        return;
      }
      setSessionEmail(user.email);
      signinForm.reset();
      closeModal();
      renderAuthArea();
    });
  }

  /* ---------- forgot password ---------- */
  const forgotRequestForm = document.getElementById("forgot-request-form");
  const forgotResetForm = document.getElementById("forgot-reset-form");
  const forgotStepRequest = document.getElementById("forgot-step-request");
  const forgotStepReset = document.getElementById("forgot-step-reset");
  const forgotCodeDisplay = document.getElementById("forgot-code-display");
  let pendingResetEmail = null;

  function resetForgotFlow() {
    pendingResetEmail = null;
    if (forgotStepRequest) forgotStepRequest.style.display = "";
    if (forgotStepReset) forgotStepReset.style.display = "none";
    if (forgotRequestForm) forgotRequestForm.reset();
    if (forgotResetForm) forgotResetForm.reset();
  }

  if (forgotRequestForm) {
    forgotRequestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("fg-email").value.trim();
      const errorEl = document.getElementById("forgot-request-error");
      const user = findUser(email);
      if (!user) {
        errorEl.textContent = t("No account found with this email.", "Аккаунт с таким email не найден.");
        return;
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      updateUser(email, { resetCode: code, resetExpires: Date.now() + 15 * 60 * 1000 });
      pendingResetEmail = email;
      forgotCodeDisplay.textContent = code;
      forgotStepRequest.style.display = "none";
      forgotStepReset.style.display = "";
    });
  }

  if (forgotResetForm) {
    forgotResetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = document.getElementById("fg-code").value.trim();
      const newPass = document.getElementById("fg-password").value;
      const errorEl = document.getElementById("forgot-reset-error");
      const user = pendingResetEmail ? findUser(pendingResetEmail) : null;

      if (!user) {
        errorEl.textContent = t("Something went wrong. Please start over.", "Что-то пошло не так. Начните заново.");
        return;
      }
      if (newPass.length < 6) {
        errorEl.textContent = t("Password must be at least 6 characters.", "Пароль должен содержать минимум 6 символов.");
        return;
      }
      if (!user.resetCode || user.resetCode !== code || Date.now() > user.resetExpires) {
        errorEl.textContent = t("Invalid or expired code.", "Неверный или просроченный код.");
        return;
      }

      updateUser(user.email, { passHash: simpleHash(newPass), resetCode: null, resetExpires: null });
      resetForgotFlow();
      openModal("modal-signin");
    });
  }

  /* ---------- profile ---------- */
  const profileLogoutBtn = document.getElementById("profile-logout-btn");
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener("click", () => {
      clearSession();
      closeModal();
      renderAuthArea();
    });
  }

  function renderProfile() {
    const user = getCurrentUser();
    if (!user) { closeModal(); return; }

    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;

    const stepsEl = document.getElementById("process-steps");
    stepsEl.innerHTML = "";
    STAGES.forEach((stage, i) => {
      const li = document.createElement("li");
      li.className = "process-step";
      li.innerHTML = `
        <span class="process-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="process-text">
          <h5>${stage.title[currentLang] || stage.title.en}</h5>
          <p>${stage.desc[currentLang] || stage.desc.en}</p>
        </span>`;
      stepsEl.appendChild(li);
    });

    const listEl = document.getElementById("profile-projects-list");
    listEl.innerHTML = "";
    const projects = user.projects || [];

    if (projects.length === 0) {
      const p = document.createElement("p");
      p.className = "profile-empty";
      p.textContent = t(
        "You haven't submitted a project yet. Use the \"Submit a Project\" form to get started.",
        "Вы ещё не подавали проект. Заполните форму «Предложить проект», чтобы начать."
      );
      listEl.appendChild(p);
      return;
    }

    projects.forEach(project => {
      const stageIndex = Math.max(0, STAGES.findIndex(s => s.key === project.status));
      const card = document.createElement("div");
      card.className = "project-card";

      const dateStr = new Date(project.createdAt).toLocaleDateString(currentLang === "ru" ? "ru-RU" : "en-US");
      const stage = STAGES[stageIndex] || STAGES[0];

      card.innerHTML = `
        <div class="project-card-top">
          <h5>${escapeHtml(project.name)}</h5>
          <span class="status-badge">${stage.title[currentLang] || stage.title.en}</span>
        </div>
        <p class="project-date">${t("Submitted", "Подано")}: ${dateStr}</p>
        <div class="mini-stepper"></div>
      `;
      const stepper = card.querySelector(".mini-stepper");
      STAGES.forEach((s, i) => {
        const dot = document.createElement("span");
        dot.className = "mini-dot";
        if (i < stageIndex) dot.classList.add("is-done");
        if (i === stageIndex) dot.classList.add("is-current");
        stepper.appendChild(dot);
      });
      listEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- initial render ---------- */
  renderAuthArea();

  /* ---------- forms: front-end only, no backend wired up yet ---------- */
  const forms = [
    { id: "submit-form", statusId: "submit-status" },
    { id: "join-form", statusId: "join-status" },
    { id: "partner-form", statusId: "partner-status" }
  ];

  forms.forEach(({ id, statusId }) => {
    const form = document.getElementById(id);
    const status = document.getElementById(statusId);
    if (!form || !status) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const lang = document.documentElement.getAttribute("lang") || "en";

      if (id === "submit-form") {
        const user = getCurrentUser();
        const projectName = document.getElementById("s-project").value.trim();

        if (user) {
          const updatedUser = updateUser(user.email, {
            projects: [
              ...(user.projects || []),
              { id: Date.now(), name: projectName, status: "idea", createdAt: new Date().toISOString() }
            ]
          });
          status.textContent = lang === "ru"
            ? "Спасибо! Заявка сохранена — отслеживайте её статус в личном кабинете."
            : "Thanks! Your application was saved — track its status in your profile.";
          if (isModalOpen("modal-profile")) renderProfile();
        } else {
          status.textContent = lang === "ru"
            ? "Спасибо! Форма пока не подключена к серверу — добавьте обработчик отправки, чтобы получать заявки на email."
            : "Thanks! This form isn't wired up to a server yet — connect a submit handler to receive entries by email.";
        }
      } else {
        status.textContent = lang === "ru"
          ? "Спасибо! Форма пока не подключена к серверу — добавьте обработчик отправки, чтобы получать заявки на email."
          : "Thanks! This form isn't wired up to a server yet — connect a submit handler to receive entries by email.";
      }

      form.reset();
    });
  });

});
