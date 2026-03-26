# PrepPortal: Exam Admin Software

A complete **PrepPortal: Exam Admin Software for Dnyanganga Education Pvt Ltd** built to streamline **student lifecycle management, payments, communication, and automation workflows**.
The system supports **Admin, Counsellor, and Teacher roles**, with real-time operations and automated communication via **Email, WhatsApp Business API, and DLT-compliant SMS**.

---

## 🚀 Features

### 🔑 User & Role Management

* Admin can create and manage roles (Admin, Counsellor, Teacher).
* Counsellors handle student registration and payment workflows.
* Teachers manage paper checking and result uploads.

---

### 📚 Subject & Exam Management

* Add/update/delete subjects.
* Hall ticket generation and result declaration.

---

### 👨‍🎓 Student Management

* Student registration with profile photo upload.
* Payment tracking with receipt generation.
* Automatic PDF generation for:

  * Registration forms
  * Payment receipts
* Editable student profiles using Student ID.

---

### 💰 Payment & Reminder System

* Payment collection with automated receipts.
* Due reminders (4 days & 1 day before deadlines).
* Counsellor commission tracking and settlement management.
* Recollection handling for pending payments.

---

### 🤖 Chatbot & Smart Automation (NEW 🚀)

* Integrated **AI-driven chatbot** available on:

  * WhatsApp (via webhook)
  * Web platform
* Automatically resolves common institute queries (fees, registration, documents).
* Optimized API usage using:

  * Rate limiting
  * Token usage optimization
* Reduces manual support workload significantly.

---

### 📩 Advanced Communication System

* Integrated **Email, WhatsApp Business API, and DLT-compliant SMS**.
* Instant notifications for:

  * Registration confirmation
  * Payment success
  * Due reminders
* WhatsApp webhook features:

  * Students can request and receive **PDF documents** instantly.
* Automated **birthday wishes** for students and staff.

---

### 📨 Bulk Messaging System (AWS-Based) (NEW 🚀)

* Designed asynchronous bulk messaging system using:

  * **AWS SQS (Queue)**
  * **AWS Lambda (Worker Processing)**
* Handles high-volume WhatsApp message delivery reliably.
* Ensures fault-tolerant and scalable notification processing.

---

### 📖 Book Distribution

* Counsellors are notified when student dues are cleared (`amountRemaining == 0`).
* Book distribution tracking and updates.
* Admin dashboard for monitoring distribution reports.

---

### 📑 Document & Media Optimization (NEW 🚀)

* Automatic **image and PDF compression** to:

  * Reduce storage usage
  * Improve upload/download performance
* Efficient document handling across communication channels.

---

## ⚙️ Workflow

### 1. Admin

* Manages subjects and users.
* Monitors dashboards and reports.

### 2. Counsellor

* Registers students and collects payments.
* Sends automated notifications and receipts.
* Distributes books after payment clearance.

### 3. System Automation

* Sends notifications via Email, WhatsApp, and SMS.
* Generates and delivers PDF documents.
* Runs chatbot for query resolution.
* Triggers scheduled reminders and birthday messages.
* Processes bulk messaging via AWS queue system.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MySQL
* Sequelize ORM
* mysql2

### Cloud & Architecture

* AWS SQS (Queue System)
* AWS Lambda (Serverless Processing)

### APIs & Libraries

* WhatsApp Business API
* Fast2Sms API
* Nodemailer (Email integration)
* pdf-lib (PDF generation)
* jsonwebtoken (JWT Authentication)

---

## 🔗 Links

👉 Backend Repository: https://github.com/Annibadakh/dnyanganga-education-backend
👉 Live Application: https://dnyangangaeducation.com/

---

## 👨‍💻 Author

Developed by **Aniket Ramesh Badakh**

