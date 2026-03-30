# Beauty and Salon Management System

Full-stack database application for an academic Database Systems project.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Database: MySQL

## Project Structure

```text
/project
  /frontend
  /backend
  /database
  package.json
  README.md
```

## Implemented Features

- Admin login with session support
- Complete CRUD operations for:
  - `admin`
  - `user`
  - `categories`
  - `services`
  - `appointment`
  - `settings`
- Table-based record viewing
- Record navigation buttons:
  - First
  - Last
  - Next
  - Previous
- Search:
  - Users by name
  - Services by title/details
  - Appointments by date
- Bill generation:
  - Calculates bill from selected service prices
  - Displays service names, prices, and total amount
- Responsive dashboard and module pages
- Mocked screenshots for project submission

## Database Notes

The required tables from the prompt are fully included.

An extra support table, `appointment_items`, is also included so one appointment can contain multiple services while keeping invoice calculation normalized and accurate.

## Demo Credentials

- Email: `admin@beautyhub.com`
- Password: `admin123`

## Step-by-Step Run Instructions

1. Install MySQL and create a database user with permission to create databases.
2. Import the SQL file:

   ```sql
   SOURCE /absolute/path/to/database/beauty_salon_management.sql;
   ```

   Or from terminal:

   ```bash
   mysql -u root -p < database/beauty_salon_management.sql
   ```

3. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MySQL username and password.
5. Install Node.js dependencies:

   ```bash
   npm install
   ```

6. Start the project:

   ```bash
   npm run dev
   ```

   Or:

   ```bash
   npm start
   ```

7. Open the application in your browser:

   [http://localhost:3000](http://localhost:3000)

## Main Pages

- Login Page: `/index.html`
- Dashboard: `/dashboard.html`
- User Management: `/users.html`
- Services: `/services.html`
- Categories: `/categories.html`
- Appointment Booking: `/appointments.html`
- Billing: `/billing.html`
- Extra CRUD Pages:
  - `/admins.html`
  - `/settings.html`

## Backend API Overview

### Auth

- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

### CRUD Endpoints

- `GET /api/admins`
- `POST /api/admins`
- `PUT /api/admins/:id`
- `DELETE /api/admins/:id`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/settings`
- `POST /api/settings`
- `PUT /api/settings/:id`
- `DELETE /api/settings/:id`

### Navigation

- `GET /api/admins/navigate?direction=first`
- `GET /api/users/navigate?direction=next&currentId=1`
- `GET /api/categories/navigate?direction=previous&currentId=2`
- `GET /api/services/navigate?direction=last`
- `GET /api/appointments/navigate?direction=next&currentId=3`
- `GET /api/settings/navigate?direction=first`

### Billing

- `GET /api/appointments/:id/invoice`

## Validation and Presentation Notes

- Basic required-field validation is implemented on both frontend and backend.
- The UI is intentionally clean and easy to demonstrate in viva.
- Passwords are stored as plain text only for simple academic demonstration. In production, use hashing.

## Submission Checklist

- SQL file: [`database/beauty_salon_management.sql`](/Users/sohamdawn/Documents/DBS%20DA%202/database/beauty_salon_management.sql)
- Backend source: [`backend`](/Users/sohamdawn/Documents/DBS%20DA%202/backend)
- Frontend source: [`frontend`](/Users/sohamdawn/Documents/DBS%20DA%202/frontend)
- Mock screenshots: [`frontend/assets/screenshots`](/Users/sohamdawn/Documents/DBS%20DA%202/frontend/assets/screenshots)
