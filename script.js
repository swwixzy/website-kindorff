// ===========================================================
// KINDORF site — scroll reveal, vine progress, nav, language,
// "How It Works" steps, and form submission messages
// ===========================================================

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
    renderHowItWorks();
  }

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  let savedLang = "en";
  try { savedLang = localStorage.getItem("kindorf-lang") || "en"; } catch (e) { /* ignore */ }
  currentLang = savedLang;

  function t(en, ru) {
    return currentLang === "ru" ? ru : en;
  }

  /* =====================================================
     HOW IT WORKS — six-step sequence, expands on
     click/tap (all devices) or hover (pointer devices)
  ===================================================== */

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
        en: "The project is realized, and its result and case can be featured on the KINDORF platform.",
        ru: "Проект реализуется, а его результат и кейс могут быть представлены на платформе KINDORF."
      }
    }
  ];

  function renderHowItWorks() {
    const container = document.getElementById("how-steps");
    if (!container) return;

    // remember which steps were open before re-rendering (e.g. on language switch)
    const openKeys = new Set(
      Array.from(container.querySelectorAll(".how-step.is-open")).map(li => li.dataset.key)
    );

    container.innerHTML = "";
    STAGES.forEach((stage, i) => {
      const li = document.createElement("li");
      li.className = "how-step";
      li.dataset.key = stage.key;
      if (openKeys.has(stage.key)) li.classList.add("is-open");

      const isOpen = li.classList.contains("is-open");

      li.innerHTML = `
        <button type="button" class="how-step-toggle" aria-expanded="${isOpen}">
          <span class="how-step-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="how-step-title">${stage.title[currentLang] || stage.title.en}</span>
          <span class="how-step-icon" aria-hidden="true"></span>
        </button>
        <div class="how-step-desc"><p>${stage.desc[currentLang] || stage.desc.en}</p></div>
      `;

      const toggle = li.querySelector(".how-step-toggle");
      toggle.addEventListener("click", () => {
        const open = li.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });

      container.appendChild(li);
    });
  }

  renderHowItWorks();
  if (savedLang === "ru") setLanguage("ru");

  /* ---------- forms: submit data to backend, which emails it ---------- */

  // АДРЕС ВАШЕГО БЭКЕНДА — после деплоя замените на реальный URL
  // (например, "https://kindorf-backend.onrender.com/api/submit-form")
  const BACKEND_URL = "https://formss-production.up.railway.app/api/submit-form.";

  const forms = [
    {
      id: "submit-form",
      statusId: "submit-status",
      message: {
        en: "Thank you! Your project has been submitted. Our team will review it and contact you by email.",
        ru: "Спасибо! Ваш проект отправлен. Наша команда рассмотрит его и свяжется с вами по email."
      },
      errorMessage: {
        en: "Something went wrong. Please try again later.",
        ru: "Что-то пошло не так. Попробуйте ещё раз позже."
      }
    },
    {
      id: "join-form",
      statusId: "join-status",
      message: {
        en: "Thank you! Your application has been submitted. Our team will review it and contact you by email.",
        ru: "Спасибо! Ваша заявка отправлена. Наша команда рассмотрит её и свяжется с вами по email."
      },
      errorMessage: {
        en: "Something went wrong. Please try again later.",
        ru: "Что-то пошло не так. Попробуйте ещё раз позже."
      }
    },
    {
      id: "partner-form",
      statusId: "partner-status",
      message: {
        en: "Thank you! Your proposal has been submitted. Our team will review it and contact you by email.",
        ru: "Спасибо! Ваше предложение отправлено. Наша команда рассмотрит его и свяжется с вами по email."
      },
      errorMessage: {
        en: "Something went wrong. Please try again later.",
        ru: "Что-то пошло не так. Попробуйте ещё раз позже."
      }
    }
  ];

  forms.forEach(({ id, statusId, message, errorMessage }) => {
    const form = document.getElementById(id);
    const status = document.getElementById(statusId);
    if (!form || !status) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type='submit'], input[type='submit']");
      if (submitBtn) submitBtn.disabled = true;

      // собираем поля формы в обычный объект { name: value, ... }
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: id, data }),
        });

        if (!response.ok) throw new Error("Request failed");

        status.textContent = message[currentLang] || message.en;
        form.reset();
      } catch (err) {
        status.textContent = errorMessage[currentLang] || errorMessage.en;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

});
