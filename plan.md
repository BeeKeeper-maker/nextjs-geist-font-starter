Below is a detailed implementation plan using modern best practices. This plan covers backend and frontend changes, error handling, and UI/UX considerations for a full-featured madrasha management system named “দারুল আবরার মডেল কামিল মাদ্রাসা.”

---

## 1. Database Setup and Prisma Integration

- **Add a Prisma schema file:**  
  - Create a new file at `prisma/schema.prisma` with the following models:

  ```prisma
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }

  // User model for authentication (Credentials Provider)
  model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    password  String
    name      String?
    role      String   // e.g. admin, teacher, student
    createdAt DateTime @default(now())
  }

  // Student model
  model Student {
    id             Int      @id @default(autoincrement())
    name           String
    rollNumber     String   @unique
    classId        Int
    photo          String?  // local file path
    contactNumber  String?
    email          String?
    address        String?
    enrollmentDate DateTime @default(now())
  }

  // Teacher model
  model Teacher {
    id             Int      @id @default(autoincrement())
    name           String
    qualification  String?
    subjects       String?
    contactNumber  String?
    email          String?
    photo          String?
    joinedAt       DateTime @default(now())
  }

  // Class model
  model Class {
    id       Int    @id @default(autoincrement())
    name     String
    teacher  Int    // relation field (could be extended to a proper relation)
  }

  // Fee model
  model Fee {
    id         Int      @id @default(autoincrement())
    studentId  Int
    amount     Float
    paidAt     DateTime @default(now())
    status     String   // e.g. paid, pending
    remarks    String?
  }

  // Attendance model
  model Attendance {
    id         Int      @id @default(autoincrement())
    studentId  Int
    date       DateTime
    status     String   // present/absent
  }

  // Exam model
  model Exam {
    id         Int      @id @default(autoincrement())
    studentId  Int
    subject    String
    examDate   DateTime
    marks      Float
  }
  ```

- **Environment Variables:**  
  - Create a `.env` file (not tracked in git) with:  
  `DATABASE_URL="file:./dev.db"`

- **Update Dependencies:**  
  - Add Prisma-related packages by updating `package.json` (if not present):

  ```json
  {
    "dependencies": {
      "@prisma/client": "^X.X.X",
      "next-auth": "^X.X.X"
    },
    "devDependencies": {
      "prisma": "^X.X.X"
    }
  }
  ```

- **Run commands:**  
  - Execute `npx prisma generate` and then `npx prisma migrate dev --name init` to establish the database.

---

## 2. Authentication (Local Credentials Provider)

- **NextAuth Setup:**  
  - Create an authentication route at `src/app/api/auth/[...nextauth]/route.ts` using NextAuth with a credentials provider.

  ```typescript
  import NextAuth from "next-auth";
  import CredentialsProvider from "next-auth/providers/credentials";
  import { PrismaClient } from "@prisma/client";
  import { compare } from "bcryptjs"; // assuming passwords are hashed

  const prisma = new PrismaClient();

  const handler = NextAuth({
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text", placeholder: "your@email.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          try {
            // lookup user in database
            const user = await prisma.user.findUnique({
              where: { email: credentials?.email }
            });
            if (user && (await compare(credentials!.password, user.password))) {
              return user;
            }
            throw new Error("Invalid credentials");
          } catch (error) {
            throw new Error("Authentication failed");
          }
        }
      })
    ],
    session: { strategy: "jwt" },
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.role = user.role;
        return token;
      },
      async session({ session, token }) {
        session.user.role = token.role as string;
        return session;
      }
    },
    debug: false
  });

  export { handler as GET, handler as POST };
  ```

---

## 3. API Endpoints for Module CRUD

- **Students API:**  
  - Create `src/app/api/students/route.ts` to handle GET, POST, PUT, DELETE
  - Use try-catch blocks and return proper JSON with error messages

  ```typescript
  import { NextResponse } from "next/server";
  import { PrismaClient } from "@prisma/client";

  const prisma = new PrismaClient();

  export async function GET() {
    try {
      const students = await prisma.student.findMany();
      return NextResponse.json({ students });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
  }

  export async function POST(request: Request) {
    try {
      const data = await request.json();
      const newStudent = await prisma.student.create({ data });
      return NextResponse.json({ student: newStudent }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
    }
  }
  // Similarly, create PUT (update) and DELETE handlers
  ```

- **Teachers, Classes, Fees, Attendance, Exams:**  
  - Repeat similar endpoint structures under respective folders (e.g. `src/app/api/teachers/route.ts`)

- **File Upload API (for photos/documents):**  
  - Create `src/app/api/upload/route.ts` and use a library like formidable if needed  
  - Save files locally and return the file URL or path

---

## 4. Frontend Pages & Components

### Dashboard and Management Pages

