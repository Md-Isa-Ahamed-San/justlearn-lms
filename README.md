# JUSTLearn LMS

JUSTLearn LMS is a feature-rich Learning Management System (LMS) designed to provide a comprehensive platform for online education. Built with a modern tech stack including Next.js, Prisma, and Tailwind CSS, it offers a seamless and interactive experience for students, instructors, and administrators.

## Features

*   **User Authentication:** Secure sign-up and login for users, including Google OAuth integration.
*   **Course Creation and Management:** Tools for instructors to create, update, and manage courses, lessons, and content.
*   **Student Enrollment:** Easy enrollment process for students to access courses.
*   **Interactive Learning:** Support for various content types, including text, video, and interactive quizzes.
*   **Instructor Dashboard:** A dedicated dashboard for instructors to track student progress, manage courses, and interact with students.
*   **Admin Dashboard:** A comprehensive dashboard for administrators to manage users, courses, categories, and site settings.
*   **Payment Integration:** Integration with Stripe for handling course payments and subscriptions.
*   **Responsive Design:** Fully responsive interface ensuring a great experience on desktops, tablets, and mobile devices.
*   **Profile Management:** Users can manage their profiles, view enrolled courses, and track their learning progress.
*   **Category Management:** Courses can be organized into categories for easier navigation and discovery.
*   **Search and Filtering:** Users can search for courses and filter them based on various criteria.

## Tech Stack

*   **Frontend:**
    *   Next.js (v15+ with Turbopack)
    *   React (v18+)
    *   Tailwind CSS
    *   Shadcn/ui (UI components built on Radix UI)
    *   Framer Motion (for animations)
    *   Lottie (for animations)
    *   React Hook Form (for form handling)
    *   Sonner (for notifications)
*   **Backend:**
    *   Next.js API Routes
    *   NextAuth.js (v5 beta for authentication)
    *   Prisma (v6+ ORM for database interaction)
*   **Database:**
    *   MongoDB (as indicated by Prisma setup and `mongodb` driver)
*   **Payments:**
    *   Stripe
*   **Linting & Formatting:**
    *   ESLint
*   **Deployment:**
    *   (Assumed to be Vercel, common for Next.js, but not explicitly stated)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   MongoDB instance (local or cloud-hosted)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repository-url-here/justlearn.git
    cd justlearn-lms
    ```
    *(Replace `your-username/justlearn-lms.git` with the actual repository URL if different)*

2.  **Install NPM packages:**
    ```bash
    npm install
    ```
    *(Or `yarn install` if you prefer yarn)*

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add the necessary environment variables. You can typically copy `.env.example` (if provided) to `.env.local`. Key variables include:
    *   `DATABASE_URL`: Your MongoDB connection string.
    *   `NEXTAUTH_SECRET`: A secret key for NextAuth.js. You can generate one using `openssl rand -hex 32`.
    *   `NEXTAUTH_URL`: The base URL of your application (e.g., `http://localhost:3000`).
    *   `GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
    *   `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.
    *   `STRIPE_SECRET_KEY`: Your Stripe secret key.
    *   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret.
    *   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name for image/video uploads.
    *   `CLOUDINARY_API_KEY`: Your Cloudinary API key.
    *   `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.

    *Example `.env.local` structure:*
    ```env
    DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/justlearn?retryWrites=true&w=majority"
    NEXTAUTH_SECRET="your_very_strong_secret_here"
    NEXTAUTH_URL="http://localhost:3000"

    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"

    STRIPE_SECRET_KEY="sk_test_yourstripesecretkey"
    STRIPE_WEBHOOK_SECRET="whsec_yourstripewebhooksecret"
    
    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
    ```

4.  **Set up the database:**
    Ensure your Prisma schema is synchronized with your database.
    ```bash
    npx prisma db push
    ```
    *(This command applies pending migrations or creates the database if it doesn't exist, based on your schema. For development, `db push` is often used. For production, `prisma migrate deploy` is preferred after generating migrations with `prisma migrate dev`.)*

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the application on `http://localhost:3000` (or another port if specified).

