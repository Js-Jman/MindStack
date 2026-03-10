# 🎓 Learning Management System (LMS)

A full-featured learning platform built with modern web technologies that enables students to enroll in courses, access learning materials, complete quizzes and assignments, and track their progress — while empowering instructors and administrators to manage the entire learning ecosystem efficiently.

---

## Tech Stack

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

Create a `.env.local` file in the root directory with the following configuration:

```env
# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/mindstack"

# Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace `user`, `password`, and database name with your actual MySQL credentials.

---

### 4️⃣ Database Setup with Prisma

First, generate the Prisma client:

```bash
npm run prisma:generate
```

Then push the schema to your database:

```bash
npm run db:push
```

Finally, seed the database with dummy data:

```bash
npm run prisma:seed
```

Or run all steps at once:

```bash
npm run db:seed
```

---

### 5️⃣ Run Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## 🎓 Student Dashboard Features

The student dashboard includes:

### Dashboard Components
- **Stats Cards**: Display total enrollments, completed courses, in-progress courses, and average progress
- **Search Bar**: Search and filter enrolled courses by title or description
- **Course Cards**: Beautiful cards showing course information with progress bars
- **Enroll Button**: Access new courses and enroll in them

### UI/UX Features
- 🎨 Blue-to-purple gradient theme
- 📱 Fully responsive design (mobile, tablet, desktop)
- ✨ Smooth animations and transitions
- 🎯 Intuitive navigation and interaction

### Key Functionality
1. **View Enrolled Courses**: See all courses you're currently enrolled in with progress tracking
2. **Course Search**: Search within your enrolled courses
3. **Browse Available Courses**: Click "Enroll Courses" button to browse all available courses
4. **Enroll in New Courses**: One-click enrollment with instant status updates
5. **Track Progress**: Visual progress bars and stats showing your learning performance

---

## 📊 Database Schema

### Key Models

**User**
- Manages student, instructor, and admin profiles
- Stores authentication info and profile data

**Course**
- Contains course details, instructor info, and metadata
- Linked to lessons, quizzes, and enrollments

**Enrollment**
- Tracks student enrollment in courses
- Maintains progress and completion status

**Lesson**
- Stores course content and learning materials

**Quiz**
- Manages assessments and quizzes

---

## 🔌 API Endpoints

### Courses
- `GET /api/courses` - Get all courses (supports search with `?q=query`)
- `POST /api/courses` - Create a new course

### Enrollments
- `GET /api/enrollments?studentId=xxx` - Get enrolled courses for a student
- `POST /api/enrollments` - Enroll a student in a course

### Stats
- `GET /api/stats?studentId=xxx` - Get student statistics

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

### Core Contributors

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

# MindStack Azure VM + Docker Basic Setup

This is a baseline setup for:
- Next.js frontend + backend (API routes) in a single container
- MySQL in a single container
- Private IP connection from app to DB inside Docker network
- Azure VM provisioning with Terraform

## 1. Local prep

1. Copy `env.production.example` to `.env.production`.
2. Set strong values for:
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
   - `NEXTAUTH_SECRET`
3. Keep `MYSQL_PRIVATE_IP=172.30.0.10` unless you also change `docker-compose.yml` network config.

## 2. Provision Azure resources with Terraform

```bash
cd deployment/terraform
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

After apply:

```bash
terraform output vm_public_ip
terraform output vm_private_ip
terraform output ssh_command
```

## 3. Copy project to VM and run containers

On your local machine:

```bash
scp -r . azureuser@<VM_PUBLIC_IP>:~/MindStack
```

On the VM:

```bash
cd ~/MindStack
cp env.production.example .env.production
# edit .env.production with secure values
sudo docker compose --env-file .env.production up -d --build
```

## 4. Run Prisma migrations and seed data

```bash
sudo docker compose --env-file .env.production exec app npx prisma migrate deploy
sudo docker compose --env-file .env.production exec app npm run prisma:seed
```

## 5. Verify app + DB connectivity

- App: `http://<VM_PUBLIC_IP>:3000`
- DB is private to Docker network at `172.30.0.10:3306`
- DB is not publicly exposed because Compose uses `expose`, not host `ports`

## 6. Production hardening checklist

- Put Nginx or Caddy in front and enable HTTPS.
- Restrict NSG SSH source to your office/home IP.
- Move secrets to Azure Key Vault.
- Add backup strategy for `mysql_data` volume.

## Notes

- This is a basic single-VM deployment intended for initial setup.
- For high availability, move MySQL to managed Azure Database for MySQL in a later phase.
