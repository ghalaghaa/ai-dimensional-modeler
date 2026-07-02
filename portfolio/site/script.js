(function () {
  "use strict";

  // ---------- Theme toggle ----------
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) root.setAttribute("data-theme", storedTheme);

  function currentTheme() {
    if (root.getAttribute("data-theme")) return root.getAttribute("data-theme");
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function updateThemeIcon() {
    themeToggle.textContent = currentTheme() === "dark" ? "☀️" : "🌙";
  }

  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon();
  });
  updateThemeIcon();

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  // ---------- Hero ----------
  document.getElementById("heroName").textContent = PROFILE.name;
  document.getElementById("heroSummary").textContent = PROFILE.summary;
  document.title = `${PROFILE.name} — ${PROFILE.title}`;

  // ---------- Stats ----------
  const statsGrid = document.getElementById("statsGrid");
  STATS.forEach((stat) => {
    const el = document.createElement("div");
    el.className = "stat-tile";
    el.innerHTML = `<div class="stat-tile__value">${escapeHtml(stat.value)}</div><div class="stat-tile__label">${escapeHtml(stat.label)}</div>`;
    statsGrid.appendChild(el);
  });

  // ---------- About ----------
  document.getElementById("aboutText").textContent = PROFILE.summary;

  // ---------- Skills ----------
  const skillsGrid = document.getElementById("skillsGrid");
  SKILLS.forEach((group) => {
    const el = document.createElement("div");
    el.className = "skill-group";
    const tags = group.items
      .map((item) => `<li class="skill-tag">${escapeHtml(item)}</li>`)
      .join("");
    el.innerHTML = `<h3>${escapeHtml(group.group)}</h3><ul class="skill-tags">${tags}</ul>`;
    skillsGrid.appendChild(el);
  });

  // ---------- Projects ----------
  const projectsGrid = document.getElementById("projectsGrid");

  function renderProjects(filter) {
    projectsGrid.innerHTML = "";
    const list = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
    list.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";
      const repoUrl = `${PROFILE.github}/${project.repo}`;
      card.innerHTML = `
        <div class="project-card__top">
          <h3>${escapeHtml(project.title)}</h3>
          <span class="badge badge--${project.category}">${escapeHtml(CATEGORY_LABELS[project.category])}</span>
        </div>
        <div class="project-card__stack">${escapeHtml(project.stack)}</div>
        <p class="project-card__desc">${escapeHtml(project.description)}</p>
        <div class="project-card__meta">
          <span>${escapeHtml(project.audience)} &middot; ${project.tests} tests</span>
          <a class="project-card__link" href="${escapeAttr(repoUrl)}" target="_blank" rel="noopener noreferrer">
            View on GitHub &rarr;
          </a>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }
  renderProjects("all");

  const filters = document.getElementById("filters");
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderProjects(btn.dataset.filter);
  });

  // ---------- Experience ----------
  const timeline = document.getElementById("timeline");
  EXPERIENCE.forEach((job) => {
    const li = document.createElement("li");
    const points = job.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("");
    li.innerHTML = `
      <p class="timeline__role">${escapeHtml(job.role)} &middot; ${escapeHtml(job.org)}</p>
      <p class="timeline__meta">${escapeHtml(job.period)}</p>
      <ul class="timeline__points">${points}</ul>
    `;
    timeline.appendChild(li);
  });

  // ---------- Education & certifications ----------
  const educationCard = document.getElementById("educationCard");
  educationCard.innerHTML = `
    <h3>${escapeHtml(EDUCATION.degree)}</h3>
    <p>${escapeHtml(EDUCATION.school)}</p>
    <p class="meta">${escapeHtml(EDUCATION.period)}</p>
    <p>${escapeHtml(EDUCATION.note)}</p>
  `;

  const certList = document.getElementById("certList");
  CERTIFICATIONS.forEach((cert) => {
    const li = document.createElement("li");
    li.textContent = cert;
    certList.appendChild(li);
  });

  // ---------- Contact ----------
  const contactLinks = document.getElementById("contactLinks");
  const links = [
    { label: "Email", href: `mailto:${PROFILE.email}` },
    { label: "GitHub", href: PROFILE.github },
  ];
  if (PROFILE.linkedin) links.push({ label: "LinkedIn", href: PROFILE.linkedin });
  links.forEach((link) => {
    const a = document.createElement("a");
    a.className = "btn btn--ghost";
    a.href = link.href;
    a.textContent = link.label;
    if (link.href.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    contactLinks.appendChild(a);
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Helpers ----------
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }
})();