## Available Scripts

In the project directory, you can run the following scripts:

*   ### `npm run dev`
    Runs the app in development mode with Turbopack.
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
    The page will reload if you make edits.

*   ### `npm run build`
    Builds the app for production to the `.next` folder.
    It correctly bundles React in production mode and optimizes the build for the best performance.

*   ### `npm run start`
    Starts the application in production mode. This should be run after building the application with `npm run build`.

*   ### `npm run lint`
    Lints the project files using ESLint to check for code quality and style issues.

## Project Structure

The project follows a structure typical for Next.js applications, with some additions for this specific LMS:

```
justlearn-lms/
├── app/                          # Next.js App Router: pages, layouts, components
│   ├── (main)/                   # Main application routes (e.g., courses, account)
│   ├── api/                      # API route handlers
│   ├── admin-dashboard/          # Components and pages for the admin dashboard
│   ├── instructor-dashboard/     # Components and pages for the instructor dashboard
│   ├── layout.js                 # Root layout
│   └── page.js                   # Root page (homepage)
├── components/                   # Shared UI components used across the application
│   └── ui/                       # UI primitives (often from Shadcn/ui)
├── public/                       # Static assets (images, fonts, etc.)
├── prisma/                       # Prisma schema and migration files
│   └── schema.prisma             # Defines database models and relations
├── lib/                          # Utility functions, helpers, Prisma client instance
├── hooks/                        # Custom React hooks
├── queries/                      # Database query functions (data access layer)
├── actions/                      # Server Actions for form submissions and mutations
├── database-dummy-data/          # JSON files with dummy data for seeding
├── auth.config.js                # NextAuth.js configuration options
├── auth.js                       # NextAuth.js initialization and providers
├── middleware.js                 # Next.js middleware for request processing (e.g., auth)
├── next.config.mjs               # Next.js configuration file
├── package.json                  # Project dependencies and scripts
└── README.md                     # This file
```

*   **`app/`**: Contains all the routes, UI components, and logic related to the Next.js App Router.
    *   **`(main)/`**: Groups routes for the main user-facing application.
    *   **`api/`**: Houses backend API endpoints.
    *   **`admin-dashboard/` & `instructor-dashboard/`**: Specific modules for these roles.
*   **`components/`**: Reusable React components used throughout the application.
    *   **`ui/`**: Base UI elements, likely from a library like Shadcn/UI, built upon Radix UI.
*   **`public/`**: Static files that are served directly, such as images, fonts, and icons.
*   **`prisma/`**: Configuration for the Prisma ORM, including the `schema.prisma` file which defines the database models.
*   **`lib/`**: Helper functions, utility scripts, and the Prisma client initialization.
*   **`hooks/`**: Custom React hooks to encapsulate reusable stateful logic.
*   **`queries/`**: Functions dedicated to fetching data from the database, often using Prisma.
*   **`actions/`**: Next.js Server Actions, used for handling form submissions and data mutations securely on the server.
*   **`database-dummy-data/`**: Sample data that can be used to populate the database for testing or demonstration.
*   **`auth.config.js` & `auth.js`**: Configuration files for NextAuth.js, handling authentication strategies and callbacks.
*   **`middleware.js`**: Used for running code before a request is completed (e.g., protecting routes based on authentication).

## Contributing

Contributions are welcome and greatly appreciated! If you have a suggestion or want to contribute code, please follow these steps:

1.  **Fork the Project:** Create your own fork of the repository.
2.  **Create your Feature Branch:**
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3.  **Commit your Changes:**
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4.  **Push to the Branch:**
    ```bash
    git push origin feature/AmazingFeature
    ```
5.  **Open a Pull Request:** Open a pull request against the `main` (or `develop`) branch of the original repository.

Please make sure your code adheres to the project's coding standards and includes tests where applicable.

## License

This project is currently unlicensed. Please refer to the repository owner for licensing information.

*(Optional: If you intend to use a specific open-source license, you can replace the above with details of the chosen license, e.g., "Distributed under the MIT License. See `LICENSE` file for more information.")*
