# 🚀 API Toolkit - Project Management System

---

## 📋 Overview

API Toolkit simplifies API project creation and infrastructure management using role-based access control (RBAC). It includes secure authentication, project dashboards, contact management, analytics, and admin tools.

---

## ✨ Features

* 🔐 JWT-based Login, Signup & Forgot Password (with Email)
* 👤 Role-based Access (User, Onboarding Team, Admin)
* 🛠️ Project, IST Server, Domain, and Operation Service Management
* 📊 Real-time Analytics (Domains, Versions, Usage)
* 👥 Admin Panel for User & Role Management
* 🔄 Session Handling with Token Refresh

---

## 🧑‍💼 User Roles

| Role           | Permissions                                                       |
| -------------- | ----------------------------------------------------------------- |
| **User**       | Create/edit projects, manage contacts, view personal analytics    |
| **Onboarding** | All User rights + manage IST servers, domains, operation services |
| **Admin**      | All Onboarding rights + manage users and roles                    |

---

## 🏗 Tech Stack

* **Backend**: Spring Boot 3, Spring Security, JPA, MySQL, JWT, JavaMail
* **Frontend**: React 18, Tailwind CSS, Axios, React Router, Context API

---

## ⚙️ Setup Guide

### Prerequisites

* Java 17+, Node.js 18+, MySQL 8+, Maven 3.6+

### 1️⃣ Database Setup

```sql
CREATE DATABASE api_toolkit;
```

### 2️⃣ Backend Configuration (`backend/.env`)

refer this video to get google app password:
[🔗 Click Here](https://www.youtube.com/watch?v=MkLX85XU5rU)

```env
DB_URL=jdbc:mysql://localhost:3306/api_toolkit OR youRDBURL/api_toolkit
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
```
### 3️⃣ Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 4️⃣ Run Frontend

```bash
cd frontend/React
npm install
npm run dev
```

---

## 👑 Create First Admin

1. Sign up via the frontend
2. Update role in DB:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your_email@example.com';
```

---

## 🖥 Key Pages

* **Login / Signup / Forgot Password**
* **Dashboard & Profile**
* **Project Management**
* **Analytics**
* **Admin Panel (Roles, Users, Infrastructure)**

---

## 🔐 Security Highlights

* JWT Auth + Refresh
* BCrypt Password Hashing
* SQL Injection Protection (via JPA)
* CORS Configured
* Input Validation (Frontend + Backend)

---

## 📊 Analytics

* Domain & Version Usage
* Operation Service Popularity
* Project Trends
* User Activity Logs

---

## 🚀 Build & Deploy

### Development

```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend/React && npm run dev
```

### Production

```bash
# Frontend Build
cd frontend/React && npm run build

# Backend JAR
cd backend && mvn clean package
```

---