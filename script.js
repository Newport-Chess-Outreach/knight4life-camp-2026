/* ============================================================
   NEWPORT CHESS OUTREACH — SITE SCRIPT
   Shared behavior for Home and About. Impact values are edited
   directly in index.html and are never changed by this script.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  renderBoard();
  renderValues();
  initFooterYear();
});

/* ---- Navigation ------------------------------------------------ */
function initNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a, .footer-links a").forEach(link => {
    const current = link.getAttribute("href") === path;
    link.classList.toggle("active", current);
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;

  if (!menu.id) menu.id = "mobile-menu";
  toggle.setAttribute("aria-controls", menu.id);

  function setOpen(open, restoreFocus = false) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (restoreFocus) toggle.focus();
  }

  setOpen(false);
  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setOpen(false));
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      setOpen(false, true);
    }
  });

  const desktop = window.matchMedia("(min-width: 900px)");
  desktop.addEventListener("change", event => {
    if (!event.matches) return;
    const focusWasInMenu = menu.contains(document.activeElement) || document.activeElement === toggle;
    setOpen(false);
    if (focusWasInMenu) {
      const currentLink = document.querySelector('.nav-links a[aria-current="page"]');
      if (currentLink) currentLink.focus();
    }
  });
}

/* ---- Scroll reveal ------------------------------------------------ */
function initReveal() {
  const items = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!items.length) return;
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
}

function initFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---- About page: board & values --------------------------------------- */
function renderBoard() {
  const grid = document.getElementById("board-grid");
  if (!grid || typeof SITE_DATA === "undefined") return;
  grid.innerHTML = SITE_DATA.board.map(m => `
    <div class="card reveal">
      <div class="card-body">
        <h3>${m.name}</h3>
        <span class="badge badge-red">${m.role}</span>
        <p>${m.bio}</p>
      </div>
    </div>
  `).join("");
  initReveal();
}

function renderValues() {
  const grid = document.getElementById("values-grid");
  if (!grid || typeof SITE_DATA === "undefined") return;
  grid.innerHTML = SITE_DATA.values.map(v => `
    <div class="value-card reveal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 4v6c0 5-3.6 8.4-8 10-4.4-1.6-8-5-8-10V6l8-4Z"/></svg>
      <h4>${v.title}</h4>
      <p>${v.text}</p>
    </div>
  `).join("");
  initReveal();
}