# End-to-End Testing Guide

This guide walks through the full local setup for the employee directory so you can:

- start MongoDB locally
- seed departments and employees
- run the Next.js app
- verify the UI without browser-side API dependency
- verify the JSON APIs independently
- sanity check the production build

## 1. Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker Desktop or a local MongoDB installation

Check your versions:

```bash
node -v
npm -v
```

## 2. Start MongoDB Locally

### Option A: Docker Compose

From the project root:

```bash
docker compose up -d
```

This starts MongoDB on `mongodb://127.0.0.1:27017`.

### Option B: Existing Local MongoDB

If you already run MongoDB locally, make sure it is reachable and note the URI you want the app to use.

## 3. Create Local Environment Variables

Create `.env.local` from the example file:

```bash
cp .env.example .env.local
```

Expected variables:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=employee_directory
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Seed the Database

Seed reference departments and sample employees:

```bash
npm run seed
```

If you want to wipe existing seed data first:

```bash
RESET_DB=1 npm run seed
```

What the seed script does:

- upserts four departments
- upserts five employees
- preserves rerunnable local setup without duplicating rows

## 6. Start the App

### Development mode

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

### Production-like check

```bash
npm run build
npm run start
```

## 7. Manual UI Test Flow

### Home page

Open:

```bash
http://localhost:3000
```

Verify:

- the page loads with employee cards
- the department filter shows seeded departments
- the add employee form is visible without browser fetch calls
- the metrics card shows employee and department counts

### URL-driven department filter

Test these URLs:

```bash
http://localhost:3000/?dept=engineering
http://localhost:3000/?dept=operations
```

Verify:

- the page updates using the URL search param
- refresh keeps the filter state
- the filtered employee count changes correctly

### Unknown filter handling

Open:

```bash
http://localhost:3000/?dept=unknown-team
```

Verify:

- the page shows a warning banner
- no employees are rendered for that unknown filter
- the app does not widen back to the full list

### Invalid query handling

Open:

```bash
http://localhost:3000/?size=9999&salary_min=90000&salary_max=100
```

Verify:

- the page stays usable
- a warning banner explains that invalid params were sanitized
- the page falls back to safe defaults

### Add employee flow

Use the form on the home page to add an employee.

Suggested test payload:

- Name: `Sana Kapoor`
- Position: `QA Engineer`
- Salary: `76000`
- Department: `Engineering`

Verify:

- empty or invalid fields show inline validation errors
- submit succeeds when data is valid
- the success banner appears
- the employee list refreshes after the server action
- the new employee is visible without a full page reload

### Employee detail page

Open an employee card and verify:

- `/employee/[id]` renders correctly
- salary and department details are visible
- the department detail came through the backend `$lookup`

Also test:

```bash
http://localhost:3000/employee/not-a-valid-id
```

Verify:

- the app shows the not-found experience instead of crashing

## 8. API Verification Flow

Run these once the app is up.

### Health check

```bash
curl -s http://localhost:3000/api/v1/health | jq .
```

### Departments

```bash
curl -s "http://localhost:3000/api/v1/departments?include_employee_count=true&sort_by=name&sort_order=asc" | jq .
```

### Employees list

```bash
curl -s "http://localhost:3000/api/v1/employees?dept=engineering&expand=department&page=1&size=12" | jq .
```

### Employee detail

First capture an employee ID from the list response, then:

```bash
curl -s "http://localhost:3000/api/v1/employees/<EMPLOYEE_ID>" | jq .
```

### Create employee by API

First capture a real department ID from `GET /api/v1/departments`, then:

```bash
curl -s -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API User",
    "position": "Support Engineer",
    "salary": 72000,
    "department_id": "<DEPARTMENT_ID>"
  }' | jq .
```

Verify:

- the response is `201`
- the new employee appears on the home page after refresh

## 9. Build and Type Safety Checks

Run:

```bash
npm run typecheck
npm run build
```

Expected result:

- no TypeScript errors
- production build completes successfully

## 10. Troubleshooting

### `Missing MongoDB configuration`

Cause:

- `.env.local` is missing
- `MONGODB_URI` or `MONGODB_DB` is empty

Fix:

- create `.env.local`
- restart the dev server after updating env vars

### MongoDB connection refused

Cause:

- MongoDB is not running

Fix:

```bash
docker compose up -d
```

### Empty filter dropdown

Cause:

- departments were not seeded

Fix:

```bash
npm run seed
```

### API returns validation errors

Cause:

- invalid ObjectId values
- missing required JSON fields
- invalid salary ranges or page sizes

Fix:

- use a real department ObjectId from the departments API
- keep `size <= 100`
- keep `salary_min <= salary_max`
