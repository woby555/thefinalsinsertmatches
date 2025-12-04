# Match Tracking System

A private, local-only web application for tracking in-game matches, characters, loadouts, progression points, and overall performance. Built with **Next.js**, **Prisma**, and **PostgreSQL**, this project provides fast data entry tools and detailed history views to help analyze gameplay progression.

---

## 🚀 Features

### **Match Entry Form**
- Select **Character → Specialization → Loadout** with dynamic filtering.
- Choose an **Arena**.
- Log match outcomes (Win / Loss / Draw).
- Automatically calculate and store **progression points**.
- UI optimized for fast repeat-entry.

### **Match History Dashboard**
- Displays all recorded matches in a clean, scrollable table.
- Shows character, specialization, loadout, arena, and progression points.
- Editing mode for adjusting historical data.
- Real-time visual updates without page reload.

### **Loadout Management**
- Create and edit loadouts tied to specializations.
- Assign equipment sets and loadout names.
- Used seamlessly in the match entry workflow.

### **Progression Summary**
- Quick card showing total progression points.
- Can be expanded later to include streaks, averages, and graphs.

### **Local and Private by Design**
- Runs on localhost only.
- PostgreSQL configured to accept local connections only.
- No public exposure or external API calls.

---

## 🏗️ Tech Stack

### **Frontend**
- Next.js (App Router)
- React
- TailwindCSS + DaisyUI

### **Backend**
- Next.js API Routes
- Prisma ORM
- Local PostgreSQL server

### **Database**
Schema includes:
- Characters
- Specializations
- Loadouts
- Arenas
- Matches
- Equipment (optional or planned)

---

## 📦 Installation

### **1. Clone the Repository**
```
git clone <repo-url>
cd <project-folder>
```

### **2. Install Dependencies**
```
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file:
```
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

### **4. Generate Prisma Client**
```
npx prisma generate
```

### **5. Start the Local Database**
Make sure PostgreSQL is running on your system.

### **6. Run the Development Server**
```
npm run dev
```

Visit:
```
http://localhost:3000
```

---

## 🧪 Development Workflow
1. Start PostgreSQL (via service or manual script).
2. Run the Next.js dev server.
3. Use the Insert Match page to log gameplay sessions.
4. View logs and progression on the Dashboard page.

---

## 🗺️ Planned Enhancements
- Graphs for performance over time
- Streak and winrate tracking
- Opponent/team logging
- Loadout comparisons
- Export/import match data
- Full CRUD for equipment tables

---

## 📄 License
This project is for personal use and demonstration. Not intended for production deployment.

---

## 🙌 Acknowledgments
Built as a personal utility tool to track in-game performance and progression more accurately.

