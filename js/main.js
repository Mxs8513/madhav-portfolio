// Mobile menu toggle + sidebar scroll-spy + reveal-on-scroll. No dependencies.

// ----- Reveal-on-scroll (skipped entirely under prefers-reduced-motion;
//       content is fully visible without JS or with motion disabled) -----
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(".card, .section-title, .hero-actions");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );

  targets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });

  // Safety net: never leave content hidden if the observer misbehaves
  // (e.g. unusual embedded/headless contexts).
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("is-visible");
    });
  }, 1500);
})();

(function () {
  const toggle = document.querySelector(".topbar-toggle");
  const sidebarLinks = document.querySelectorAll(".sidebar-links a");
  const disclosures = document.querySelectorAll(".sidebar-disclosure");
  const projectsGroup = document.querySelector('[data-nav-group="projects"]');
  const streamforgeGroup = document.querySelector('[data-nav-group="streamforge"]');

  const setExpanded = (button, expanded) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(expanded));
    panel.toggleAttribute("hidden", !expanded);
  };

  disclosures.forEach((button) =>
    button.addEventListener("click", () => {
      setExpanded(button, button.getAttribute("aria-expanded") !== "true");
    })
  );

  // ----- Mobile menu -----
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  sidebarLinks.forEach((link) =>
    link.addEventListener("click", () => {
      if (link.getAttribute("href") === "#projects") {
        setExpanded(projectsGroup.querySelector(":scope > .sidebar-link-row .sidebar-disclosure"), true);
      }
      if (link.getAttribute("href") === "#streamforge") {
        setExpanded(projectsGroup.querySelector(":scope > .sidebar-link-row .sidebar-disclosure"), true);
        setExpanded(streamforgeGroup.querySelector(":scope > .sidebar-link-row .sidebar-disclosure"), true);
      }
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // ----- Scroll-spy: highlight the sidebar link for the section in view -----
  const sections = [...sidebarLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const projectIds = new Set([
    "projects",
    "streamforge",
    "streamforge-architecture",
    "streamforge-recovery",
    "repopulse",
    "riskos",
    "diya",
  ]);
  const streamforgeIds = new Set([
    "streamforge",
    "streamforge-architecture",
    "streamforge-recovery",
  ]);
  let previousId = null;

  const setActive = (id) => {
    sidebarLinks.forEach((link) =>
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id)
    );

    const inProjects = projectIds.has(id);
    const inStreamForge = streamforgeIds.has(id);
    projectsGroup.querySelector(":scope > .sidebar-link-row").classList.toggle("is-context", inProjects);
    streamforgeGroup.querySelector(":scope > .sidebar-link-row").classList.toggle("is-context", inStreamForge);

    if (id !== previousId) {
      setExpanded(projectsGroup.querySelector(":scope > .sidebar-link-row .sidebar-disclosure"), inProjects);
      setExpanded(streamforgeGroup.querySelector(":scope > .sidebar-link-row .sidebar-disclosure"), inStreamForge);
      previousId = id;
    }
  };

  const onScroll = () => {
    // The active section is the last one whose top has passed 1/3 of the viewport.
    const probe = window.scrollY + window.innerHeight / 3;
    let current = sections[0];
    for (const section of sections) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= probe) current = section;
    }
    if (current) setActive(current.id);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ----- Research document tabs (Paper / Poster) -----
(function () {
  const docs = document.querySelector("#research-docs");
  if (!docs) return;

  const tabs = docs.querySelectorAll(".doc-tab");
  const panels = docs.querySelectorAll(".doc-panel");

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      const id = tab.dataset.doc;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach((panel) => {
        const show = panel.id === "doc-" + id;
        panel.classList.toggle("is-hidden", !show);
        panel.toggleAttribute("hidden", !show);
      });
    })
  );
})();
