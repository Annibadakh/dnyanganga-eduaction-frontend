# PrepPortal: Exam Admin Software

A complete **PrepPortal: Exam Admin Software for Dnyangnaga Education Pvt Ltd** built for a client to streamline **subject management, student registration, payments, halltickets, results, notifications, and book distribution**.  
This project is designed to handle **Admin, Counsellor, and Teacher roles** with dashboards and automated communication (Email, WhatsApp Business API, DLT-compliant SMS).

---

## 🚀 Features

### 🔑 User & Role Management
- Admin can create and manage roles (Admin, Counsellor, Teacher).
- Counsellors manage student registrations and payments.
- Teachers can manage paper checking and result upload tasks.

### 📚 Subject & Exam Management
- Add/update/delete subjects.
- Hallticket generation and result declaration.

### 👨‍🎓 Student Management
- Student registration with profile photo upload.
- Payment collection and tracking.
- Automatic PDF generation for **Registration Form** & **Payment Receipt**.
- Edit student details (using Student ID).

### 💰 Payment & Reminders
- Payment collection with receipts.
- Automatic due-date reminders (4 days & 1 day before).
- Counsellors retain percentage of collection, with settlement tracking.
- Recollection option for pending payments.

### 📩 Communication System
- Integrated **Email, WhatsApp Business API, and DLT-compliant SMS**.
- Instant notifications on:
  - Successful registration
  - Payment confirmation
  - Due reminders
- WhatsApp webhook integration:
  - Students can request **PDF documents** by messaging the institute’s business number.
- Automatic **birthday wishes** for students, counsellors, and visiting students.

### 📖 Book Distribution
- When a student clears all dues (`amountRemaining == 0`), counsellor receives notification.
- Counsellor can mark book distribution status.
- Admin can monitor overall distribution reports.

### 📑 Document Management
- PDF creation for:
  - Registration forms
  - Payment receipts
- Auto-download and sending via messages.

---

## ⚙️ Workflow

1. **Admin**  
   - Manages subjects.  
   - Adds counsellors & teachers.  
   - Views institute-wide data in dashboard.  

2. **Counsellor**  
   - Registers students & collects payments.  
   - Views student details in their dashboard.  
   - Sends notifications & receipts automatically.  
   - Distributes books once dues are cleared.  

3. **System Automation**  
   - Sends payment/registration notifications.  
   - Generates and sends PDF documents.  
   - Sends birthday wishes automatically.  
   - Triggers reminders for due payments.  

---


## 🛠️ Tech Stack

**Frontend**  
- React.js  
- Tailwind CSS  

**Backend**  
- Node.js  
- Express.js  

**Database**  
- MySQL  
- Sequelize ORM  
- mysql2  

**APIs & Libraries**  
- WhatsApp Business API  
- Fast2Sms API  
- Nodemailer (Email integration)  
- pdf-lib (PDF generation)  
- jsonwebtoken (JWT Authentication)  

---

## 🔗 Links

👉 [Backend Repository Link](https://github.com/Annibadakh/dnyanganga-education-backend)
👉 [Deployed Link](https://dnyangangaeducation.com/)

---



## 👨‍💻 Author

Developed by **Aniket Ramesh Badakh**
