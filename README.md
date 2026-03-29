# Project Setup Guide

## Description

This is a backend project built with **NestJS**, using:

- **MongoDB**
- **Redis**
- **JWT authentication**

Below are the steps to run the project locally.

---

## Requirements

Before starting, make sure you have installed:

- **Node.js** 18+
- **npm**
- **MongoDB**
- **Redis**

---

## 1. Clone the repository

```bash
git clone https://github.com/dmitrygorbatikov/test-task-kit-global-llc-server.git
cd test-task-kit-global-llc-server
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Environment variables setup

Create a `.env` file in the root of the project.

Example:

```env
MONGO_DB_URL=
PORT=3000
JWT_SECRET=jwtSecret

REDIS_HOST=localhost
REDIS_PORT=6379
```

### Environment variables description

- `MONGO_DB_URL` — MongoDB connection string
- `PORT` — application port
- `JWT_SECRET` — secret key for JWT token generation
- `REDIS_HOST` — Redis host
- `REDIS_PORT` — Redis port

---

## 4. Run MongoDB

If MongoDB is installed locally, make sure the service is running.

Check with:

```bash
mongosh
```

If the connection is successful, MongoDB is running.

---

## 5. Run Redis

Make sure Redis is running locally.

Check with:

```bash
redis-cli ping
```

Expected response:

```bash
PONG
```

---

## 6. Run the project

### Development mode

```bash
npm run start:dev
```

### Standard mode

```bash
npm run start
```

### Production build

```bash
npm run build
npm run start:prod
```

---

## 7. Verify the application

After starting, the application will be available at:

```txt
http://localhost:3000/api
```

If Swagger is enabled, documentation is usually available at:

```txt
http://localhost:3000/docs
```

---

## 8. Run tests

### Unit tests

```bash
npm run test
```

### Watch mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:cov
```

---

## Common issues

### MongoDB connection error
Check:
- MongoDB is running
- `MONGO_DB_URL` is correct
- database is accessible

### Redis connection error
Check:
- Redis is running
- `REDIS_HOST` and `REDIS_PORT` are correct

### Port already in use
If port `3000` is already taken, change it:

```env
PORT=3001
```

---

## Useful commands

If you're using Linux and services are installed locally:

### MongoDB
```bash
sudo systemctl start mongod
```

### Redis
```bash
sudo systemctl start redis
```

Check status:

```bash
sudo systemctl status mongod
sudo systemctl status redis
```

---

## Summary

Minimal `.env` for running the project:

```env
MONGO_DB_URL=mongodb://localhost:27017/test-task-kit-global-llc
PORT=3000
JWT_SECRET=jwtSecret

REDIS_HOST=localhost
REDIS_PORT=6379
```

Then run:

```bash
npm install
npm run start:dev
```

If MongoDB and Redis are running, the project should start without issues.