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

function toast(message) {
    const t = document.querySelector("#toast");
    if (!t) return;

    t.textContent = message;
    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
    }, 2200);
}

function openModal(id) {
    document.getElementById(id)?.classList.add("show");
}

function closeModal() {
    document.querySelectorAll(".modal.show").forEach((modal) => {
        modal.classList.remove("show");
    });
}

function tableMessage(colspan, message, extraClass = "empty") {
    return `
        <tr>
            <td colspan="${colspan}" class="${extraClass}">
                ${esc(message)}
            </td>
        </tr>
    `;
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

function requireAuth() {
    const token = sessionStorage.getItem(AUTH_KEY);

    if (!token) {
        location.href = "login.html";
        return false;
    }

    return true;
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ADMIN_KEY);
    location.href = "login.html";
}

function initCommon() {
    if (!requireAuth()) return false;

    document.querySelectorAll("[data-logout]").forEach((button) => {
        button.addEventListener("click", logout);
    });

    const page = document.body.dataset.page;

    document.querySelectorAll(".nav a[data-page]").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    document.querySelectorAll("[data-modal-open]").forEach((button) => {
        button.addEventListener("click", () => {
            const form = document.querySelector(".modal.show form") ||
                document.querySelector(`#${button.dataset.modalOpen} form`);

            if (form) {
                form.reset();
                if (form.elements.id) form.elements.id.value = "";
            }

            openModal(button.dataset.modalOpen);
        });
    });

    document.querySelectorAll("[data-modal-close]").forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeModal();
        });
    });

    document.querySelector("#toast")?.removeAttribute("hidden");

    return true;
}

function badgeClass(status) {
    if (status === "Active" || status === "Upcoming" || status === "Completed") {
        if (status === "Upcoming") return "success";
        if (status === "Completed") return "success";
        return "success";
    }

    if (status === "Planning" || status === "In Progress") return "warning";
    if (status === "Cancelled" || status === "Inactive") return "danger";
    return "warning";
}

async function loadDashboard() {
    try {
        const [
            membersResponse,
            eventsResponse,
            projectsResponse,
            galleryResponse
        ] = await Promise.all([
            api("/members"),
            api("/events"),
            api("/projects"),
            api("/gallery")
        ]);

        const counts = [
            ["membersCount", (membersResponse.data || []).length],
            ["eventsCount", (eventsResponse.data || []).length],
            ["projectsCount", (projectsResponse.data || []).length],
            ["galleryCount", (galleryResponse.data || []).length]
        ];

        counts.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    } catch (error) {
        console.error(error);
        toast(error.message || "Failed to load dashboard");
    }
}

async function loadMembers(filter = "") {
    const body = document.getElementById("memberRows");
    if (!body) return;

    body.innerHTML = tableMessage(5, "Loading...");

    try {
        const response = await api("/members");
        let members = response.data || [];
        const query = filter.toLowerCase();

        members = members.filter((member) =>
            `${member.name} ${member.role} ${member.group} ${member.email}`
                .toLowerCase()
                .includes(query)
        );

        body.innerHTML = members.length
            ? members
                  .map(
                      (member) => `
                <tr>
                    <td>
                        <div class="person">
                            <div class="avatar">${initials(member.name)}</div>
                            <div>
                                <strong>${esc(member.name)}</strong>
                                <small style="display:block;color:#7f8a9e">
                                    ${esc(member.email || "")}
                                </small>
                            </div>
                        </div>
                    </td>
                    <td>${esc(member.role)}</td>
                    <td>${esc(member.group)}</td>
                    <td>
                        <span class="badge ${badgeClass(member.status)}">
                            ${esc(member.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn" onclick="editMember('${member._id}')">Edit</button>
                        <button class="btn danger" onclick="deleteItem('members','${member._id}')">Delete</button>
                    </td>
                </tr>
            `
                  )
                  .join("")
            : tableMessage(5, "No members found.");
    } catch (error) {
        console.error(error);
        body.innerHTML = tableMessage(5, "Failed to load members. Check server/API connection.");
        toast(error.message);
    }
}