- **Dashboard Page:**  
  - Create `src/app/dashboard/page.tsx` as the home of the admin panel.  
  - Display summary statistics (counts of students, teachers, etc.) with error handling (using alert components on errors).  
  - Use a clean card design with typography and spacing.

  ```tsx
  "use client";
  import React, { useEffect, useState } from "react";
  import { Button } from "@/components/ui/button"; // using local UI component
  import axios from "axios";

  export default function DashboardPage() {
    const [stats, setStats] = useState({ students: 0, teachers: 0 });
    const [error, setError] = useState("");

    useEffect(() => {
      async function fetchStats() {
        try {
          const res = await axios.get("/api/students"); // example call
          setStats({
            students: res.data.students.length,
            // add additional API calls to get teachers, etc.
            teachers: 0
          });
        } catch (err) {
          setError("Failed to load dashboard statistics");
        }
      }
      fetchStats();
    }, []);

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">দারুল আবরার মডেল কামিল মাদ্রাসা Dashboard</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold">Students</h2>
            <p className="text-2xl mt-2">{stats.students}</p>
          </div>
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold">Teachers</h2>
            <p className="text-2xl mt-2">{stats.teachers}</p>
          </div>
          {/* Additional cards for Classes, Fees, etc. */}
        </div>
      </div>
    );
  }
  ```

- **Students Management Page:**  
  - Create `src/app/students/page.tsx` to list, add, edit, and delete student records.  
  - Use forms (from `src/components/ui/form.tsx`) for input and tables (from `src/components/ui/table.tsx`) for listing.

- **Teachers, Classes, and Additional Pages:**  
  - Similarly, create pages under `src/app/teachers/page.tsx`, `src/app/classes/page.tsx`, etc.

### Global Layout and Navigation

- **Layout Component:**  
  - Update `src/app/layout.tsx` to wrap every page with a header and sidebar.

  ```tsx
  import React from "react";
  import Header from "@/components/Header";
  import Sidebar from "@/components/Sidebar";
  import "@/app/globals.css";

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </body>
      </html>
    );
  }
  ```

- **Header Component:**  
  - Create `src/components/Header.tsx` that displays the school name with modern typography and spacing.

  ```tsx
  export default function Header() {
    return (
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">
          দারুল আবরার মডেল কামিল মাদ্রাসা
        </h1>
      </header>
    );
  }
  ```

- **Sidebar Component:**  
  - Create `src/components/Sidebar.tsx` with text links (no external icons) for navigation.

  ```tsx
  import Link from "next/link";

  export default function Sidebar() {
    return (
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="block p-2 hover:bg-gray-200">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/students" className="block p-2 hover:bg-gray-200">
                Students
              </Link>
            </li>
            <li>
              <Link href="/teachers" className="block p-2 hover:bg-gray-200">
                Teachers
              </Link>
            </li>
            <li>
              <Link href="/classes" className="block p-2 hover:bg-gray-200">
                Classes
              </Link>
            </li>
            {/* Add additional navigation for Fees, Attendance, Exams, etc. */}
          </ul>
        </nav>
      </aside>
    );
  }
  ```

---

## 5. File Uploads & Error Handling

- **File Upload Endpoint:**  
  - In `src/app/api/upload/route.ts`, handle multipart/form-data using a suitable parser (e.g., formidable).  
  - Implement try-catch and return JSON errors if file handling fails.

- **UI Error Handling:**  
  - Use alert components (e.g., `src/components/ui/alert.tsx`) for form validation and API error responses.  
  - Ensure both client and server validate input to prevent malformed data.

---

## 6. Additional Best Practices and Testing

- **API Testing:**  
  - Use curl commands to test endpoints. For example:
  
  ```bash
  curl -X GET http://localhost:3000/api/students -w "\nHTTP: %{http_code}\n"
  ```

- **Code Robustness:**  
  - Adopt try-catch blocks throughout API endpoints with meaningful error messages.  
  - Use TypeScript typings to guard against runtime errors.

- **UI/UX Considerations:**  
  - Ensure responsive designs using CSS grid/flexbox.  
  - Use clean typography, ample spacing, and a modern color palette defined in `globals.css`.

- **Documentation and README:**  
  - Update `README.md` with setup instructions (Prisma migration, environment variables, and running the Next.js server).  
  - List API endpoints and usage examples for further ease of development.

---

## Summary

- A new Prisma schema is created to model users, students, teachers, classes, fees, attendance, and exams using SQLite.  
- NextAuth is integrated via a credentials provider for local authentication.  
- API endpoints for CRUD operations (students, teachers, etc.) are developed with robust error handling.  
- Frontend pages including a dashboard, students, teachers, and classes management pages are built using modern, responsive UI components with custom header and sidebar layouts.  
- File uploads are supported via dedicated endpoints with proper error catching.  
- All changes adhere to best practices, ensuring type safety, clear error messaging, and a professional UI design.
