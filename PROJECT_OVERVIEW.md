# ERP Bugs Project Overview

## 1) What this project actually is

This project is a full-stack, role-based Learning and Content Commerce Platform (LMS + workflow + marketplace).

In practical terms, it lets an organization:

- Build a structured learning catalog (from category down to lesson/video)
- Run a contributor -> moderator -> admin publishing workflow
- Sell learning content to students (chapter-wise purchase and cart checkout)
- Deliver learning experiences (videos, progress tracking, quizzes, notes, forum)
- Manage users, notifications, FAQs, contact responses, media assets, and workflow history

The frontend labels the core learning units as **Value Streams**.

## 2) High-level business flow

There are two major halves in this system:

- Content Operations (create, review, approve, publish learning content)
- Learning + Commerce (students discover, buy, consume, and assess knowledge)

A typical end-to-end journey:

1. Contributor creates course structure and content.
2. Contributor submits content for review.
3. Moderator approves/rejects with reason.
4. Admin publishes approved content.
5. Student signs up with OTP verification, buys content, learns through lessons/videos.
6. Student takes quizzes, asks forum questions, and sees notifications/progress.

## 3) User roles and permissions

Roles are defined in Prisma and enforced in route middleware.

- ADMIN
  - Full catalog and user management
  - Publish final content
  - View workflow stats/history
  - Manage banners, logos, FAQ moderation, contacts, media
- STUDENT
  - Browse courses, purchase chapters, consume lessons
  - Maintain profile/billing
  - Take quizzes and view attempts
  - Participate in lesson forum
- CONTRIBUTOR
  - Create/edit course hierarchy and content
  - Submit content for moderation
  - View own contribution timeline/status
- MODERATOR
  - Review submissions
  - Approve/reject course/chapter/lesson content

## 4) Core domain model (database design)

### Main learning hierarchy

Category -> SubCategory -> Course -> SkillCategory -> Expertise -> Module -> Chapter -> Lesson -> Video

Important details:

- Chapters are monetized units (price is stored at chapter level)
- Quizzes are tied to chapters
- Materials can be attached at multiple hierarchy levels (course/skill/expertise/module/chapter/lesson)

### Key supporting entities

- User, PendingSignup, BillingInfo
- Purchase, CartItem
- ViewingHistory
- Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer
- LessonQuestion, QuestionReply, FaqBlock
- Notification, WorkflowHistory
- ContactSubmission, Banner, ClientLogo

## 5) What each major module does

### 5.1 Authentication and account lifecycle

- Signup is OTP-based with email verification.
- Pending signup data is stored in a dedicated PendingSignup table before account verification.
- Login returns JWT and checks:
  - password validity
  - email verified status
  - account active status
- Forgot password also uses OTP verification before reset.
- Email delivery is implemented via Brevo transactional API.

### 5.2 Profile and account settings

Authenticated users can:

- Get/update profile
- Upload/remove profile photo
- Request email change + OTP verify
- Change password
- Manage billing addresses and default billing profile

### 5.3 Course/catalog and structure management

The system supports complete hierarchical authoring:

- Categories and subcategories
- Courses
- Skill categories
- Expertise
- Modules
- Chapters
- Lessons (+ optional video data)

Supports:

- Bulk create for intermediate layers
- Edit/delete at each level
- Reordering for display/learning sequence
- Public and role-protected read APIs

### 5.4 Governance workflow (important differentiator)

Course, chapter, and lesson each support workflow status:

- DRAFT
- SUBMITTED
- APPROVED
- PUBLISHED
- REJECTED

Action flow:

- CONTRIBUTOR: submit
- MODERATOR: approve/reject
- ADMIN: publish

Each workflow action is logged in WorkflowHistory, and notifications are generated for relevant users/events.

### 5.5 Learning delivery

Student experience includes:

- Browse public catalog and course details
- Access purchased lessons and watch videos
- Continue watching from saved progress
- Keep lesson notes
- Ask questions in lesson forum with threaded replies

