# Assignment 3

**Assignment due at 11:59pm on Monday 5/17/2021**<br/>
**Demo due by 11:59pm on Monday 5/31/2021**

The goal of this assignment is to incorporate authorization and authentication into our businesses API.  There are a few parts to this assignment, as described below.

You are provided some starter code in this repository that implements a MySQL-based solution to assignment 2.  The starter code's API server is implemented in `server.js`, individual routes are modularized within the `api/` directory, and models for different resources are implemented in the `models/` directory.  Postman tests for the API are included in the `tests/` directory.  In addition, there is a Docker Compose specification for the assignment, including a database initialization script in `db-init/`.   This code should run out of the box with Docker Compose (it will use the environment variable values specified in the file `.env` by default), and all of the included API tests should pass.  There is also an OpenAPI specification in `public/openapi.yaml` that describes the endpoints and resources associated with this API, including the new endpoints you'll have to implement for this assignment.

Feel free to use this code as your starting point for this assignment.  You may also use your own solution to assignment 2 as your starting point if you like, or you may convert the existing solution to use MongoDB.  If you do either of those things, you must ensure that your API implementation matches the specification described in `public/openapi.yaml`.

## 1. Implement an API endpoint for creating new users

Your first task for this assignment is to implement an API endpoint to enable the creation and storage of application users.  Specifically, you should create a `POST /users` API endpoint through which new users can register.  When a user registers, they should provide their name, email address, and password, and you should salt and hash the password on the server before storing it.

The DB initialization file in `db-init/` already creates a `users` table in which to store information about application users.  This table has the following columns, which correspond to the information you must store about the user:
  * `id` - User's integer ID (this is an `AUTO_INCREMENT` column)
  * `name` - User's full name
  * `email` - User's email address (which must be unique among all users)
  * `password` - User's hashed/salted password
  * `admin` - A boolean flag indicating whether the user has administrative permissions (`false` by default)

## 2. Enable JWT-based user logins and implement a user data access endpoint

Once you have enabled user registration for your application, implement a new `POST /users/login` API endpoint that allows a registered user to log in by sending their email address and password.  If the email/password combination is valid, you should respond with a JWT token, which the user can then send with future requests to authenticate themselves.  The JWT token payload should contain the user's ID (with which you should be able to fetch details about the user from the database) and any other information needed to implement the features described in this assignment, and it should expire after 24 hours.

If a user attempts to log in with an invalid username or password, you should respond with a 401 error.

In addition, you should create a `GET /users/{userId}` API endpoint that returns information about the specified user (excluding their password).

Importantly, note that the DB init script in `db-init/` creates several users with passwords that are pre-hashed/salted.  The plaintext password for all of these users is `hunter2`.

## 3. Require authorization to perform certain API actions

Once users can log in, modify your API so that it requires clients to authenticate users to implement the following authorization scheme:
  * Only an authorized user can see their own user data and their own lists of businesses, reviews, and photos.  In other words, the following API endpoints should verify that the `userId` specified in the URL path matches the ID of the logged-in user (as indicated by a valid JWT provided by the client):
    * `GET /users/{userId}`
    * `GET /users/{userId}/businesses`
    * `GET /users/{userId}/photos`
    * `GET /users/{userId}/reviews`

  * Only an authorized user can create new businesses, reviews, and photos.  In other words, the following API endpoints must ensure that a user is logged in and that the user ID specified in the POST request body matches the ID of the logged-in user:
    * `POST /businesses`
    * `POST /photos`
    * `POST /reviews`

  * Only an authorized user can modify or delete their own businesses, reviews, and photos.  In other words, the following API endpoints must ensure that a user is logged in and that the user ID for the entity being modified/deleted matches the ID of the logged-in user:
    * `PUT /businesses`, `DELETE /businesses`
    * `PUT /photos`, `DELETE /photos`
    * `PUT /reviews`, `DELETE /reviews`

  * A user with `admin` permissions may perform any action, including creating content or fetching/modifying/deleting the content of any user.

  * Only a user with `admin` permissions may create other `admin` users.
    * Note that there is currently one admin user specified in the DB init script in `db-init/`.  They have email address `admin@businesses.com` and password `hunter2`.

All authorized endpoints should respond with an error if the logged-in user is not authorized or if no user is logged in (i.e. no JWT is provided).

## Extra credit: rate limiting

For 10 points of extra credit, you can implement a rate-limiting scheme that works as follows:

  * Requests that do not come from an authenticated user are rate-limited on a per-IP address basis.  These unauthenticated requests can be made at a rate of 5 requests per minute.

  * Requests that come from an authenticated user are rate-limited on a per-user basis.  These authenticated requests can be made at a rate of 10 requests per minute.

This rate-limiting scheme should be backed by a Redis cache that runs in a Docker container.  A full specification for the Redis cache should be added to `docker-compose.yml` so the entire application can still be launched from scratch using Docker Compose.

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the main branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the main branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp21/assignment-3-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

  * 30 points: API allows the creation of new users via a `POST /users` endpoint

  * 25 points: API allows users to log in via a `POST /users/login` endpoint

  * 5 points: API has a `GET /users/{userId}` endpoint that returns appropriate data

  * 40 points: API endpoints are authenticated as described above

In addition, you can earn 10 points of extra credit as described above.
