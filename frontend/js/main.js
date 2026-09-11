const Nexus = (() => {
  const qs = (s, r = document) => r.querySelector(s),
    qsa = (s, r = document) => [...r.querySelectorAll(s)];

  function esc(value = "") {
    return String(value).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[m]
    );
  }

  function initials(name = "") {
    return esc(
      String(name)
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase()
    );
  }

  function isValidLink(link) {
    return Boolean(link && /^https?:\/\//i.test(String(link).trim()));
  }

  function nav() {
    const n = qs(".navbar"),
      b = qs(".menu-btn"),
      l = qs(".nav-links");
    addEventListener(
      "scroll",
      () => n?.classList.toggle("scrolled", scrollY > 20),
      { passive: true },
    );
    b?.addEventListener("click", () => l.classList.toggle("open"));
    qsa(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => l.classList.remove("open")),
    );
  }

  function reveal() {
    const e = qsa(".reveal:not(.visible)");
    if (!("IntersectionObserver" in window)) {
      e.forEach((x) => x.classList.add("visible"));
      return;
    }
    const o = new IntersectionObserver(
      (es) =>
        es.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add("visible");
            o.unobserve(x.target);
          }
        }),
      { threshold: 0.1 },
    );
    e.forEach((x) => o.observe(x));
  }

  function network() {
    const c = qs("#network");
    if (!c) return;
    const x = c.getContext("2d"),
      reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w,
      h,
      n = [],
      raf;
    function resize() {
      w = innerWidth;
      h = c.parentElement.offsetHeight;
      c.width = w * devicePixelRatio;
      c.height = h * devicePixelRatio;
      x.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      n = Array.from(
        { length: Math.min(55, Math.max(24, Math.floor(w / 25))) },
        () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.7 + 0.5,
        }),
      );
    }
    function draw() {
      x.clearRect(0, 0, w, h);
      n.forEach((p) => {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      });
      for (let i = 0; i < n.length; i++)
        for (let j = i + 1; j < n.length; j++) {
          let a = n[i],
            b = n[j],
            d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 125) {
            x.strokeStyle = `rgba(101,232,255,${(1 - d / 125) * 0.17})`;
            x.beginPath();
            x.moveTo(a.x, a.y);
            x.lineTo(b.x, b.y);
            x.stroke();
          }
        }
      n.forEach((p) => {
        x.fillStyle = "rgba(101,232,255,.65)";
        x.beginPath();
        x.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        x.fill();
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    addEventListener("resize", resize);
    resize();
    draw();
    return () => cancelAnimationFrame(raf);
  }

  function updateHierarchyVisibility() {
    const sections = qsa(".org-level");
    if (!sections.length) return;

    sections.forEach((sec) => {
      const visibleCards = qsa(".member-card", sec).filter(
        (c) => c.style.display !== "none"
      );
      sec.style.display = visibleCards.length > 0 ? "" : "none";
    });
  }

  function filters() {
    qsa("[data-filter]").forEach((b) =>
      b.addEventListener("click", () => {
        let g = b.dataset.filter;
        qsa("[data-filter]").forEach((z) => z.classList.remove("active"));
        b.classList.add("active");
        qsa("[data-group]").forEach((e) => {
          const groupVal = (e.dataset.group || "").toLowerCase();
          const match =
            g === "all" ||
            groupVal === g ||
            groupVal.replace(/\s+/g, "-") === g ||
            groupVal.split(" ").includes(g);
          e.style.display = match ? "" : "none";
        });
        updateHierarchyVisibility();
      }),
    );
  }

  function lightbox() {
    const b = qs(".lightbox");
    if (!b) return;
    const t = qs("#lightboxTitle");
    const img = qs("#lightboxImage");
    const fallback = qs("#lightboxFallback");

    document.addEventListener("click", (event) => {
      const item = event.target.closest("[data-gallery]");
      if (!item) return;

      t.textContent = item.dataset.gallery;
      const src = item.dataset.image || "";

      if (img) {
        img.hidden = !src;
        img.removeAttribute("src");
        if (src) {
          img.alt = item.dataset.gallery || "";
          img.onerror = () => {
            img.hidden = true;
            if (fallback) fallback.hidden = false;
          };
          img.src = src;
          if (fallback) fallback.hidden = true;
        } else if (fallback) {
          fallback.hidden = false;
        }
      }

      b.classList.add("show");
    });

    qs(".close", b)?.addEventListener("click", () =>
      b.classList.remove("show"),
    );
    b.addEventListener("click", (e) => {
      if (e.target === b) b.classList.remove("show");
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") b.classList.remove("show");
    });
  }

  function counters() {
    qsa("[data-count]").forEach((e) => {
      let target = +e.dataset.count,
        done = false;
      const o = new IntersectionObserver((es) => {
        if (es[0].isIntersecting && !done) {
          done = true;
          let s = 0,
            st = Math.max(1, Math.ceil(Math.max(target, 1) / 45)),
            t = setInterval(() => {
              s = Math.min(target, s + st);
              e.textContent = s;
              if (s >= target) clearInterval(t);
            }, 25);
          o.disconnect();
        }
      });
      o.observe(e);
    });
  }

  function toast(m) {
    let t = qs(".toast");
    if (!t) return;
    t.textContent = m;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  }

  let contactEmail = "";

  function contact() {
    qs("#copyEmail")?.addEventListener("click", async () => {
      const email = contactEmail || qs("[data-contact='email']")?.textContent || "";
      if (!email || email === "Loading..." || email === "Not set") {
        toast("Email is not available yet");
        return;
      }
      try {
        await navigator.clipboard.writeText(email);
        toast("Email copied");
      } catch {
        toast(email);
      }
    });
  }

  function formatEventDate(dateString) {
    if (!dateString) return { day: "--", rest: "" };
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      const parts = String(dateString).split("-");
      if (parts.length === 3) {
        return {
          day: parts[2],
          rest: dateString
        };
      }
      return { day: dateString, rest: "" };
    }
    return {
      day: String(date.getDate()).padStart(2, "0"),
      rest: date
        .toLocaleDateString("en-US", { month: "short", year: "numeric" })
        .toUpperCase()
    };
  }

  async function loadHome() {
    const statsRow = qs("#homeStats");
    if (!statsRow) return;

    try {
      const [settingsRes, statsRes] = await Promise.all([
        api("/settings"),
        api("/statistics")
      ]);

      const settings = settingsRes.data || {};
      if (settings.siteName) {
        qsa(".logo").forEach((el) => {
          const dot = el.querySelector(".logo-dot")?.cloneNode(true);
          el.textContent = "";
          if (dot) el.appendChild(dot);
          el.append(settings.siteName);
        });
        document.title = `Home — ${settings.siteName}`;
      }
      if (settings.tagline) {
        const tagline = qs("#homeTagline");
        if (tagline) tagline.textContent = settings.tagline;
      }
      if (settings.about) {
        const about = qs("#homeAbout");
        if (about) about.textContent = settings.about;
      }

      const stats = (statsRes.data || []).filter(
        (item) => !item.status || item.status === "Active"
      );

      if (stats.length) {
        statsRow.innerHTML = stats
          .map(
            (stat) => `
            <div class="stat">
              <strong><span data-count="${Number(stat.value) || 0}">0</span>${esc(stat.suffix || "")}</strong>
              <span>${esc(stat.label)}</span>
            </div>
          `
          )
          .join("");
        counters();
        reveal();
      }
    } catch (error) {
      console.error(error);
      statsRow.insertAdjacentHTML(
        "afterend",
        `<p class="empty">Live statistics are unavailable right now.</p>`
      );
    }
  }

  async function loadMembers() {
    const grid = qs("#membersGrid");
    if (!grid) return;

    try {
      const response = await api("/members");
      const members = (response.data || []).filter(
        (member) => member.status !== "Inactive"
      );

      if (!members.length) {
        grid.innerHTML = `
          <div class="empty">
            No members found.
          </div>
        `;
        return;
      }

      const president = members.filter(
        (member) => String(member.role || "").toLowerCase() === "president"
      );

      const vicePresident = members.filter((member) =>
        ["vice-president", "vice president"].includes(
          String(member.role || "").toLowerCase()
        )
      );

      const leads = members.filter(
        (member) => String(member.role || "").toLowerCase() === "lead"
      );

      const normalMembers = members.filter((member) => {
        const role = String(member.role || "").toLowerCase();

        return ![
          "president",
          "vice-president",
          "vice president",
          "lead"
        ].includes(role);
      });

      const createCard = (member, index, type = "") => {
        const group = String(member.group || "").toLowerCase();

        const photo = member.photo
          ? `
            <img
              src="${esc(member.photo)}"
              alt="${esc(member.name)}"
              onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='grid';
              "
            >
            <div class="avatar" style="display:none">
              ${initials(member.name)}
            </div>
          `
          : `
            <div class="avatar">
              ${initials(member.name)}
            </div>
          `;

        return `
          <div class="card member-card reveal ${type}" data-group="${esc(group)}">
            <div class="member-photo">
              ${photo}
            </div>

            <div class="member-info">
              <span class="number">
                NEXUS // ${String(index + 1).padStart(3, "0")}
              </span>

              <h3>${esc(member.name)}</h3>

              <p>
                ${esc(member.description || "")}
              </p>

              ${member.email ? `<p class="muted">${esc(member.email)}</p>` : ""}

              <div class="tags">
                <span class="tag">${esc(member.group || "")}</span>
                <span class="tag">${esc(member.role || "")}</span>
              </div>
            </div>
          </div>
        `;
      };

      let html = "";

      if (president.length) {
        html += `
          <section class="org-level president-level reveal">
            <div class="org-title">
              <span class="number">01 // COMMAND</span>
              <h2>PRESIDENT</h2>
            </div>

            <div class="org-single">
              ${president
                .map((member, index) => createCard(member, index, "org-president"))
                .join("")}
            </div>
          </section>
        `;
      }

      if (vicePresident.length) {
        html += `
          <section class="org-level vice-president-level reveal">
            <div class="org-title">
              <span class="number">02 // LEADERSHIP</span>
              <h2>VICE-PRESIDENT</h2>
            </div>

            <div class="org-single">
              ${vicePresident
                .map((member, index) =>
                  createCard(member, index, "org-vice-president")
                )
                .join("")}
            </div>
          </section>
        `;
      }

      if (leads.length) {
        html += `
          <section class="org-level leads-level reveal">
            <div class="org-title">
              <span class="number">03 // DIVISIONS</span>
              <h2>LEADS</h2>
            </div>

            <div class="org-leads">
              ${leads
                .map((member, index) => createCard(member, index, "org-lead"))
                .join("")}
            </div>
          </section>
        `;
      }

      if (normalMembers.length) {
        html += `
          <section class="org-level members-level reveal">
            <div class="org-title">
              <span class="number">04 // NETWORK</span>
              <h2>MEMBERS</h2>
            </div>

            <div class="org-members">
              ${normalMembers
                .map((member, index) => createCard(member, index, "org-member"))
                .join("")}
            </div>
          </section>
        `;
      }

      grid.innerHTML = html;
      reveal();
      updateHierarchyVisibility();
    } catch (error) {
      console.error(error);
      grid.innerHTML = `
        <div class="empty">
          Failed to load members.
          Check server/API connection.
        </div>
      `;
    }
  }

  async function loadEvents() {
    const list = qs("#eventsList");
    if (!list) return;

    try {
      const response = await api("/events");
      const events = response.data || [];

      if (!events.length) {
        list.innerHTML = `<div class="empty">No events found.</div>`;
        return;
      }

      list.innerHTML = events
        .map((event, index) => {
          const { day, rest } = formatEventDate(event.date);
          const register = isValidLink(event.link)
            ? `<a class="btn primary" href="${esc(event.link)}" target="_blank" rel="noopener noreferrer">REGISTER NOW ↗</a>`
            : "";

          return `
            <div class="card event reveal">
              <div class="date"><b>${esc(day)}</b><span>${esc(rest)}</span></div>
              <div>
                <span class="number">EVENT // ${String(index + 1).padStart(3, "0")} · ${esc(event.status || "")}</span>
                <h3>${esc(event.title)}</h3>
                <p>${esc(event.description || "")}</p>
                <div class="event-meta">${esc([event.venue, event.time, event.status].filter(Boolean).join(" · "))}</div>
              </div>
              ${register}
            </div>
          `;
        })
        .join("");
      reveal();
    } catch (error) {
      console.error(error);
      list.innerHTML = `<div class="empty">Failed to load events. Check server/API connection.</div>`;
    }
  }

  async function loadProjects() {
    const grid = qs("#projectsGrid");
    if (!grid) return;

    try {
      const response = await api("/projects");
      const projects = response.data || [];

      if (!projects.length) {
        grid.innerHTML = `<div class="empty">No projects found.</div>`;
        return;
      }

      grid.innerHTML = projects
        .map(
          (project, index) => `
            <div class="card project reveal">
              <div>
                <div class="project-top">
                  <span class="number">LAB // ${String(index + 1).padStart(3, "0")}</span>
                  <span class="project-icon">⌁</span>
                </div>
                <h3>${esc(project.title)}</h3>
                <p>${esc(project.description || "")}</p>
                <div class="tags">
                  <span class="tag">${esc(project.team || "")}</span>
                  <span class="tag">${esc(project.status || "")}</span>
                </div>
              </div>
            </div>
          `
        )
        .join("");
      reveal();
    } catch (error) {
      console.error(error);
      grid.innerHTML = `<div class="empty">Failed to load projects. Check server/API connection.</div>`;
    }
  }

  async function loadGallery() {
    const list = qs("#galleryList");
    if (!list) return;

    try {
      const response = await api("/gallery");
      const items = (response.data || []).filter(
        (item) => !item.status || item.status === "Active"
      );

      if (!items.length) {
        list.innerHTML = `<div class="gallery-placeholder">No gallery items.</div>`;
        return;
      }

      list.innerHTML = items
        .map((item) => {
          const title = `${item.title || "Gallery"}${item.category ? ` // ${item.category}` : ""}`;
          const image = item.imageUrl
            ? `<img src="${esc(item.imageUrl)}" alt="${esc(item.title)}" onerror="this.outerHTML='<div class=\\'gallery-placeholder\\'>Image unavailable</div>'">`
            : `<div class="gallery-placeholder">IMAGE UNAVAILABLE</div>`;

          return `
            <div
              class="gallery-item reveal"
              data-gallery="${esc(title)}"
              data-image="${esc(item.imageUrl || "")}"
            >
              ${image}
            </div>
          `;
        })
        .join("");
      reveal();
    } catch (error) {
      console.error(error);
      list.innerHTML = `<div class="gallery-placeholder">Failed to load gallery. Check server/API connection.</div>`;
    }
  }

  async function loadContact() {
    const channels = qs("#contactChannels");
    if (!channels) return;

    try {
      const response = await api("/settings");
      const settings = response.data || {};
      contactEmail = settings.email || "";

      const map = {
        email: settings.email || "Not set",
        instagram: settings.instagram || "Not set",
        linkedin: settings.linkedin || "Not set",
        github: settings.github || "Not set",
        phone: settings.phone || "Not set"
      };

      Object.entries(map).forEach(([key, value]) => {
        qsa(`[data-contact='${key}']`).forEach((el) => {
          el.textContent = value;
        });
      });

      ["instagram", "linkedin", "github"].forEach((key) => {
        const link = qs(`[data-contact-link='${key}']`);
        if (!link) return;
        if (isValidLink(settings[key])) {
          link.href = settings[key];
        } else {
          link.removeAttribute("href");
          link.style.opacity = "0.6";
        }
      });

      const phoneWrap = qs("[data-contact-phone]");
      if (phoneWrap && !settings.phone) phoneWrap.hidden = true;
    } catch (error) {
      console.error(error);
      qsa("[data-contact]").forEach((el) => {
        if (el.textContent === "Loading...") el.textContent = "Unavailable";
      });
      toast("Failed to load contact information");
    }
  }

  return {
    init() {
      nav();
      reveal();
      network();
      filters();
      lightbox();
      counters();
      contact();
      loadHome();
      loadMembers();
      loadEvents();
      loadProjects();
      loadGallery();
      loadContact();
    },
  };
})();
Nexus.init();
