# Next.js Frontend demo ▲

## Introduction

This repository is a demo project to learn Next.js.

## Installation

First, install and configure the backend with the instructions in https://github.com/pniaps/next-back.git.

Next, clone this repository and install its dependencies with `yarn install` or `npm install`. Then, create the file `.env` and supply the URL of your backend:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

Finally, run the application via `npm run dev`. The application will be available at `http://localhost:5000`:

```bash
# Start development environment
npm run dev
```

## What's included

With this demo you can register and log in. Once logged in, there are three different sections:

- A dashboard with metrics about the number of registered users. These metrics are updated periodically and there is a button to call the backend and regenerate users.
- A list of users
- A profile where you cand update your details, change password or delete you account.

We are using stateful authentication (with sessions) for this demo because of it's simplicity. It only relies on a session cookie to identify the user, which cannot be stolen through an XSS attack. We could use other authentication methods like JWT for example.

We are also using CORS and CSRF protection to improve security.
