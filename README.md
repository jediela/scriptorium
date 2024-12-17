## Scriptorium
A platform to write, execute, and share code with features like blogs, comments, and voting.

## Technologies Used
- Next.js (API routes and server-side rendering)
- Prisma (ORM with SQLite)
- React (Frontend UI)
- TailwindCSS (Styling)
- JWT & bcrypt (Authentication and password security)
- Docker (Isolated code execution, environments for compiling and running user-submitted code)
  
## API Endpoints
To explore and test the API endpoints, download and import the provided Postman collection:

[Download Postman Collection](./postman.json)

## Setup and Run Instructions
To set up and run the project, startup Docker and use the provided scripts:
1. Run the startup.sh script to install dependencies and set up the database

    [./startup.sh](./startup.sh)
   
2. Use the run.sh script to start the development server:

   [./run.sh](./run.sh)

Open the application in your browser: http://localhost:3000.
