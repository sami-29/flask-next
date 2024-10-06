# Project Setup Guide

This guide will help you set up the project locally on your machine.

## 1. Clone the Repository

Start by cloning the repository to your local machine:

```bash
git clone <https://github.com/sami-29/flask-next.git>
```

## 2. Set Up the Python Environment

The project requires a Python virtual environment. Below are the setup instructions based on your operating system.

### For Windows:

1. Open your terminal (Command Prompt or PowerShell).
2. Run the following commands to create and activate a virtual environment and install dependencies:

```bash
python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
```

### For Mac/Linux:

1. Open your terminal.
2. Run the following commands to create and activate a virtual environment and install dependencies:

```bash
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

## 3. Run the Development Server

The project uses `npm run dev` to run both the Flask backend and the Next.js frontend concurrently.

1. Ensure that you have `npm` installed.
2. Run the following command to start both servers:

`npm run dev`

This will run both:

- `flask-dev`: Starts the Flask server on port `6000`.
- `next-dev`: Starts the Next.js frontend.

If the Python server refuses to start, it could be due to your system requiring the use of `python3` instead of `python`. To debug:

- On Mac/Linux, change `python` to `python3` in the command that starts Flask (inside `package.json`).
- On Windows, try adjusting the Python path in your environment variables or use `python3`.

## 4. Login Details

Once the server is running, you can log in using the following test accounts:

- **alice**, `password1`
- **bob**, `password2`
- **charlie**, `password3`

## 5. Issues

- **Login/Logout Issue**: After logging in or logging out, you may need to manually refresh the page to see the changes. This is because the current session management does not automatically update the frontend state after these actions. While this could be resolved with frontend improvements it hasn't been prioritized for this task.
