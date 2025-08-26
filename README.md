# AI Mental Health Companion 

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elhossam7/serenity_companion.git
   cd serenity_companion
   ```

2. **Set up environment variables:**
   Create `.env` from the provided example and fill your Supabase values:
   ```bash
   # Windows PowerShell
   copy .env.example .env
   ```
   Then edit `.env` and set:
   - `VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY`

3. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
   
4. **Start the development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
4. Create your .env from the example and fill Supabase values:
   ```bash
   cp .env.example .env
   # Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.mjs     # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```

If you see an error about missing Supabase variables, ensure `.env` is configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
This app requires Node.js 18+.

## 🧰 Vite Dev Server

- The dev server runs on port 4028. If the port is taken, Vite will pick a free one automatically.
- To expose the dev server behind a proxy/domain, add your host to `allowedHosts` in `vite.config.mjs`.

