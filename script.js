/* ============================================================
   KNIGHT4LIFE SUMMER CAMP — SITE SCRIPT
   Only the functions required by index.html, register.html,
   and register-success.html are kept here.
   ============================================================ */

const ICONS = {
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  clock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  pin:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  tag:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 11.4 12.6 3.4A2 2 0 0 0 11.2 3H4a1 1 0 0 0-1 1v7.2a2 2 0 0 0 .6 1.4l8 8a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8Z"/><circle cx="8" cy="8" r="1.5"/></svg>`,
  chevron:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initAccordion();
  renderEventDetail();
  initWizard();
  initFooterYear();
});

/* ---- Navigation ------------------------------------------------ */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu   = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
}

/* ---- Scroll reveal --------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
}

/* ---- Accordion -------------------------------------------------- */
function initAccordion() {
  document.querySelectorAll(".accordion-trigger").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.style.maxHeight = expanded ? "0px" : panel.scrollHeight + "px";
    });
  });
}

/* ---- Footer year ----------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- Camp detail page ------------------------------------------ */
function renderEventDetail() {
  const root = document.getElementById("event-detail");
  if (!root || typeof CAMP === "undefined") return;

  const titleEl = document.getElementById("ed-title");
  if (titleEl) titleEl.textContent = CAMP.title;

  const descEl = document.getElementById("ed-description");
  if (descEl) descEl.textContent = CAMP.description;

  const dateEl = document.getElementById("ed-date");
  if (dateEl) dateEl.innerHTML = `${ICONS.calendar} ${CAMP.date}`;

  const timeEl = document.getElementById("ed-time");
  if (timeEl) timeEl.innerHTML = `${ICONS.clock} ${CAMP.time}`;

  const locEl = document.getElementById("ed-location");
  if (locEl) locEl.innerHTML = `${ICONS.pin} ${CAMP.location}`;

  const ageEl = document.getElementById("ed-age");
  if (ageEl) ageEl.innerHTML = `${ICONS.tag} ${CAMP.ageRange}`;

  const costEl = document.getElementById("ed-cost");
  if (costEl) costEl.textContent = CAMP.cost;

  const schedEl = document.getElementById("ed-schedule");
  if (schedEl) {
    schedEl.innerHTML = CAMP.schedule.map(s =>
      `<tr><td>${s.time}</td><td>${s.activity}</td></tr>`
    ).join("");
  }

  const matEl = document.getElementById("ed-materials");
  if (matEl) {
    matEl.innerHTML = CAMP.materials.map(m => `<li>${m}</li>`).join("");
  }

  const refundEl = document.getElementById("ed-refund");
  if (refundEl) refundEl.textContent = CAMP.refundPolicy;

  const faqEl = document.getElementById("ed-faqs");
  if (faqEl) {
    faqEl.innerHTML = CAMP.faqs.map((f, i) => `
      <div class="accordion-item">
        <button class="accordion-trigger" aria-expanded="false" aria-controls="ed-faq-${i}">${f.q} ${ICONS.chevron}</button>
        <div class="accordion-panel" id="ed-faq-${i}"><div class="accordion-panel-inner">${f.a}</div></div>
      </div>
    `).join("");
    initAccordion();
  }
}

/* ---- Registration wizard --------------------------------------- */
function initWizard() {
  const wizard = document.querySelector(".wizard");
  if (!wizard) return;

  // Populate event summary bar from CAMP data
  if (typeof CAMP !== "undefined") {
    document.querySelectorAll(".reg-event-name").forEach(el => el.textContent = CAMP.title);
    document.querySelectorAll(".reg-event-cost").forEach(el => el.textContent = CAMP.cost);
    document.querySelectorAll(".reg-event-date").forEach(el => el.textContent = CAMP.date);
  }

  const panels = Array.from(wizard.querySelectorAll(".wizard-panel"));
  const steps  = Array.from(wizard.querySelectorAll(".wizard-step"));
  let current  = 0;

  function show(index, scrollTo = true) {
    panels.forEach((p, i) => p.classList.toggle("active", i === index));
    steps.forEach((s, i) => {
      s.classList.toggle("active", i === index);
      s.classList.toggle("done",   i < index);
    });
    if (scrollTo) wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function panelIsValid(panel) {
    for (const f of panel.querySelectorAll("input, select, textarea")) {
      if (f.disabled) continue;
      if (!f.checkValidity()) { f.reportValidity(); return false; }
    }
    return true;
  }

  wizard.querySelectorAll("[data-next]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!panelIsValid(panels[current])) return;
      if (current < panels.length - 1) { current++; show(current); }
    });
  });

  wizard.querySelectorAll("[data-prev]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (current > 0) { current--; show(current); }
    });
  });

  const form = document.getElementById("registration-form");
  if (form) {
    // Prevent accidental early submission on Enter key while not on final step
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && current < panels.length - 1) e.preventDefault();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!panelIsValid(panels[panels.length - 1])) return;

      const submitBtn = form.querySelector("button[type=submit]");
      const errorEl  = document.getElementById("registration-error");
      if (errorEl) errorEl.hidden = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing…";

      const payload = {};
      new FormData(form).forEach((value, key) => { payload[key] = value; });

      // Waiver checkboxes (unchecked boxes are absent from FormData)
      payload.waiverLiability = form.waiverLiability ? form.waiverLiability.checked : false;
      payload.waiverPhoto     = form.waiverPhoto     ? form.waiverPhoto.checked     : false;
      payload.waiverMedical   = form.waiverMedical   ? form.waiverMedical.checked   : false;
      payload.waiverTerms     = form.waiverTerms     ? form.waiverTerms.checked     : false;

      // Always attach camp metadata
      payload.eventSlug     = CAMP.slug;
      payload.eventTitle    = CAMP.title;
      payload.eventCategory = CAMP.category;
      payload.amountCents   = CAMP.costCents;

      try {
        const res    = await fetch("/.netlify/functions/submit-registration", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload)
        });
        const result = await res.json();
        if (res.ok && result.url) {
          window.location.href = result.url;
        } else {
          throw new Error(result.error || "Something went wrong submitting your registration.");
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent =
            "We couldn't submit your registration (" + err.message + "). Please check your connection and try again, or contact us directly.";
          errorEl.hidden = false;
          errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        submitBtn.disabled   = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  show(0, false);
}
