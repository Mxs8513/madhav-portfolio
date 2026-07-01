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
  // Every nested project group (streamforge, repopulse, riskos, diya, …) —
  // discovered dynamically so the scroll-spy covers them all, not just the first.
  const nestedGroups = [...document.querySelectorAll('.sidebar-group--nested[data-nav-group]')];

  const openContainingDetails = (target) => {
    const parents = [];
    let details = target && target.closest("details");
    while (details) {
      parents.unshift(details);
      details = details.parentElement && details.parentElement.closest("details");
    }
    parents.forEach((parent) => { parent.open = true; });
  };

  const rowOf = (g) => g && g.querySelector(":scope > .sidebar-link-row");
  const discOf = (g) => g && g.querySelector(":scope > .sidebar-link-row .sidebar-disclosure");

  const setExpanded = (button, expanded) => {
    if (!button) return;
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.setAttribute("aria-expanded", String(expanded));
    if (panel) panel.toggleAttribute("hidden", !expanded);
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

  // The section ids each project group owns (its own anchor + its sub-links).
  nestedGroups.forEach((g) => {
    g._ids = new Set(
      [...g.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href").slice(1))
    );
  });
  const projectIds = new Set(["projects"]);
  nestedGroups.forEach((g) => g._ids.forEach((id) => projectIds.add(id)));

  sidebarLinks.forEach((link) =>
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").slice(1);
      const target = id && document.getElementById(id);
      openContainingDetails(target);
      if (projectIds.has(id)) setExpanded(discOf(projectsGroup), true);
      const g = nestedGroups.find((grp) => grp._ids.has(id));
      if (g) setExpanded(discOf(g), true);
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // ----- Scroll-spy: highlight the sidebar link for the section in view -----
  const sections = [...sidebarLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let previousId = null;

  const setActive = (id) => {
    sidebarLinks.forEach((link) =>
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id)
    );

    const inProjects = projectIds.has(id);
    rowOf(projectsGroup).classList.toggle("is-context", inProjects);
    nestedGroups.forEach((g) => rowOf(g).classList.toggle("is-context", g._ids.has(id)));

    // Only touch the accordion when the active section actually changes, so we
    // never fight the user's manual toggles on every scroll frame.
    if (id !== previousId) {
      setExpanded(discOf(projectsGroup), inProjects);
      nestedGroups.forEach((g) => setExpanded(discOf(g), g._ids.has(id)));
      previousId = id;
    }
  };

  // rAF-throttled so scrolling never triggers a layout read per scroll event.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const probe = window.scrollY + window.innerHeight / 3;
      let current = sections[0];
      for (const section of sections) {
        if (!section.getClientRects().length) continue;
        if (section.getBoundingClientRect().top + window.scrollY <= probe) current = section;
      }
      if (current) setActive(current.id);
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.querySelectorAll(".project-disclosure").forEach((details) =>
    details.addEventListener("toggle", onScroll)
  );

  const revealHashTarget = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    openContainingDetails(target);
    requestAnimationFrame(() => target.scrollIntoView());
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) =>
    link.addEventListener("click", () => {
      const id = decodeURIComponent((link.getAttribute("href") || "").slice(1));
      openContainingDetails(id && document.getElementById(id));
    })
  );
  window.addEventListener("hashchange", revealHashTarget);
  revealHashTarget();
  onScroll();
})();

// ----- Play project demo videos only while on-screen (cuts decode lag) -----
(function () {
  const videos = document.querySelectorAll(".project-visual--video video");
  if (!videos.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.2 }
  );
  videos.forEach((v) => io.observe(v));
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
