# 🚀 Smart Task Manager (Full-Stack)

A modern, enterprise-ready full-stack SaaS task management application engineered with **NestJS**, **Next.js (App Router)**, **TypeORM**, and **Tailwind CSS**. 

Built with a strong focus on modular architecture, server-side data filtering, end-to-end TypeScript type safety, and stateless JWT authentication.

---

## ✨ Features

- 🔐 **Stateless JWT Authentication:** Secure login and registration flow utilizing `bcrypt` password hashing and NestJS `@nestjs/passport` strategy.
- 🛡️ **User Data Isolation & Security:** Multi-tenant architecture ensuring tasks and relational categories are strictly isolated per authenticated user via database foreign key constraints (`@ManyToOne`).
- ⚡ **Server-Side Search & Filtering:** Optimized database queries utilizing TypeORM `Like()` operators and dynamic query parameters (`@Query()`) rather than client-side array filtering.
- 📁 **Relational Data Normalization:** Fully normalized database model connecting `User`, `Task`, and `Category` entities on SQLite (`better-sqlite3`).
- 🎨 **Modern SaaS Interface:** Polished, responsive Next.js client featuring color-coded priority badges (High/Medium/Low), filter tabs, persistent token storage, and custom Tailwind styling.

---

## 🛠️ Tech Stack & Architecture

### **Backend (NestJS)**
- **Framework:** NestJS (Modular Architecture: Controllers, Services, DTOs, Guards, Entities)
- **Database / ORM:** SQLite (`better-sqlite3`) + TypeORM
- **Authentication:** Passport.js, `@nestjs/jwt`, `bcrypt`
- **Validation:** `class-validator`, `class-transformer`

### **Frontend (Next.js)**
- **Framework:** Next.js 14 (App Router) + React
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **HTTP Client:** Native `fetch` with `Authorization: Bearer <token>` header injection

---

## 🏗️ Relational Database Model

```text
  +------------------+         +------------------+         +------------------+
  |       User       |         |       Task       |         |     Category     |
  +------------------+         +------------------+         +------------------+
  | id (PK)          | <---+   | id (PK)          |   +---> | id (PK)          |
  | email (Unique)   |     |---| userId (FK)      |   |     | name             |
  | password (Hash)  |         | categoryId (FK)  |---|     +------------------+
  +------------------+         | title            |
                               | priority         |
                               | dueDate          |
                               | is_completed     |
                               +------------------+
