# TarkovTracker
TarkovTracker is a progress tracker meant to help players of Escape From Tarkov. The core goal of the project is to provide insights into what to do next, and make it easier to work with friends as you progress to Epsilon, Kappa, Trader loyalty levels, or a maxed out hideout.

[API Documentation](https://tarkovtracker.github.io/TarkovTracker/)

## Data Management
Tarkov Tracker has some prebuilt data baked in. This is the quest and hideout data encoded in JSON. The `questData.json` and `hideoutData.json` files are deployed with the application, and imported at runtime for reference. These files are a git submodule of the https://github.com/TarkovTracker/tarkovdata repository. Structural changes to these files may break TarkovTracker, so for now this data will be manually pulled to newer versions to verify data integrity.

## Environment Management
### Prerequisites
- [Node v14 (LTS)](https://nodejs.org/en/download/) or higher
- [Firebase Tools](https://www.npmjs.com/package/firebase-tools) (npm package installed globally)

### Setting up Google Cloud Platform and Firebase project
- [Google Cloud Platform project](https://console.cloud.google.com/)
- [Google Firebase project](https://firebase.google.com/)

It is necessary to create Google Cloud Platform project and Firebase project to be able to run **local Firebase emulator**. The reason is
simply because the Firebase CLI tool authenticates you against Google servers. Nothing will actually be deployed or used within your 
Google Cloud Platform project, you will not be charged, but it is a necessary step to run and develop this project locally.

1) Create a project within [Google Cloud Platform](https://console.cloud.google.com/) (e.g. 'tarkov-tracker')
2) Create a project within [Google Firebase](https://firebase.google.com/) and link it to your Google Cloud Platform. It should prompt you automatically. 

### Setting up the environment
First time setup can be done by running the following:
1) `git clone` the repository
2) `git submodule init` to set up the TarkovData submodule (required)
3) `git submodule update` pulls the pinned commit for the submodule (required)
4) `npm install` inside the repository to install all the dependencies
5) `firebase login` will open your browser and ask you to login to your Google account associated with your Google Cloud Platform project and your Firebase project
6) `firebase use --add` and select the project you created earlier (it should offer you only that one) - if you don't see any projects in the list, make sure you've 
   done all the steps in previous section properly

If you work on anything that utilizes the Firebase Cloud Functions, you will also need to run `npm install` inside the `functions` folder.

Now you can run the project locally!

### Running local environment for testing/development
`npm run serve` results in `localhost:5000` for Web APP, and `localhost:4000` for emulator UI

You can modify the serve command and run as `npm run serve:persist` to keep Firebase emulator data across multiple sessions of the emulator. Otherwise, the firestore database and authentication will be reset each emulator session.

Access the local environment at http://localhost:5000 by default. This project is built to be hosted via Google Firebase. The Firebase Emulator will be installed via npm when setting up the project. Included is a hosting, database, authentication, and function emulator. The emulator console is available at http://localhost:4000 by default. These resources cost money to run on the production version of TarkovTracker. Thankfully to Patrons, this is covered, and isn't a blocker to new features utilizing them, but please be aware of the scale of potential resource use of new features!