async function saveMember() {
    const form = document.getElementById("memberForm");
    const data = Object.fromEntries(new FormData(form));

    if (!data.name || !data.role) {
        return toast("Name and role are required");
    }

    const memberData = {
        name: data.name,
        role: data.role,
        group: data.group || "Tech",
        email: data.email || "",
        photo: data.photo || "",
        status: data.status || "Active",
        description: data.description || ""
    };

    try {
        if (data.id) {
            await api(`/members/${data.id}`, {
                method: "PUT",
                body: JSON.stringify(memberData)
            });
            toast("Member updated");
        } else {
            await api("/members", {
                method: "POST",
                body: JSON.stringify(memberData)
            });
            toast("Member added");
        }

        closeModal();
        form.reset();
        if (form.elements.id) form.elements.id.value = "";
        loadMembers(document.getElementById("memberSearch")?.value || "");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function editMember(id) {
    try {
        const response = await api(`/members/${id}`);
        const member = response.data;
        const form = document.getElementById("memberForm");

        Object.entries(member).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value ?? "";
            }
        });

        if (form.elements.id) {
            form.elements.id.value = member._id;
        }

        openModal("memberModal");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function loadEvents(filter = "") {
    const body = document.getElementById("eventRows");
    if (!body) return;

    body.innerHTML = tableMessage(6, "Loading...");

    try {
        const response = await api("/events");
        let events = response.data || [];
        const query = filter.toLowerCase();

        events = events.filter((event) =>
            `${event.title} ${event.venue} ${event.status}`
                .toLowerCase()
                .includes(query)
        );

        body.innerHTML = events.length
            ? events
                  .map(
                      (event) => `
                <tr>
                    <td>
                        <strong>${esc(event.title)}</strong>
                        <small style="display:block;color:#7f8a9e">
                            ${esc(event.description || "")}
                        </small>
                    </td>
                    <td>${esc(event.date)}</td>
                    <td>${esc(event.time || "")}</td>
                    <td>${esc(event.venue || "")}</td>
                    <td>
                        <span class="badge ${badgeClass(event.status)}">
                            ${esc(event.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn" onclick="editEvent('${event._id}')">Edit</button>
                        <button class="btn danger" onclick="deleteItem('events','${event._id}')">Delete</button>
                    </td>
                </tr>
            `
                  )
                  .join("")
            : tableMessage(6, "No events found.");
    } catch (error) {
        console.error(error);
        body.innerHTML = tableMessage(6, "Failed to load events. Check server/API connection.");
        toast(error.message);
    }
}

async function saveEvent() {
    const form = document.getElementById("eventForm");
    const data = Object.fromEntries(new FormData(form));

    if (!data.title || !data.date) {
        return toast("Title and date are required");
    }

    const eventData = {
        title: data.title,
        date: data.date,
        time: data.time || "",
        venue: data.venue || "",
        status: data.status || "Upcoming",
        description: data.description || "",
        link: data.link || ""
    };

    try {
        if (data.id) {
            await api(`/events/${data.id}`, {
                method: "PUT",
                body: JSON.stringify(eventData)
            });
            toast("Event updated");
        } else {
            await api("/events", {
                method: "POST",
                body: JSON.stringify(eventData)
            });
            toast("Event added");
        }

        closeModal();
        form.reset();
        if (form.elements.id) form.elements.id.value = "";
        loadEvents(document.getElementById("eventSearch")?.value || "");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function editEvent(id) {
    try {
        const response = await api(`/events/${id}`);
        const event = response.data;
        const form = document.getElementById("eventForm");

        Object.entries(event).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value ?? "";
            }
        });

        if (form.elements.id) {
            form.elements.id.value = event._id;
        }

        openModal("eventModal");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function loadProjects(filter = "") {
    const body = document.getElementById("projectRows");
    if (!body) return;

    body.innerHTML = tableMessage(5, "Loading...");

    try {
        const response = await api("/projects");
        let projects = response.data || [];
        const query = filter.toLowerCase();

        if (query) {
            projects = projects.filter((project) =>
                `${project.title} ${project.team} ${project.status} ${project.description}`
                    .toLowerCase()
                    .includes(query)
            );
        }

        body.innerHTML = projects.length
            ? projects
                  .map(
                      (project) => `
                <tr>
                    <td><strong>${esc(project.title)}</strong></td>
                    <td>${esc(project.team)}</td>
                    <td>
                        <span class="badge ${badgeClass(project.status)}">
                            ${esc(project.status)}
                        </span>
                    </td>
                    <td>${esc(project.description || "")}</td>
                    <td>
                        <button class="btn" onclick="editProject('${project._id}')">Edit</button>
                        <button class="btn danger" onclick="deleteItem('projects','${project._id}')">Delete</button>
                    </td>
                </tr>
            `
                  )
                  .join("")
            : tableMessage(5, "No projects found.");
    } catch (error) {
        console.error(error);
        body.innerHTML = tableMessage(5, "Failed to load projects. Check server/API connection.");
        toast(error.message);
    }
}

async function saveProject() {
    const form = document.getElementById("projectForm");
    const data = Object.fromEntries(new FormData(form));

    if (!data.title) {
        return toast("Title is required");
    }

    const projectData = {
        title: data.title,
        team: data.team || "Tech",
        status: data.status || "Planning",
        description: data.description || ""
    };

    try {
        if (data.id) {
            await api(`/projects/${data.id}`, {
                method: "PUT",
                body: JSON.stringify(projectData)
            });
            toast("Project updated");
        } else {
            await api("/projects", {
                method: "POST",
                body: JSON.stringify(projectData)
            });
            toast("Project added");
        }

        closeModal();
        form.reset();
        if (form.elements.id) form.elements.id.value = "";
        loadProjects();
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function editProject(id) {
    try {
        const response = await api(`/projects/${id}`);
        const project = response.data;
        const form = document.getElementById("projectForm");

        Object.entries(project).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value ?? "";
            }
        });

        if (form.elements.id) {
            form.elements.id.value = project._id;
        }

        openModal("projectModal");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function loadGallery() {
    const element = document.getElementById("galleryGrid");
    if (!element) return;

    element.innerHTML = `<div class="empty">Loading...</div>`;

    try {
        const response = await api("/gallery");
        const gallery = response.data || [];

        element.innerHTML = gallery.length
            ? gallery
                  .map(
                      (item) => `
                <div class="card gallery-item">
                    <div class="gallery-img">
                        ${
                            item.imageUrl
                                ? `<img src="${esc(item.imageUrl)}" alt="${esc(item.title)}" onerror="this.replaceWith(document.createTextNode('Image unavailable'))">`
                                : "▧"
                        }
                    </div>
                    <div class="gallery-info">
                        <strong>${esc(item.title)}</strong>
                        <small>${esc(item.category || "")}</small>
                        <br>
                        <button class="btn" onclick="editGallery('${item._id}')">Edit</button>
                        <button class="btn danger" onclick="deleteItem('gallery','${item._id}')">Delete</button>
                    </div>
                </div>
            `
                  )
                  .join("")
            : `<div class="empty">No gallery items.</div>`;
    } catch (error) {
        console.error(error);
        element.innerHTML = `<div class="empty">Failed to load gallery. Check server/API connection.</div>`;
        toast(error.message);
    }
}

async function saveGallery() {
    const form = document.getElementById("galleryForm");
    const data = Object.fromEntries(new FormData(form));
    const imageUrl = data.imageUrl || data.image || "";

    if (!data.title || !imageUrl) {
        return toast("Title and image URL are required");
    }

    const galleryData = {
        title: data.title,
        imageUrl,
        category: data.category || "General",
        description: data.description || "",
        status: data.status || "Active"
    };

    try {
        if (data.id) {
            await api(`/gallery/${data.id}`, {
                method: "PUT",
                body: JSON.stringify(galleryData)
            });
            toast("Gallery item updated");
        } else {
            await api("/gallery", {
                method: "POST",
                body: JSON.stringify(galleryData)
            });
            toast("Gallery item added");
        }

        closeModal();
        form.reset();
        if (form.elements.id) form.elements.id.value = "";
        loadGallery();
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function editGallery(id) {
    try {
        const response = await api(`/gallery/${id}`);
        const item = response.data;
        const form = document.getElementById("galleryForm");

        Object.entries(item).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value ?? "";
            }
        });

        if (form.elements.id) form.elements.id.value = item._id;
        if (form.elements.imageUrl) form.elements.imageUrl.value = item.imageUrl || "";

        openModal("galleryModal");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function loadStatistics() {
    const element = document.getElementById("statsGrid");
    if (!element) return;

    element.innerHTML = `<div class="empty">Loading...</div>`;

    try {
        const response = await api("/statistics");
        const stats = response.data || [];

        if (!stats.length) {
            element.innerHTML = `<div class="empty">No statistics found.</div>`;
            return;
        }

        element.innerHTML = stats
            .map(
                (stat) => `
                <div class="card stat">
                    <span class="stat-label">${esc(stat.label)}</span>
                    <div class="stat-value">
                        ${esc(stat.value)}${esc(stat.suffix || "")}
                    </div>
                    <span class="badge ${badgeClass(stat.status)}">${esc(stat.status)}</span>
                    <br>
                    <button class="btn" onclick="editStat('${stat._id}')">Edit</button>
                    <button class="btn danger" onclick="deleteItem('statistics','${stat._id}')">Delete</button>
                </div>
            `
            )
            .join("");
    } catch (error) {
        console.error(error);
        element.innerHTML = `<div class="empty">Failed to load statistics. Check server/API connection.</div>`;
        toast(error.message);
    }
}

async function saveStat() {
    const form = document.getElementById("statForm");
    const data = Object.fromEntries(new FormData(form));

    if (!data.label || data.value === "") {
        return toast("Label and value are required");
    }

    const statData = {
        label: data.label,
        value: Number(data.value),
        suffix: data.suffix || "",
        status: data.status || "Active"
    };

    if (Number.isNaN(statData.value)) {
        return toast("Value must be a number");
    }

    try {
        if (data.id) {
            await api(`/statistics/${data.id}`, {
                method: "PUT",
                body: JSON.stringify(statData)
            });
            toast("Statistic updated");
        } else {
            await api("/statistics", {
                method: "POST",
                body: JSON.stringify(statData)
            });
            toast("Statistic added");
        }

        closeModal();
        form.reset();
        if (form.elements.id) form.elements.id.value = "";
        loadStatistics();
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function editStat(id) {
    try {
        const response = await api(`/statistics/${id}`);
        const stat = response.data;
        const form = document.getElementById("statForm");

        Object.entries(stat).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value ?? "";
            }
        });

        if (form.elements.id) {
            form.elements.id.value = stat._id;
        }

        openModal("statModal");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function deleteItem(type, id) {
    if (!confirm("Delete this item?")) return;

    try {
        await api(`/${type}/${id}`, { method: "DELETE" });

        if (type === "members") {
            loadMembers(document.getElementById("memberSearch")?.value || "");
        }

        if (type === "events") {
            loadEvents(document.getElementById("eventSearch")?.value || "");
        }

        if (type === "gallery") loadGallery();
        if (type === "projects") loadProjects();
        if (type === "statistics") loadStatistics();

        toast("Deleted successfully");
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

async function loadSettings() {
    const form = document.getElementById("settingsForm");
    if (!form) return;

    try {
        const response = await api("/settings");
        const settings = response.data || {};

        Object.entries(settings).forEach(([key, value]) => {
            const field = form.elements[key];
            if (!field) return;

            if (field.type === "checkbox") {
                field.checked = Boolean(value);
            } else {
                field.value = value ?? "";
            }
        });
    } catch (error) {
        console.error(error);
        toast(error.message || "Failed to load settings");
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(form));
        data.maintenanceMode = Boolean(form.elements.maintenanceMode?.checked);

        try {
            await api("/settings", {
                method: "PUT",
                body: JSON.stringify(data)
            });
            toast("Settings saved");
        } catch (error) {
            console.error(error);
            toast(error.message);
        }
    });
}

async function handleLogin(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const email = form.get("email");
    const password = form.get("password");

    if (!email || !password) {
        return toast("Enter email and password");
    }

    try {
        const data = await api("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        sessionStorage.setItem(AUTH_KEY, data.token);
        sessionStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
        location.href = "dashboard.html";
    } catch (error) {
        console.error(error);
        toast(error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    if (page === "login") {
        if (sessionStorage.getItem(AUTH_KEY)) {
            location.href = "dashboard.html";
            return;
        }

        document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
        return;
    }

    if (!initCommon()) return;

    if (page === "dashboard") loadDashboard();

    if (page === "members") {
        loadMembers();
        document.getElementById("memberSearch")?.addEventListener("input", (event) => {
            loadMembers(event.target.value);
        });
        document.getElementById("memberForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveMember();
        });
    }

    if (page === "events") {
        loadEvents();
        document.getElementById("eventSearch")?.addEventListener("input", (event) => {
            loadEvents(event.target.value);
        });
        document.getElementById("eventForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveEvent();
        });
    }

    if (page === "gallery") {
        loadGallery();
        document.getElementById("galleryForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveGallery();
        });
    }

    if (page === "projects") {
        loadProjects();
        document.getElementById("projectForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveProject();
        });
    }

    if (page === "statistics") {
        loadStatistics();
        document.getElementById("statForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            saveStat();
        });
    }

    if (page === "settings") loadSettings();
});
