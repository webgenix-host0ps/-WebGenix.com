# Project Structure - WebGenix

This document provides a detailed overview of the WebGenix project's folder structure and the purpose of each file/directory.

## Root Directory
- `/`
    - `services.json`: The primary data source for services offered by WebGenix. Contains JSON data describing various service categories, features, and details.
    - `theme.css`: Global theme variables and styles defined for the project.
    - `theme.js`: JavaScript-based theme configurations or utilities.
    - `THEME_SPECIFICATION.md`: Detailed documentation outlining the design system, color palettes, and typography rules.
    - `THEME_QUICK_REFERENCE.md`: A condensed guide for developers to quickly look up theme tokens and usage.
    - `webgenix-app/`: The main React application directory.

## WebGenix App (`/webgenix-app`)
This is the core React application built using Vite.

- `index.html`: The entry HTML file.
- `vite.config.js`: Configuration file for the Vite build tool.
- `package.json`: Project dependencies and scripts.
- `src/`: Source code of the application.
    - `main.jsx`: The main entry point that renders the React application.
    - `App.jsx`: The root component that sets up the overall layout and routing.
    - `index.css`: Global styles for the application, including Tailwind CSS imports.
    - `assets/`: Static assets like images, icons, and fonts.
    - `components/`: Reusable UI components.
        - `Badge.jsx`: Component for displaying labels or status indicators.
        - `Footer.jsx`: The application footer containing links and contact info.
        - `Navbar.jsx`: The navigation bar with links and branding.
        - `SectionHeader.jsx`: A reusable header component for page sections.
        - `ServiceCard.jsx`: Card component used to display individual service summaries.
        - `StatsBar.jsx`: A component for displaying key performance indicators or statistics.
    - `data/`: Data processing and utility files.
        - `services.js`: Likely processes the raw `services.json` data for use within the application.
    - `pages/`: Page-level components.
        - `Home.jsx`: The main landing page of the application, integrating various components and service data.

## Key Technologies
- **React**: Frontend library.
- **Vite**: Build tool and dev server.
- **Tailwind CSS (v4)**: Utility-first CSS framework for styling.
- **Lucide React**: Icon library (commonly used in this stack).
