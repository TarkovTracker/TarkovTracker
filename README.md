# TarkovTracker
This repository is for TarkovTracker, a web app for tracking your Escape From Tarkov tasks and hideout progress. It allows you to mark off tasks, objectives, and hideout upgrades as you complete them. You can see items needed for upgrades and tasks, as well as how close you are to needing them. Tasks are broken down into traders and maps, so you can prioritize them based on your goals and how you play. You can also join a team with your friends, and more easily plan out your raids together.

## Installation
The following are the steps to get the TarkovTracker project up and running in development.

### Prerequisites
* Node.js
* Java JRE (for Firebase Emulator)

### Setup
1. Clone the repository
2. Run `npm install` in the `tarkov-tracker` directory
3. Run `npm install` in the `functions` directory
4. Run `npm run dev` in the `tarkov-tracker` directory

# Project Structure
The project is split into two main parts: the SPA frontend built with Vue.js, and the API backend using Firebase Cloud Functions. The frontend is located in the `tarkov-tracker` directory, and the backend is located in the `functions` directory. The project can function without a backend, other than hosting, allowing for full use of the site outside of the team system or API for third-party apps. The web app can work normally using local storage without user authentication.