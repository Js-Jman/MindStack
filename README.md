# 🎓 Learning Management System (LMS)

A full-featured learning platform built with modern web technologies that enables students to enroll in courses, access learning materials, complete quizzes and assignments, and track their progress — while empowering instructors and administrators to manage the entire learning ecosystem efficiently.

---

## 🚀 Tech Stack

✔ **Framework:** Next.js (Both Frontend & Backend)  
✔ **Styling:** Tailwind CSS  
✔ **UI Components:** shadcn/ui  
✔ **Database:** MySQL  
✔ **Language:** TypeScript  

---

## ✨ Core Features

### 👩‍🎓 Student

➤ User Registration & Login  
➤ Browse Available Courses  
➤ Enroll in Courses  
➤ Access Lessons & Study Materials  
➤ Attempt Quizzes  
➤ Submit Assignments  
➤ Track Learning Progress  
➤ Raise Support Tickets  

---

### 👨‍🏫 Instructor

➤ Create & Manage Courses  
➤ Add Modules & Lessons  
➤ Upload Learning Materials  
➤ Create Quizzes & Assignments  
➤ Review Student Submissions  
➤ Track Enrollments  
➤ Monitor Student Progress  
➤ Raise Support Tickets  

---

### 🛡 Admin

➤ Dedicated Admin Dashboard  
➤ Full User Management (Students & Instructors)  
➤ Course Moderation & Control  
➤ Manage Enrollments  
➤ Monitor Platform Activity  
➤ Review & Resolve Reported Issues / Tickets  
➤ System-wide Control & Oversight  

The admin panel acts as the control center of the platform, ensuring smooth operation and maintaining quality across the system.

---

## 🏗 Project Architecture

The project follows a modular and scalable architecture structure:



```
app/              → Routing & Layouts (Next.js)
components/       → Reusable UI Components
services/         → Business Logic Layer
repositories/     → Database Access Layer
lib/              → Utilities & Config
hooks/            → Custom React Hooks
types/            → TypeScript Types
prisma/           → Database Schema
middleware.ts     → Role-based Route Protection
```

### Architectural Principles

- Clear separation of concerns
- Feature-based modular structure
- Service → Repository → Database flow
- Role-based access control
- Reusable UI component system

This ensures maintainability, scalability, and clean code organization.

---

## 🔐 Role-Based Access Control

The system supports:

- Student
- Instructor
- Admin

Routes and dashboards are protected using middleware and server-side authorization checks to ensure secure access control.

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Js-Jman/MindStack.git
cd MindStack
```

---

### 2️⃣ Install Dependencies

```bash
npm i
```

---

### 3️⃣ Environment Configuration

Create a `.env` file in the root directory with the following configuration and update your DB details before running the application:

```
DB_USER=root
DB_PASS=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=myappdb
```

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## 📂 Folder Structure Overview

```
lms/
 ├── app/
 ├── components/
 ├── services/
 ├── repositories/
 ├── hooks/
 ├── lib/
 ├── types/
 ├── prisma/
 └── middleware.ts
```

---

## 🎨 UI & Design

✔ Built using Tailwind CSS utility-first styling  
✔ shadcn/ui for accessible and reusable components  
✔ Clean dashboard layouts  
✔ Role-specific UI experiences  
✔ Responsive design for multiple screen sizes  

---

## 📌 Key Highlights

✔ Modular and scalable folder structure  
✔ Clean separation of UI and business logic  
✔ Role-based dashboards  
✔ Support ticket management system  
✔ Designed for real-world production patterns  

---

## 👥 Development Team

This project was collaboratively built by a dedicated team of developers.

### 🚀 Core Contributors

🔹 **[Shefali Chopra](https://github.com/ishefalichopra)**  
🔹 **[AkshayaMuvva](https://github.com/AkshayaMuvva)**  
🔹 **[BalaPriyadarshini](https://github.com/BalaPriyadarshini)**  
🔹 **[Vaddi Sri Venkata Bharath](https://github.com/BharathVaddi30)**  
🔹 **[ABISHEK R](https://github.com/abi23456)**  
🔹 **[Js](https://github.com/JaisuryaIT)**  

---

### 🤝 Team Collaboration

✔ Modular architecture planning  
✔ Role-based system design  
✔ UI/UX consistency  
✔ Business logic implementation  
✔ API structure & system flow  

---

⭐ Built with collaboration, clean architecture, and design principles.