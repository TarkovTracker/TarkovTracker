// eslint-disable-next-line no-unused-vars
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Export the v2 API
exports.apiv2 = require("./api/v2/index.js");

// Create an API token for the user
// This is a Firebase callable function (not part of the REST API)
exports.createToken = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  functions.logger.log("Starting create token", {
    data: data,
    owner: context.auth.uid,
  });

  if (data.note == null || !(data.permissions.length > 0)) {
    return { error: "Invalid token parameters" };
  }

  const systemRef = db.collection("system").doc(context.auth.uid);
  const systemDoc = await systemRef.get();
  // If the system document doesn't exist, create it
  if (!systemDoc.exists) {
    await systemRef.set({
      tokens: [],
    });
  }

  if (systemDoc?.data()?.tokens?.length >= 5) {
    // We have too many tokens already
    return { error: "You have the maximum number of tokens" };
  }

  // Generate a random token
  const UIDGenerator = require("uid-generator");
  const uidgen = new UIDGenerator(128);
  const token = await uidgen.generate();
  const tokenRef = db.collection("token").doc(token);
  // Run a transaction to create the token and add it to the system document
  try {
    await db.runTransaction(async (transaction) => {
      // Ensure the token doesn't already exist
      const tokenDoc = await transaction.get(tokenRef);
      if (tokenDoc.exists) {
        functions.logger.error("Token already existed", {
          owner: context.auth.uid,
          token: token,
        });
        // The user won the losing 2^128 lottery
        throw new Error("Tried to create a token that already existed");
      }
      transaction.set(tokenRef, {
        owner: context.auth.uid,
        note: data.note,
        permissions: data.permissions,
        token: token,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(systemRef, {
        tokens: admin.firestore.FieldValue.arrayUnion(token),
      });
    });
    functions.logger.log("Created token", {
      owner: context.auth.uid,
      token: token,
    });
    return { token: token };
  } catch (e) {
    functions.logger.error("Failed to create token", {
      owner: context.auth.uid,
      token: token,
      error: e,
    });
    return {
      error: "Error during token creation transaction",
      timestamp: Date.now(),
    };
  }
});

// Remove an API token for the user
// This is a Firebase callable function (not part of the REST API)
exports.revokeToken = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  if (data.token == null) {
    functions.logger.error("No token specified", { owner: context.auth.uid });
    return { error: "Invalid token parameters", timestamp: Date.now() };
  }

  const systemRef = db.collection("system").doc(context.auth.uid);
  const tokenRef = db.collection("token").doc(data.token);

  // Run a transaction to remove the token from the system document and delete the token document
  try {
    await db.runTransaction(async (transaction) => {
      // Ensure the token doesn't already exist
      const tokenDoc = await transaction.get(tokenRef);
      const systemDoc = await transaction.get(systemRef);
      // If tokenDoc or systemDoc doesn't exist, there's something wrong
      if (!tokenDoc.exists || !systemDoc.exists) {
        functions.logger.error("Token or system document doesn't exist", {
          owner: context.auth.uid,
          token: data.token,
          tokenDoc: tokenDoc.exists,
          systemDoc: systemDoc.exists,
        });
        throw new Error("Token or system document doesn't exist");
      }
      // If the token doesn't belong to the user, there's something wrong
      if (tokenDoc.data().owner != context.auth.uid) {
        throw new Error("Token doesn't belong to user");
      }

      // Assuming everything is fine, remove the token from the system document and delete the token document
      transaction.update(systemRef, {
        tokens: admin.firestore.FieldValue.arrayRemove(data.token),
      });
      transaction.delete(tokenRef);
    });
    functions.logger.log("Removed token", {
      owner: context.auth.uid,
      token: data.token,
    });
    return { revoked: true };
  } catch (e) {
    functions.logger.error("Failed to create token", {
      owner: context.auth.uid,
      token: data.token,
      error: e,
    });
    return { error: "Error during token deletion", timestamp: Date.now() };
  }
});

