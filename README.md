# NEXUS — IT Club Platform

> Where ideas connect. Where technology evolves.

NEXUS is a modern web platform for an Information Technology Club, designed to connect students, showcase projects, manage events, present team members, and provide a dedicated administration panel.

The platform combines a futuristic, minimal interface with a backend-powered content management system.

---

## ✨ Features

### 🌐 Public Website

- Modern futuristic NEXUS UI
- Responsive design for desktop, tablet, and mobile
- Home page with club statistics and information
- Groups & Members section
- Organizational hierarchy:
  - President
  - Vice-President
  - Leads
  - Members
- Department/group filtering:
  - Tech
  - Management
  - PR
  - Creative
- Animated member profile modal
- Events listing
- Projects / Lab section
- Gallery
- Contact section
- Dynamic content loaded from the backend

---

### 🔐 Admin Panel

NEXUS includes a dedicated administration panel for managing website content.

Administrators can manage:

- 👥 Members
- 📅 Events
- 🖼️ Gallery
- 🧪 Projects
- 📊 Statistics
- ⚙️ Website Settings

The admin panel is protected using authentication and JWT-based authorization.

### Admin Flow

```text
Public Website
      ↓
 ADMIN PANEL
      ↓
 Admin Login
      ↓
 Authentication
      ↓
 Admin Dashboard