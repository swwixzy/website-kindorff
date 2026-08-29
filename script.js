// ===========================================================
// KINDORF site — scroll reveal, vine progress, nav, language, forms
// ===========================================================

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
    translatable.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) el.textContent = text;
    });
    langButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    document.documentElement.setAttribute("lang", lang);
    try { localStorage.setItem("kindorf-lang", lang); } catch (e) { /* ignore */ }
  }

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  let savedLang = "en";
  try { savedLang = localStorage.getItem("kindorf-lang") || "en"; } catch (e) { /* ignore */ }
  if (savedLang === "ru") setLanguage("ru");

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
      status.textContent = lang === "ru"
        ? "Спасибо! Форма пока не подключена к серверу — добавьте обработчик отправки, чтобы получать заявки на email."
        : "Thanks! This form isn't wired up to a server yet — connect a submit handler to receive entries by email.";
      form.reset();
    });
  });

});
