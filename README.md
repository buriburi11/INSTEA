# INSTEA Frontend Setup Guide

This guide sets up the INSTEA React website on WSL (Windows Subsystem for Linux). It installs Node.js and npm inside WSL, downloads the project, and installs its frontend dependencies.

## 1. Open your WSL terminal

Use the same Linux distribution and WSL account for the project each time.

Check that Git and curl are installed:

```bash
git --version
curl --version
```

If either command is missing, install them:

```bash
sudo apt update
sudo apt install -y git curl
```

## 2. Install Node.js and npm with nvm

Install nvm, a tool for managing Node.js versions:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```

Load nvm in the current terminal:

```bash
source ~/.bashrc
```

Install the current Node.js long-term support version:

```bash
nvm install --lts
nvm use --lts
```

Confirm Node.js and npm are available:

```bash
node --version
npm --version
```

These commands should run inside WSL. Windows-installed Node.js does not replace the WSL installation.

## 3. Clone the INSTEA repository

Clone the team’s GitHub repository into your WSL home folder. Replace the URL below with the repository’s HTTPS URL:

```bash
mkdir -p ~/projects
cd ~/projects
git clone REPOSITORY_URL INSTEA
cd INSTEA
```

For example, the repository URL may look like:

```text
https://github.com/TEAM-OR-OWNER/INSTEA.git
```

If you already cloned the repository, go to its existing folder instead of cloning it again.

## 4. Open the frontend folder

If the React project is in a folder named `frontend`, run:

```bash
cd ~/projects/INSTEA/frontend
```

If `package.json` is in the repository’s top-level folder, use that folder instead.

Check that you are in the right place:

```bash
ls
```

You should see `package.json`. If the project includes `package-lock.json`, use the next step to install the dependencies.

## 5. Install project dependencies

Run:

```bash
npm ci
```

This installs the exact dependency versions recorded in `package-lock.json`. Use `npm install` if the project does not yet have a `package-lock.json`.

## 6. Start the website

```bash
npm run dev
```

Open the local address printed in the terminal, commonly:

```text
http://localhost:5173
```

Keep the terminal running while you use the site. Press `Ctrl+C` in that terminal to stop the development server.

## 7. Run the linter

In a second terminal, go to the frontend folder and run:

```bash
npm run lint
```

If the project’s `package.json` does not have a `lint` script, ask the team before adding or changing project configuration.

## 8. Run the tests

The frontend uses [Vitest](https://vitest.dev) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and jsdom.

From the frontend folder, run the tests once:

```bash
npm run test:run
```

Or start watch mode, which reruns tests when you save a file:

```bash
npm test
```

Press `q` to quit watch mode.

### Writing tests

- Put test files next to the component they test and name them `ComponentName.test.jsx`, for example `src/components/Footer.test.jsx`.
- `describe`, `it`, and `expect` are available globally, so you do not need to import them.
- Matchers such as `toBeInTheDocument()` and `toHaveAttribute()` come from `@testing-library/jest-dom` and are loaded by `src/setupTests.js`.
- Wrap components that use `NavLink` or other router features in a `MemoryRouter` from `react-router`. See `Footer.test.jsx` for an example.
- Test settings live in the `test` section of `vite.config.js`.

## Troubleshooting

### `npm: command not found`

Make sure Node.js was installed inside WSL, then reload the shell:

```bash
source ~/.bashrc
nvm use --lts
```

### `npm ci` reports a lock-file error

Confirm you are in the frontend folder and that `package.json` and `package-lock.json` are present:

```bash
pwd
ls
```

If the project has no lock file yet, run `npm install` once and commit the generated `package-lock.json` so the team can use `npm ci`.

### Vite says the port is already in use

Use the alternate local address Vite prints, or stop the other development server with `Ctrl+C`.

## Team notes

- Use the Node.js version selected by `nvm` in WSL.
- Run frontend commands from the folder containing the frontend `package.json`.
- Commit `package-lock.json` when dependencies change.
- Run `npm run test:run` and `npm run lint` before opening a pull request.
- Do not commit `node_modules/`, `.env` files, API keys, or other secrets. The root `.gitignore` excludes dependencies, build output, and `.env` files; use `.env.example` to share variable names without values.
- Backend setup is separate; this guide covers the React frontend only.