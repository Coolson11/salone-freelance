# Salone Freelance

Salone Freelance is a modern marketplace platform designed to connect verified talent with businesses in Sierra Leone. The platform allows freelancers to showcase their skills and clients to post jobs, manage applications, and collaborate through a secure and responsive interface.

## 🚀 Features

-   **User Roles:** Dedicated experiences for both Freelancers and Clients.
-   **Job Marketplace:** Browse and apply for jobs with filters for category, budget, and experience level.
-   **Talent Discovery:** Find and hire the best professionals with verified ratings and reviews.
-   **Dashboard:** Comprehensive management of projects, applications, and profile settings.
-   **Real-time Messaging:** Secure communication between clients and freelancers.
-   **Responsive Design:** Fully optimized for mobile, tablet, and desktop devices.
-   **Authentication:** Secure sign-up and login powered by Supabase.

## 🛠️ Tech Stack

-   **Frontend:** React (TypeScript), Vite, Tailwind CSS
-   **Icons:** Lucide React
-   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Real-time)
-   **Routing:** React Router Dom

## 💻 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/salone-freelance.git
    cd salone-freelance
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

### Production Build

To create a production-ready build:
```bash
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
