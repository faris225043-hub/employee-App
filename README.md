# Assignment 3 — Employee App Backend Integration

## Setup
1. Install Node.js (LTS) and MongoDB Atlas access.
2. In this folder run: `npm install`
3. Set the `MONGODB_URI` environment variable to your MongoDB Atlas connection string.
   - PowerShell: `$env:MONGODB_URI="mongodb+srv://..."`
   - macOS/Linux: `export MONGODB_URI="mongodb+srv://..."`
4. Start the server with `npm start`.
5. Open `http://localhost:3000`.

Do not commit your MongoDB credentials to GitHub. In Atlas, ensure your database user has the needed permissions and your current IP is allowed in Network Access.

## API routes
- `GET /api/employeelist` — list employees
- `GET /api/employeelist/:id` — get one employee
- `POST /api/employeelist` — create employee (`name`, `location`, `position`, `salary`)
- `PUT /api/employeelist` — update employee; request body must include `_id` (or `id`) and any fields to update
- `DELETE /api/employeelist/:id` — delete employee