exports.leaveTeam = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      const systemRef = db.collection("system").doc(context.auth.uid);
      const systemDoc = await transaction.get(systemRef);
      const originalTeam = systemDoc?.data()?.team;
      if (systemDoc?.data()?.team) {
        // We are in a team, time to get out
        const teamRef = db.collection("team").doc(systemDoc.data().team);
        const teamDoc = await transaction.get(teamRef);
        if (teamDoc?.data()?.owner == context.auth.uid) {
          // We are the room owner, which means we need to disband the team
          // For each member, remove the team from their system document and then delete the team document
          teamDoc.data()?.members.forEach((member) => {
            functions.logger.log("Removing team from member", {
              member: member,
              team: originalTeam,
            });
            transaction.set(
              db.collection("system").doc(member),
              {
                team: null,
                lastLeftTeam: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          });

          transaction.delete(teamRef);
        } else {
          // We are not the room owner, remove ourself from the team
          transaction.set(
            teamRef,
            {
              members: admin.firestore.FieldValue.arrayRemove(context.auth.uid),
            },
            { merge: true }
          );
          transaction.set(
            systemRef,
            {
              team: null,
              lastLeftTeam: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }
      } else {
        // We are not in a team, oops
        throw new Error("User is not in a team");
      }
      functions.logger.log("Left team", {
        user: context.auth.uid,
        team: originalTeam,
      });
    });
    functions.logger.log("Finished leave team", { user: context.auth.uid });
    return { left: true };
  } catch (e) {
    functions.logger.error("Failed to leave team", {
      owner: context.auth.uid,
      error: e,
    });
    return { error: "Error during team leave", timestamp: Date.now() };
  }
});

function difference(setA, setB) {
  let _difference = new Set(setA);
  for (let elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

exports.joinTeam = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      const systemRef = db.collection("system").doc(context.auth.uid);
      const systemDoc = await transaction.get(systemRef);

      if (systemDoc?.data()?.team) {
        // We are already in a team, oops
        throw new Error("User is already in a team");
      }

      const teamRef = db.collection("team").doc(data.id);
      const teamDoc = await transaction.get(teamRef);

      if (!teamDoc?.exists) {
        // Team doesn't exist, oops
        throw new Error("Team doesn't exist");
      }

      if (teamDoc?.data()?.password != data.password) {
        // Wrong password, oops
        throw new Error("Wrong password");
      }

      if (teamDoc?.data()?.members.length >= 10) {
        // Team is full, oops
        throw new Error("Team is full");
      }
      // Add the user to the team
      transaction.set(
        teamRef,
        {
          members: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
        },
        { merge: true }
      );
      transaction.set(
        systemRef,
        {
          team: data.id,
        },
        { merge: true }
      );
    });
    functions.logger.log("Joined team", {
      user: context.auth.uid,
      team: data.id,
    });
    return { joined: true };
  } catch (e) {
    functions.logger.error("Failed to join team", {
      user: context.auth.uid,
      team: data.id,
      error: e,
    });
    return { error: "Error during team join", timestamp: Date.now() };
  }
});

exports.createTeam = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();
  const systemRef = db.collection("system").doc(context.auth.uid);
  const myTeamRef = db.collection("team").doc(context.auth.uid);

  functions.logger.log("Creating team", { owner: context.auth.uid });

  try {
    await db.runTransaction(async (transaction) => {
      const systemDoc = await transaction.get(systemRef);

      // Check if the user is already in a team
      if (systemDoc?.data()?.team) {
        throw new Error("User already in a team");
      }

      // Check if the user's team document exists, if it does, we can't create a team
      const myTeamDoc = await transaction.get(myTeamRef);
      if (myTeamDoc.exists) {
        throw new Error("Team already exists");
      }

      // Generate a random password
      const UIDGenerator = require("uid-generator");
      const uidgen = new UIDGenerator(64);
      const password = await uidgen.generate();

      // Create the team document
      transaction.set(myTeamRef, {
        owner: context.auth.uid,
        password: password,
        maximumMembers: systemDoc.data()?.teamMax || 10,
        members: [context.auth.uid],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Set our team to our own team
      transaction.set(
        systemRef,
        {
          team: context.auth.uid,
        },
        { merge: true }
      );
    });
    functions.logger.info("Created team", { owner: context.auth.uid });
    return { team: context.auth.uid };
  } catch (e) {
    functions.logger.error("Failed to create team", {
      owner: context.auth.uid,
      error: e,
    });
    return { error: "Error during team creation", timestamp: Date.now() };
  }
});

