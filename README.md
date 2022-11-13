# TarkovTrackerNext
This repository is for the next major version of TarkovTracker (currently working on version 3).

## Version 3
The next version of TarkovTracker will be a complete rebuild of the SPA from scratch. There are a few reasons for the complete rebuild.
* Vue 2 -> Vue 3 upgrade
* Vuetify 2 -> Vuetify 3 upgrade
* Webpack -> Vite migration
* Vuex -> Pinia migration
* i18n Implementation
* Reorganization of components

The original TarkovTracker was built primarily without any previous knowledge of JS at all, including best practices or experience organizing larger Vue projects. There have been a lot of things learned as new features have been added. Version 3's goal is to set TarkovTracker up for another couple years of additional updates and improvements.

## Installation
The following are the steps to get the TarkovTracker Next project up and running in development.

### Prerequisites
* Node.js
* Java JRE (for Firebase Emulator)

### Setup
1. Clone the repository
2. Run `npm install` in the `tarkov-tracker` directory
3. Run `npm install` in the `functions` directory
4. Run `npm run dev` in the `tarkov-tracker` directory