### 5.6 Quiz and assessment

Quiz system provides:

- Chapter-level quizzes
- MCQ questions with configurable options
- Attempt lifecycle: in-progress, completed, abandoned
- Scoring, percentage, passing checks
- Admin analytics and attempt details
- Student quiz history and result pages

### 5.7 Commerce: cart and purchases

Monetization is chapter-based.

- Add/remove chapter in cart
- Get cart count/summary
- Checkout cart to create purchase records
- Student can view purchased chapters/courses and purchase history
- Backend includes APIs to check purchase entitlement by chapter/course

### 5.8 Communication and engagement

- Notifications center (unread count, mark read/all read)
- Contact form submissions (public submit, admin review)
- FAQ moderation tools for admins
- Ability to block users from FAQ interactions (lesson/course scope)

### 5.9 Marketing/branding content

- Banner management with ordering and dimensions
- Client logo management with ordering
- Public student success stories feed
- Public pages include landing, gateways (90/180/360), career/corporate pages

## 6) Frontend architecture (client)

Tech stack:

- React + TypeScript + Vite
- React Router for route-based app shell and role pages
- React Query for async server state
- Zustand for auth/nav/cart local state
- Tailwind-based styling and modern UI primitives

Notable behavior:

- Role-based route redirection guard in hooks
- JWT token stored in local storage and injected via Axios interceptor
- Route map includes:
  - Public pages
  - Student dashboard and learning pages
  - Contributor authoring pages
  - Moderator review pages
  - Admin management pages

## 7) Backend architecture (server)

Tech stack:

- Express 5 + TypeScript
- Prisma ORM + PostgreSQL
- Zod input validation middleware
- JWT auth + role middleware
- Cloudinary upload integration
- Brevo email integration for OTP/notifications

API base:

- /api/v1/*

Primary API groups:

- auth, user, admin
- course
- quiz
- purchase, cart
- viewing-history
- forum, faq-admin
- material
- notification
- workflow tracking
- contact
- banner, client-logo, student-stories

## 8) Content lifecycle and status tracking

This is one of the strongest platform capabilities.

- Content can be authored by contributors in draft form.
- Submission enters moderation stage.
- Moderator decision captures approval/rejection and reason.
- Admin controls final publication.
- WorkflowHistory enables audit trails for each entity and action.
- Notifications propagate key workflow events.

## 9) Seed data and local testing

Seed script creates/upserts default users:

- admin@admin.com (ADMIN)
- student@student.com (STUDENT)

Default seed password (hashed in DB):

- admin@admin

Both seeded users are marked emailVerified=true and active, which allows immediate local login tests.

## 10) Environment and operations notes

Server expects environment variables such as:

- DATABASE_URL (or PRISMA_ACCELERATE_URL)
- JWT_SECRET
- Cloudinary keys
- Brevo sender/API settings

Prisma in this repository uses explicit Prisma config file style:

- prisma/prisma.config.ts
- schema: prisma/schema.prisma
- migrations path configured in prisma config

## 11) Where to read code first (recommended map)

If someone new joins this project, this reading order gives a quick understanding:

1. server/src/app.ts
2. server/prisma/schema.prisma
3. server/src/routes/course.routes.ts
4. server/src/routes/quiz.routes.ts
5. server/src/routes/purchase.routes.ts
6. server/src/services/auth.service.ts
7. client/src/routes.tsx
8. client/src/lib/api.ts
9. client/src/state/global.ts
10. client/src/components/ui/Layout/AppLayout.tsx

## 12) Short summary

This is not just a simple course website. It is a role-driven learning operations platform combining:

- Enterprise-style content workflow governance
- Course commerce
- Learning delivery and tracking
- Assessment and discussion
- Admin-level operational tooling

In one line: **a multi-role LMS + content workflow + chapter-commerce system with strong moderation and audit flow.**
