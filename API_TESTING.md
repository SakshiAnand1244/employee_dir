# API Testing Guide

Base URL for local testing:

```bash
http://localhost:3000
```

These APIs are exposed by the Next.js app itself under `/api/v1`.

Before testing:

```bash
cp .env.example .env.local
docker compose up -d
npm install
npm run seed
npm run dev
```

## 1. Health Check

### `GET /api/v1/health`

```bash
curl -s http://localhost:3000/api/v1/health | jq .
```

Expected response:

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "service": "employee-directory",
    "mongodb": "ok"
  }
}
```

## 2. Departments API

### `GET /api/v1/departments`

Purpose:

- populate the department dropdown
- support search and sorting
- optionally show department counts in the UI

Recommended query params:

| Param | Type | Default | Use |
|---|---|---|---|
| `page` | int | `1` | pagination |
| `size` | int | `10` | page size |
| `search` | string | empty | case-insensitive search on department name |
| `floor` | string/int | empty | filter by floor |
| `sort_by` | string | `name` | `name`, `floor`, `created_at` |
| `sort_order` | string | `asc` | `asc` or `desc` |
| `include_employee_count` | bool | `false` | useful for filter chips / badges |

Example:

```bash
curl -s "http://localhost:3000/api/v1/departments?search=eng&sort_by=name&sort_order=asc&include_employee_count=true" | jq .
```

Example response:

```json
{
  "success": true,
  "message": "Departments fetched successfully",
  "data": [
    {
      "id": "66f0...",
      "name": "Engineering",
      "floor": 4,
      "employee_count": 12
    }
  ],
  "meta": {
    "page": 1,
    "size": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

## 3. Employees API

### `GET /api/v1/employees`

Purpose:

- load the employee list
- filter by department
- support search and salary-based slicing
- keep the endpoint flexible for frontend and manual testing

Recommended query params:

| Param | Type | Default | Use |
|---|---|---|---|
| `page` | int | `1` | pagination |
| `size` | int | `12` | page size |
| `search` | string | empty | search by `name` or `position` |
| `department_id` | string | empty | filter by department ObjectId |
| `dept` | string | empty | filter by department slug or department ObjectId |
| `salary_min` | number | empty | minimum salary |
| `salary_max` | number | empty | maximum salary |
| `sort_by` | string | `name` | `name`, `position`, `salary`, `created_at` |
| `sort_order` | string | `asc` | `asc` or `desc` |
| `expand` | string | empty | `department` returns nested department summary |

Example:

```bash
curl -s "http://localhost:3000/api/v1/employees?search=an&dept=engineering&salary_min=50000&sort_by=salary&sort_order=desc&page=1&size=12&expand=department" | jq .
```

Example response:

```json
{
  "success": true,
  "message": "Employees fetched successfully",
  "data": [
    {
      "id": "66f1...",
      "name": "Ananya Sharma",
      "position": "Senior Engineer",
      "salary": 125000,
      "department_id": "66f0...",
      "department": {
        "id": "66f0...",
        "name": "Engineering",
        "floor": 4
      }
    }
  ],
  "meta": {
    "page": 1,
    "size": 12,
    "total": 1,
    "total_pages": 1
  }
}
```

### `GET /api/v1/employees/:id`

Purpose:

- load a single employee
- return nested department details
- used by the detail page `/employee/[id]`

Example:

```bash
curl -s "http://localhost:3000/api/v1/employees/66f1abc123" | jq .
```

Example response:

```json
{
  "success": true,
  "message": "Employee fetched successfully",
  "data": {
    "id": "66f1...",
    "name": "Ananya Sharma",
    "position": "Senior Engineer",
    "salary": 125000,
    "department": {
      "id": "66f0...",
      "name": "Engineering",
      "floor": 4
    }
  }
}
```

### `POST /api/v1/employees`

Purpose:

- create a new employee
- same service layer is also used by the Server Action form

Request body:

```json
{
  "name": "Ananya Sharma",
  "position": "Senior Engineer",
  "salary": 125000,
  "department_id": "66f0abc123"
}
```

Example:

```bash
curl -s -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ananya Sharma",
    "position": "Senior Engineer",
    "salary": 125000,
    "department_id": "66f0abc123"
  }' | jq .
```

Example response:

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": "66f2...",
    "name": "Ananya Sharma",
    "position": "Senior Engineer",
    "salary": 125000,
    "department_id": "66f0abc123"
  }
}
```

## 4. Frontend Page Behavior

These are not separate browser APIs, but they matter for testing the UX.

### Home page `/`

Test cases:

1. Open `/` with no query params and confirm the employee list loads.
2. Change the department filter and confirm the URL updates to something like `/?dept=engineering`.
3. Refresh the page and confirm the same filter state remains.

### Detail page `/employee/[id]`

Test cases:

1. Open a valid employee ID and confirm the department is nested in the response.
2. Open an invalid employee ID and confirm the `not-found.tsx` state appears.
3. Confirm `loading.tsx` shows while the server component is resolving.

## 5. Validation Errors

Typical invalid request cases:

### Missing fields

```bash
curl -s -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

Expected behavior:

- `400 Bad Request`
- structured validation error

### Unsupported content type

```bash
curl -s -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: text/plain" \
  -d 'hello' | jq .
```

Expected behavior:

- `415 Unsupported Media Type`
- clear error message telling you to send JSON

### Invalid salary

```bash
curl -s -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "position": "Intern",
    "salary": -1,
    "department_id": "66f0abc123"
  }' | jq .
```

Expected behavior:

- `400 Bad Request`
- salary validation message

### Invalid department

```bash
curl -s -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "position": "Intern",
    "salary": 50000,
    "department_id": "does-not-exist"
  }' | jq .
```

Expected behavior:

- `404 Not Found` or a clear domain error if the department cannot be resolved

## 6. Suggested Test Order

1. Start MongoDB.
2. Seed a few departments.
3. Seed a few employees.
4. Verify `GET /api/v1/departments`.
5. Verify `GET /api/v1/employees`.
6. Verify `GET /api/v1/employees/:id`.
7. Verify `POST /api/v1/employees`.
8. Open the UI and confirm the list refreshes after create.
