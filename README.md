# ChallengeMe

ChallengeMe is a social platform to create and share fitness challenges. The idea is simple: design challenges with specific activities (run 5 km, complete 50 push-ups, etc.), invite friends to join, and track progress together. It feels like a fitness-focused social network.

## What does this project do?

The application lets you build multi-activity challenges. Each activity has a goal (for instance, running 100 kilometers in a month) and you can log your progress day by day. You can also publish posts to celebrate wins or motivate others, follow fellow users to build a personalized feed, and discover new challenges and profiles.

The project is split into two parts: a backend that handles business logic and data (REST API with Node.js and MongoDB) and a frontend where users interact with the product (React with Vite). Everything is wired together and ready to run.

## Deployments

- Backend (Render): <https://challengeme-5cfg.onrender.com>
- Frontend (Netlify): <https://challengemee.netlify.app/>

## Core features

### Exercise challenges

You can craft challenges with multiple activities. Each activity needs a name, a numeric goal, and a unit (meters, kilometers, reps, minutes, etc.). For example, you might create a "March Marathon" challenge that includes a running goal of 100 kilometers and a push-up goal of 500 reps.

When you publish a challenge, you join it automatically. You can update each activity and check overall progress. Once every activity hits 100%, you can mark the challenge as completed.

### Posts and feed

Create posts to share progress or cheer on the community. Posts can include an optional title and text body, and you can react to posts from other users.

The Dashboard shows a personalized feed with posts and challenges from the people you follow, sorted from newest to oldest. You only see content from users you follow—never from strangers.

### Follow system

Follow other users to keep up with their activity. You can also see who follows you and identify contacts (people you follow who follow you back).

### Discover

The Discover page lists public posts and challenges. You can search for users by name or email, view their public profile, and decide whether to follow them.

### Profile and metrics

Your profile highlights followers (users who follow you), contacts (mutual followers), and the Your Content section, where you can review everything you have created with quick filters for posts and challenges.

You also get key stats such as completed challenges, active challenges, followers, contacts, and content created. The metrics area provides two visualizations to track your progress:

- A doughnut chart summarizing each activity type by percentage.
- A stacked bar chart that shows the accumulated effort per activity for the challenges you select.

Filters let you switch between week, month, and total time ranges, and you can show or hide specific activities. Activities are normalized using effort units tailored to each discipline, making it easy to compare metrics across both charts.

## How to use the app

### Create an account

On launch, sign up with your name, email, and password (minimum 6 characters).

### Sign in

After signing up, sign in with your email and password. Sessions are persisted so you do not need to log in every time.

### Create a challenge

From any page, click the create button (the + icon) and choose "Challenge". Fill in the form:

- Title
- Description
- Start and end dates
- Activities (you can add several)

Every activity requires a name, a goal, and a unit. When the challenge is created, you automatically join it.

### Update your progress

On the Dashboard you will see your active challenges. Click an activity to log progress—just enter a number and save.

### Create a post

Click the create button and pick "Post". Add an optional title and the content you want to share.

### Follow someone

Use the Discover page to find users by typing the first letters of their name or email; the list updates in real time. Follow them to add their posts and challenges to your feed.

### Discover content

In Discover you can browse:

- All: every public post and challenge, newest first
- Challenges: only public challenges
- Posts: only public posts
- People: user search

When something catches your eye, click "Join Challenge" to participate.

### View your profile

Your profile page includes quick links to:

- Contacts: mutual followers
- Followers: people who follow you
- Your Content: posts and challenges you created
- Metrics: your activity charts

## Test users

Three demo accounts are available:

- **John Doe** – <john@mail.com>
- **David O'Connell** – <david@mail.com>
- **Lenny** – <lenny@mail.com>

Passwords:

- John Doe and Lenny: **abc123**
- David: **qbc123**

Feel free to explore with these accounts—John and David already have populated content, while Lenny is perfect for testing fresh flows.

## API documentation

The API is fully documented with Swagger. Open the interactive documentation at:

```text
<https://challengeme-5cfg.onrender.com/api-docs>
```

There you will find every endpoint, request/response schema, and can run live calls from your browser. Covered areas include:

- Authentication (sign up and sign in)
- Users (profile and search)
- Challenges (create, list, join)
- Posts (create, like, comment)
- Follow system (follow, unfollow, list followers)
- Challenge progress (log progress, update status)

Every endpoint includes sample payloads and response codes.

## Technical stack

### Frontend

- React 19 with Vite for fast development
- React Router for navigation
- Responsive, mobile-first UI
- Dark theme powered by CSS variables
- Chart.js for the metrics visualizations
- Integrated JWT authentication

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Swagger-driven API docs
- Comprehensive testing setup

### Design guidelines

The interface follows a modern dark theme. Colors rely on shared CSS variables for consistency, components are reusable, and layouts adapt gracefully from mobile to desktop.

## Installation and development

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file with:

```ini
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

To reuse the shared database you can use:

```ini
PORT=3000
MONGODB_URI=mongodb+srv://raulsaavedrariera_db_user:Xa3IxvlbwC8bGFMc@cluster0.bl3cyfs.mongodb.net/challengeme?appName=Cluster0
JWT_SECRET=a_secret_secret_password
```

Then start the server:

```bash
npm start
```

The API runs at `http://localhost:3000`.

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file with:

```ini
VITE_API_URL=https://challengeme-5cfg.onrender.com
```

Leave it empty for local development—the Vite proxy will handle API calls.

Finally, start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Documentation note

Swagger docs and part of the written documentation were produced with help from language models such as ChatGPT and Gemini, always reviewed and supervised by me to ensure accuracy and clarity.
