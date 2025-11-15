# JustLearn LMS

JustLearn is a feature-rich Learning Management System (LMS) built with modern web technologies. It provides a platform for instructors to create and manage courses, and for students to enroll and learn. The platform includes an advanced quiz engine with AI-powered features and anti-cheating measures, course and lesson management, and detailed progress tracking.

## Features

- **Role-Based User Management:** Separate roles for students, instructors, and admins, each with tailored permissions and dashboards.
- **Comprehensive Course Creation:** Instructors can build courses with structured weeks and lessons, including video content and attachments.
- **Advanced Quiz Engine:**
    - Multiple question types (MCQ, Short Answer, Long Answer).
    - AI-powered quiz generation to create diverse assessments.
    - Robust anti-cheating features like fullscreen enforcement, copy/paste blocking, and tab switch detection.
- **Student Progress Tracking:** Detailed monitoring of course completion, lesson progress, and quiz scores.
- **Live Interactive Sessions:** Instructors can schedule and host live video sessions with students.
- **Secure Authentication:** Supports both traditional email/password login and OAuth providers.
- **Certificate Generation:** Automatically issue certificates to students upon course completion.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Payments:** [Stripe](https://stripe.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **AI:** [Groq SDK](https://wow.groq.com/)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/justlearn-lms.git
    cd justlearn-lms
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables. See `.env.example` for a template.

    ```env
    # Database
    DATABASE_URL="your_mongodb_connection_string"

    # Authentication (NextAuth.js)
    AUTH_SECRET="your_auth_secret"
    AUTH_URL="http://localhost:3000"
    # Add Google/GitHub provider credentials if you use them
    # GOOGLE_CLIENT_ID="..."
    # GOOGLE_CLIENT_SECRET="..."

    # Stripe
    STRIPE_API_KEY="your_stripe_api_key"
    STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
    
    # Groq AI
    GROQ_API_KEY="your_groq_api_key"
    ```

4.  **Push the database schema:**
    This command will sync your Prisma schema with your MongoDB database.
    ```bash
    npx prisma db push
    ```

### Usage

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
