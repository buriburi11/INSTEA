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

## 4.