exports.kickTeamMember = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      const teamRef = db.collection("team").doc(context.auth.uid);
      const teamDoc = await transaction.get(teamRef);

      const kickedRef = db.collection("system").doc(data.kicked);
      const kickedDoc = await transaction.get(kickedRef);

      if (!teamDoc?.exists) {
        // Team doesn't exist, oops
        throw new Error("Team doesn't exist");
      }

      if (teamDoc?.data()?.owner != context.auth.uid) {
        // We are not the room owner, oops
        throw new Error("User is not the owner of the team");
      }

      if (!kickedDoc?.exists) {
        // Kicked user doesn't exist, oops
        throw new Error("Kicked user doesn't exist");
      }

      if (kickedDoc?.data()?.team != context.auth.uid) {
        // Kicked user is not in our team, oops
        throw new Error("Kicked user is not in our team");
      }

      // Remove the user from the team
      transaction.set(
        teamRef,
        {
          members: admin.firestore.FieldValue.arrayRemove(data.kicked),
        },
        { merge: true }
      );
      transaction.set(
        kickedRef,
        {
          team: null,
          lastLeftTeam: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
    functions.logger.log("Kicked team member", {
      user: context.auth.uid,
      kicked: data.kicked,
    });
    return { kicked: true };
  } catch (e) {
    functions.logger.error("Failed to kick team member", {
      owner: context.auth.uid,
      kicked: data.kicked,
      error: e,
    });
    return { error: "Error during team kick", timestamp: Date.now() };
  }
});

exports.updateTarkovdata = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async (context) => {
    await retrieveTarkovdata();
    return null;
  });

// Using the scheduled function does not play nice with the emulators, so we use this instead to call it during local development
// This should be commented out when deploying to production
exports.updateTarkovdataHTTPS = functions.https.onRequest(async (request, response) => {
  await retrieveTarkovdata();
  response.status(200).send('OK');
});

async function retrieveTarkovdata() {
  console.log("Retrieving tarkovdata");
  // Import the tarkovdata hideout query
  //const hideoutQuery = require('./tarkovdata/hideoutQuery.js')

  const { request, gql } = require("graphql-request");
  const db = admin.firestore();

  // Requiring this from another file causes problems, so unfortunately we need to stick it here
  const hideoutQuery = gql`
    query TarkovDataHideout {
      hideoutStations {
        id
        levels {
          id
          level
          itemRequirements {
            id
            item {
              id
            }
            count
          }
        }
      }
    }
  `;

  try {
    const results = await request(
      "https://api.tarkov.dev/graphql",
      hideoutQuery,
      {},
      { "User-Agent": "tarkov-tracker-functions" }
    );
    functions.logger.debug(
      "Successfully pulled hideout data from tarkov.dev",
      results
    );

    const hideoutRef = db.collection("tarkovdata").doc("hideout");
    await hideoutRef.set(results);
  } catch (e) {
    functions.logger.error(
      "Error while pulling hideout data from tarkov.dev:",
      e
    );
  }

  // Next, retrieve the tarkovdata tasks
  const tasksQuery = gql`
    query TarkovDataTasks {
      tasks {
        id
        tarkovDataId
        name
        trader {
          id
        }
        map {
          id
        }
        experience
        minPlayerLevel
        taskRequirements {
          task {
            id
          }
          status
        }
        traderLevelRequirements {
          trader {
            id
          }
          level
        }
        objectives {
          id
          type
          optional
        }
        factionName
      }
    }
  `;

  try {
    let results = await request(
      "https://api.tarkov.dev/graphql",
      tasksQuery,
      {},
      { "User-Agent": "tarkov-tracker-functions" }
    );
    functions.logger.debug(
      "Successfully pulled tasks data from tarkov.dev",
      results
    );

    // Next, retrieve https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/task_alternatives.json and store it in the database
    const taskAlternatives = await fetch(
      "https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/task_alternatives.json"
    ).then((res) => res.json());

    functions.logger.debug(
      "Successfully pulled task alternatives from tarkovdata repo",
      taskAlternatives
    );
    // For each taskAlternative, find it in the tasks data and update it to include the alternatives
    Object.entries(taskAlternatives).forEach(([taskId, alternatives]) => {
      // Find the task in the tasks data and update the alternatives property
      // Get the index of the task in the tasks array
      const taskToUpdate = results.tasks.find((task) => task.id == taskId);
      if (taskToUpdate) {
        taskToUpdate.alternatives = alternatives;
      } else {
        functions.logger.debug("Task not found in tasks data", {
          taskId: taskId,
          alternatives: alternatives,
        });
      }
    });

    const tasksRef = db.collection("tarkovdata").doc("tasks");
    await tasksRef.set(results);
  } catch (e) {
    functions.logger.error(
      "Error while pulling tasks data from tarkov.dev:",
      e
    );
  }
}
