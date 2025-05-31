
# Focus Gen - Productivity Toolkit

Focus Gen is a Next.js web application designed to enhance your productivity and time management skills. It provides a suite of essential tools, all in one place, with a clean, modern, and customizable interface.

## Features

Focus Gen currently includes the following tools:

*   **Clock**: Displays the current time in both digital and analog formats. It also includes a world clock display for major cities.
*   **Stopwatch**: A precision stopwatch with lap functionality. Offers multiple visual styles including a 60-second arc display.
*   **Timer (Countdown)**: A versatile countdown timer with customizable durations, preset options (including saving your own), and visual styles like circular progress.
*   **Pomodoro Timer**: Implement the Pomodoro Technique with configurable work, short break, and long break durations. Features visual cycle indicators and distinct themes for work/break sessions, including a unique "Pixel Tomato" style.
*   **Calendar**: A simple calendar tool allowing you to select dates and manage tasks associated with specific days. Tasks are stored locally in your browser.
*   **To-Do List**: A straightforward daily to-do list to keep track of your tasks. Tasks are stored locally.

## Core Technologies

*   **Next.js**: React framework for server-side rendering and static site generation.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Shadcn/ui**: Re-usable UI components built with Radix UI and Tailwind CSS.
*   **Lucide React**: Beautifully simple and consistent open-source icons.
*   **Genkit (Firebase)**: For potential future AI-powered features (currently configured but not actively used in the UI).

## Getting Started

Follow these instructions to get a local copy of Focus Gen up and running on your machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or newer recommended)
*   npm (comes with Node.js) or yarn
*   Git

### Installation & Running Locally

1.  **Clone the repository:**
    Replace `<repository_url>` with the actual URL of your Git repository.
    ```bash
    git clone <repository_url>
    ```

2.  **Navigate to the project directory:**
    Replace `focus-gen` with the name of the directory created by the `git clone` command if it's different.
    ```bash
    cd focus-gen
    ```

3.  **Install dependencies:**
    This command will download and install all the necessary packages defined in `package.json`.
    ```bash
    npm install
    ```
    (Alternatively, if you prefer using yarn: `yarn install`)

4.  **Run the development server:**
    This command starts the Next.js development server, typically on `http://localhost:9002` (as configured in `package.json`).
    ```bash
    npm run dev
    ```
    (Alternatively, with yarn: `yarn dev`)

    You should now be able to open your browser and navigate to `http://localhost:9002` to see the application running. The page will automatically reload if you make changes to the code.

## Project Structure

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
*   `src/components/`: Houses reusable React components.
    *   `src/components/ui/`: Shadcn/ui components.
    *   `src/components/layout/`: Layout-specific components like header and sidebar.
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions.
*   `src/types/`: TypeScript type definitions.
*   `src/ai/`: Genkit configuration and flows (for potential AI features).
*   `public/`: Static assets.

## Customization

*   **Theme**: Colors and styling can be primarily adjusted in `src/app/globals.css` (Tailwind CSS and Shadcn theme variables) and `tailwind.config.ts`.
*   **Components**: Modify or extend components in `src/components/` to change functionality or appearance.

## Contributing

Contributions are welcome! If you have suggestions or want to improve Focus Gen, please feel free to fork the repository and submit a pull request.

(If you have specific contribution guidelines, add them here.)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a solid overview and setup guide for the "Focus Gen" application.
Enjoy boosting your productivity!
