const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Express App and allow all origins
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Keep taskData and hideoutData in memory for faster access
let globalTaskData;
let globalHideoutData;

// Check if taskData is already defined, if not, get it
// Return the taskData
const getTaskData = async () => {
  if (globalTaskData == null) {
    const db = admin.firestore();
    const taskRef = db.collection("tarkovdata").doc("tasks");
    const taskDoc = await taskRef.get();
    if (taskDoc.exists) {
      globalTaskData = taskDoc.data();
      return globalTaskData;
    } else {
      functions.logger.error("Error getting taskData", {
        taskData: taskDoc.data(),
      });
      return null;
    }
  } else {
    return globalTaskData;
  }
};

// Check if hideoutData is already defined, if not, get it
// Return the hideoutData
const getHideoutData = async () => {
  if (globalHideoutData == null) {
    const db = admin.firestore();
    const hideoutRef = db.collection("tarkovdata").doc("hideout");
    const hideoutDoc = await hideoutRef.get();
    if (hideoutDoc.exists) {
      globalHideoutData = hideoutDoc.data();
      return globalHideoutData;
    } else {
      functions.logger.error("Error getting hideoutData", {
        hideoutData: hideoutDoc.data(),
      });
      return null;
    }
  } else {
    return globalHideoutData;
  }
};

// Middleware for checking validity and access of tokens
const verifyBearer = async (req, res, next) => {
  const db = admin.firestore();

  const authHeader = req.get("Authorization");

  // If no auth, 401
  if (authHeader == null) {
    res.status(401).json({ error: "No Authorization header sent" }).send();
  }

  try {
    // If auth broken, 400
    if (authHeader.split(" ")[1] == null) {
      res.status(400).json({ error: "No bearer token set" }).send();
    }

    let authToken = authHeader.split(" ")[1];

    // Check if token is valid
    const tokenRef = db.collection("token").doc(authToken);
    const tokenDoc = await tokenRef.get();
    if (tokenDoc.exists) {
      functions.logger.log("Found Token", { token: tokenDoc.data() });
      const callIncrement = admin.firestore.FieldValue.increment(1);
      tokenRef.update({ calls: callIncrement });
      req.apiToken = tokenDoc.data();
      next();
    } else {
      functions.logger.log("Did not find token", { token: authToken });
      res.status(401).send();
    }
  } catch (error) {
    functions.logger.error(
      "Unknown error with Authorization header:",
      authHeader
    );
    res
      .status(400)
      .json({ error: "Unknown error with Authorization header" })
      .send();
  }
};

const formatProgress = (progressData, userId, hideoutData, taskData) => {
  let taskCompletions = progressData?.taskCompletions ?? {};
  let objectiveCompletions = progressData?.taskObjectives ?? {};
  let hideoutPartCompletions = progressData?.hideoutParts ?? {};
  let hideoutModuleCompletions = progressData?.hideoutModules ?? {};
  let displayName = progressData?.displayName ?? userId.substring(0, 6);
  let playerLevel = progressData?.level ?? 1;
  let gameEdition = progressData?.gameEdition ?? 1;
  let pmcFaction = progressData?.pmcFaction ?? "USEC";
  let progress = {
    tasksProgress: formatObjective(taskCompletions, false, true),
    taskObjectivesProgress: formatObjective(objectiveCompletions, true, true),
    hideoutModulesProgress: formatObjective(hideoutModuleCompletions),
    hideoutPartsProgress: formatObjective(hideoutPartCompletions, true),
    displayName: displayName,
    userId: userId,
    playerLevel: playerLevel,
    gameEdition: gameEdition,
    pmcFaction: pmcFaction,
  };

  // If hideout data is non-null, do some post-processing
  try {
    if (hideoutData != null) {
      // Find all of the stash modules and mark them off if the gameEdition meets or exceeds the level
      hideoutData.hideoutStations
        .find((station) => station.id === "5d484fc0654e76006657e0ab")
        .levels.forEach((level) => {
          if (level.level <= gameEdition) {
            // If we can find the module, mark it off, otherwise, push it to the array
            let moduleIndex = progress.hideoutModulesProgress.findIndex(
              (mLevel) => mLevel.id === level.id
            );
            if (moduleIndex === -1) {
              progress.hideoutModulesProgress.push({
                id: level.id,
                complete: true,
              });
            } else {
              progress.hideoutModulesProgress[moduleIndex].complete = true;
            }
            // For each itemRequirement, mark off the hideoutPartCompletions
            level.itemRequirements.forEach((item) => {
              // If we can find the part, mark it off, otherwise, push it to the array
              let partIndex = progress.hideoutPartsProgress.findIndex(
                (part) => part.id === item.id
              );
              if (partIndex === -1) {
                progress.hideoutPartsProgress.push({
                  id: item.id,
                  complete: true,
                  count: item.count,
                });
              } else {
                progress.hideoutPartsProgress[partIndex].complete = true;
              }
            });
          }
        });
    }
  } catch (error) {
    functions.logger.error("Error processing hideout data", error, userId);
  }

  // If task data is non-null, do some post-processing
  try {
    if (taskData != null) {
      // Find all the tasks that aren't 'Any' or our faction specific
      let invalidTaskList = taskData.tasks.filter(
        (task) => task.factionName !== "Any" && task.factionName !== pmcFaction
      );
      // For each task, mark it and its objectives as invalid
      invalidTaskList.forEach((task) => {
        let taskIndex = progress.tasksProgress.findIndex(
          (t) => t.id === task.id
        );
        if (taskIndex !== -1) {
          // Mark the task as invalid
          progress.tasksProgress[taskIndex].invalid = true;
          // Mark the task as incomplete
          progress.tasksProgress[taskIndex].complete = false;
        }
        // For each objective, remove it from the progress object
        task.objectives.forEach((objective) => {
          let objectiveIndex = progress.taskObjectivesProgress.findIndex(
            (o) => o.id === objective.id
          );
          if (objectiveIndex !== -1) {
            // Mark the objective as invalid
            progress.taskObjectivesProgress[objectiveIndex].invalid = true;
            // Mark the objective as incomplete
            progress.taskObjectivesProgress[objectiveIndex].complete = false;
          }
        });
      });

      // Find all of the tasks that have a taskRequirement with status 'failed'
      let failedTaskList = taskData.tasks.filter((task) =>
        task.taskRequirements.some((requirement) =>
          requirement.status.includes("failed")
        )
      );
      // For each task with a failed requirement, check if any of the required quests are marked as failed, and if so, mark the task as invalid
      failedTaskList.forEach((failTask) => {
        // Check that the tasks' requirements which are marked as failed are failed, if not, we're invalid
        let invalid = failTask.taskRequirements.some(
          (requirement) =>
            requirement.status.length == 1 &&
            requirement.status[0] == "failed" &&
            !taskCompletions[requirement.task.id]?.failed &&
            taskCompletions[requirement.task.id]?.complete
        );
        if (invalid) {
          //functions.logger.log("Invalid task fail req", failTask.id)
          ({
            tasksProgress: progress.tasksProgress,
            objectiveProgress: progress.taskObjectivesProgress,
          } = invalidateTaskRecursive(
            failTask.id,
            taskData,
            progress.tasksProgress,
            progress.taskObjectivesProgress
          ));
        }
      });

      // Find all of the tasks that have an alternative set of quests, check if any of the alternative quests are completed (not failed), and if so, mark the original task as invalid
      let alternativeTaskList = taskData.tasks.filter(
        (task) => task.alternatives?.length > 0
      );
      alternativeTaskList.forEach((alternativeTask) => {
        // Check if any of the alternatives are complete
        let invalid = alternativeTask.alternatives.some(
          (alternative) =>
            !taskCompletions[alternative]?.failed &&
            taskCompletions[alternative]?.complete
        );
        if (invalid) {
          //functions.logger.log("Invalid task alternative", alternativeTask.id)
          ({
            tasksProgress: progress.tasksProgress,
            objectiveProgress: progress.taskObjectivesProgress,
          } = invalidateTaskRecursive(
            alternativeTask.id,
            taskData,
            progress.tasksProgress,
            progress.taskObjectivesProgress,
            true
          ));
        }
      });
    }
  } catch (error) {
    functions.logger.error("Error processing task data", error, userId);
  }

  return progress;
};

const updateTaskState = (task, state, progressData, taskData, progressUpdate, updateTime) => {
  functions.logger.info(`Updating task ${task.id} to state ${state}`);
  switch (state) {
    case "completed":
      // Step 1: Check if the task has any alternate tasks
      if (task?.alternatives?.length > 0) {
        functions.logger.info(`Failing alternative tasks for task ${task.id}`)
        // Mark the alternative tasks as failed
        task.alternatives.forEach((alternativeTaskId) => {
          // Find the alternative task in the task data, and mark its objectives off as well
          let alternativeTask = taskData.tasks.find(
            (task) => task.id == alternativeTaskId
          );

          if (alternativeTask) {
            // Mark the alternative task as failed
            progressUpdate[
              `taskCompletions.${alternativeTaskId}.complete`
            ] = true;
            progressUpdate[
              `taskCompletions.${alternativeTaskId}.failed`
            ] = true;
            progressUpdate[
              `taskCompletions.${alternativeTaskId}.timestamp`
            ] = updateTime;

            // For each objective in the alternative task, mark it as complete
            alternativeTask.objectives.forEach((objective) => {
              progressUpdate[
                `taskObjectives.${objective.id}.complete`
              ] = true;
              progressUpdate[
                `taskObjectives.${objective.id}.timestamp`
              ] = updateTime;
            });
          } else {
            throw new Error(
              `Alternative task ${alternativeTaskId} not found for task ${task.id}`
            );
          }
        });
      }

      // Step 2: Mark the task as complete
      progressUpdate[
        `taskCompletions.${task.id}.complete`
      ] = true;
      progressUpdate[
        `taskCompletions.${task.id}.timestamp`
      ] = updateTime;

      // Step 3: Mark the task's objectives as complete
      task.objectives.forEach((objective) => {
        progressUpdate[
          `taskObjectives.${objective.id}.complete`
        ] = true;
        progressUpdate[`taskObjectives.${objective.id}.timestamp`] =
          updateTime;
      });

      // Step 4: if player level is less than the task's level, update the player level
      if (
        progressData.level === undefined || //handle case where player is level 1 and this not being saved in the progress doc yet
        progressData.level < task.minPlayerLevel
      ) {
        functions.logger.info(`Updating player level to ${task.minPlayerLevel}`)
        progressUpdate["level"] = task.minPlayerLevel;
      }
      break;
    case "uncompleted":
      // Mark the task as uncompleted
      progressUpdate[
        `taskCompletions.${task.id}.complete`
      ] = false;
      progressUpdate[
        `taskCompletions.${task.id}.failed`
      ] = false;
      progressUpdate[
        `taskCompletions.${task.id}.timestamp`
      ] = admin.firestore.FieldValue.delete();

      task.objectives.forEach((objective) => {
        progressUpdate[
          `taskObjectives.${objective.id}.complete`
        ] = false;
        progressUpdate[`taskObjectives.${objective.id}.timestamp`] =
          admin.firestore.FieldValue.delete();
      });

      // Check if the task has any alternate tasks
      if (task?.alternatives?.length > 0) {
        // Mark the alternative tasks as uncompleted
        task.alternatives.forEach((alternativeTaskId) => {
          // Find the alternative task in the task data, and mark its objectives off as well
          let alternativeTask = taskData.tasks.find(
            (task) => task.id == alternativeTaskId
          );

          if (alternativeTask) {
            // Mark the alternative task as uncompleted
            progressUpdate[
              `taskCompletions.${alternativeTaskId}.complete`
            ] = false;
            progressUpdate[
              `taskCompletions.${alternativeTaskId}.failed`
            ] = false;
            progressUpdate[
              `taskCompletions.${alternativeTaskId}.timestamp`
            ] = admin.firestore.FieldValue.delete();

            // For each objective in the alternative task, mark it as uncompleted
            alternativeTask.objectives.forEach((objective) => {
              progressUpdate[
                `taskObjectives.${objective.id}.complete`
              ] = false;
              progressUpdate[
                `taskObjectives.${objective.id}.timestamp`
              ] = admin.firestore.FieldValue.delete();
            });
          } else {
            throw new Error(
              `Alternative task ${alternativeTaskId} not found for task ${req.params.taskId}`
            );
          }
        });
      }
      break;
    case "failed":
      // Mark the task as failed (don't update any alternatives as this is an explicitly manual override)
      progressUpdate[
        `taskCompletions.${task.id}.complete`
      ] = true;
      progressUpdate[
        `taskCompletions.${task.id}.failed`
      ] = true;
      progressUpdate[
        `taskCompletions.${task.id}.timestamp`
      ] = updateTime;

      // Mark the task's objectives as complete
      task.objectives.forEach((objective) => {
        progressUpdate[
          `taskObjectives.${objective.id}.complete`
        ] = true;
        progressUpdate[`taskObjectives.${objective.id}.timestamp`] =
          updateTime;
      });
      break;
    default:
      functions.logger.info(`Unknown state ${state}`)
      throw new Error(`Unknown state ${state}`);
  }

  return progressUpdate;
}

const invalidateTaskRecursive = (
  taskId,
  taskData,
  tasksProgress,
  objectiveProgress,
  childOnly = false
) => {
  // Find the task in the taskData, mark it as invalid in the tasksProgress, and mark all of its objectives as invalid in the objectiveProgress
  // Finally, call this function on all of the tasks that have this task as a requirement
  let task = taskData.tasks.find((task) => task.id === taskId);
  if (task != null) {
    // Child only means we only mark the successors as invalid, not the task itself, this is used for alternative tasks
    if (!childOnly) {
      // Find the index of the task in the tasksProgress
      let taskIndex = tasksProgress.findIndex((t) => t.id === taskId);
      // Mark the task as invalid
      if (taskIndex !== -1) {
        tasksProgress[taskIndex].invalid = true;
      } else {
        tasksProgress.push({ id: taskId, complete: false, invalid: true });
      }
      // For each objective of the task, mark it as invalid
      task.objectives.forEach((objective) => {
        let objectiveIndex = objectiveProgress.findIndex(
          (o) => o.id === objective.id
        );
        if (objectiveIndex !== -1) {
          objectiveProgress[objectiveIndex].invalid = true;
        } else {
          objectiveProgress.push({
            id: objective.id,
            complete: false,
            count: 0,
            invalid: true,
          });
        }
      });
    }

    // Find all of the tasks that have this task as a requirement
    let requiredTasks = taskData.tasks.filter((task) =>
      task.taskRequirements.some(
        (requirement) =>
          requirement.task.id === taskId &&
          requirement.status.some(
            (status) => status === "complete" || status === "active"
          )
      )
    );
    requiredTasks.forEach((requiredTask) => {
      // Recursively call this function on the task that requires this task
      ({ tasksProgress, objectiveProgress } = invalidateTaskRecursive(
        requiredTask.id,
        taskData,
        tasksProgress,
        objectiveProgress
      ));
    });
  }
  return { tasksProgress, objectiveProgress };
};

const formatObjective = (
  objectiveData,
  showCount = false,
  showInvalid = false
) => {
  let processedObjectives = [];
  for (const [objectiveKey, objective] of Object.entries(objectiveData)) {
    let newObjective = {
      id: objectiveKey,
      complete: objective?.complete ?? false,
    };
    if (showCount) {
      newObjective.count = objective?.count ?? 0;
    }
    if (showInvalid) {
      newObjective.invalid = objective?.invalid ?? false;
    }
    if (objective?.failed) {
      newObjective.failed = objective.failed;
    }
    processedObjectives.push(newObjective);
  }
  return processedObjectives;
};

// Add verifyBearer middleware for checking tokens
app.use(verifyBearer);

// Error handler
app.use(function (err, req, res, next) {
  res.status(500).send(err.message);
});

/**
 * @openapi
 * /token:
 *   get:
 *     summary: "Returns data associated with the Token given in the Authorization header of the request"
 *     tags:
 *       - "Token"
 *     responses:
 *       200:
 *         $ref: "#/components/schemas/Token"
 *       400:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.get("/api/v2/token", async (req, res) => {
  functions.logger.log("Request object", req);
  if (req.apiToken != null) {
    const db = admin.firestore();
    const tokenRef = db.collection("token").doc(req.apiToken.token);
    const tokenDoc = await tokenRef.get();
    let tokenResponse = {
      permissions: tokenDoc.data().permissions ?? [],
      token: tokenDoc.data().token ?? "Unknown",
    };
    res.status(200).json(tokenResponse).send();
  } else {
    res.status(401).send();
  }
});

/**
 * @openapi
 * /progress:
 *   get:
 *     summary: "Returns progress data of the player"
 *     tags:
 *       - "Progress"
 *     responses:
 *       200:
 *         $ref: "#/components/schemas/Progress"
 *       400:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.get("/api/v2/progress", async (req, res) => {
  if (req.apiToken != null && req.apiToken.permissions.includes("GP")) {
    const db = admin.firestore();
    const progressRef = db.collection("progress").doc(req.apiToken.owner);

    let progressDoc = null;
    let taskData;
    let hideoutData;

    let progressPromise = progressRef.get().then((result) => {
      progressDoc = result;
    });

    let hideoutPromise = getHideoutData().then((result) => {
      hideoutData = result;
    });

    let taskPromise = getTaskData().then((result) => {
      taskData = result;
    });

    await Promise.all([progressPromise, hideoutPromise, taskPromise]);

    let progressData = formatProgress(
      progressDoc.data(),
      req.apiToken.owner,
      hideoutData,
      taskData
    );
    res
      .status(200)
      .json({ data: progressData, meta: { self: req.apiToken.owner } })
      .send();
  } else {
    res.status(401).send();
  }
});

/**
 * @openapi
 * /team/progress:
 *   get:
 *     summary: "Returns progress data of all members of the team"
 *     tags:
 *       - "Progress"
 *     responses:
 *       200:
 *         $ref: "#/components/schemas/TeamProgress"
 *       400:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.get("/api/v2/team/progress", async (req, res) => {
  if (req.apiToken != null && req.apiToken.permissions.includes("TP")) {
    const db = admin.firestore();

    // Get the requestee's meta documents
    const systemRef = db.collection("system").doc(req.apiToken.owner);
    const userRef = db.collection("user").doc(req.apiToken.owner);

    let systemDoc = null;
    let userDoc = null;
    let hideoutData;
    let taskData;

    let systemPromise = systemRef.get().then((result) => {
      systemDoc = result;
    });

    let userPromise = userRef.get().then((result) => {
      userDoc = result;
    });

    let hideoutPromise = getHideoutData().then((result) => {
      hideoutData = result;
    });

    let taskPromise = getTaskData().then((result) => {
      taskData = result;
    });

    // Get the system and user doc simultaneously
    await Promise.all([
      systemPromise,
      userPromise,
      hideoutPromise,
      taskPromise,
    ]);

    const requesteeProgressRef = db
      .collection("progress")
      .doc(req.apiToken.owner);

    // Create an array to store all the team's progress data
    let team = [];

    let hiddenTeammates = [];

    // We aren't currently in a team
    if (systemDoc.data().team == null) {
      team.push(requesteeProgressRef.get());
    } else {
      // Get the requestee's team doc
      const teamRef = db.collection("team").doc(systemDoc.data().team);
      const teamDoc = await teamRef.get();

      // Get copies of your team's progress
      teamDoc.data().members.forEach((member) => {
        // Get each member's progress document as a promise
        const memberProgressRef = db.collection("progress").doc(member);
        team.push(memberProgressRef.get());
      });

      // Find all of the hidden teammates
      const hideTeammates = userDoc.data()?.teamHide || [];
      for (const [id, hidden] of Object.entries(hideTeammates)) {
        if (hidden && teamDoc.data().members.includes(id)) {
          hiddenTeammates.push(id);
        }
      }
    }

    // Wait for all the promises to finish
    let teamResponse = [];

    await Promise.all(team).then((members) => {
      members.forEach((member) => {
        let memberProgress = formatProgress(
          member.data(),
          member.ref.path.split("/").pop(),
          hideoutData,
          taskData
        );
        teamResponse.push(memberProgress);
      });
    });

    res
      .status(200)
      .json({
        data: teamResponse,
        meta: { self: req.apiToken.owner, hiddenTeammates: hiddenTeammates },
      })
      .send();
  } else {
    res.status(401).send();
  }
});

// /**
//  * @openapi
//  * /progress/level/{level}:
//  *   post:
//  *     summary: "Sets player's level to value specified in the path"
//  *     tags:
//  *       - "Progress"
//  *     parameters:
//  *       - name: "level"
//  *         in: "path"
//  *         description: "Player's new level"
//  *         required: true
//  *         schema:
//  *           type: "integer"
//  *     responses:
//  *       200:
//  *         description: "Player's level was updated successfully"
//  *       400:
//  *         description: "Provided data on input are invalid"
//  *       401:
//  *         description: "Provided API Token is not authorized to access this resource"
//  */
// app.post('/api/v2/progress/level/:levelValue(\\d+)', async (req, res) => {
// 	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
// 		const db = admin.firestore();

// 		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

// 		if (req.params.levelValue) {
// 			await requesteeProgressRef.set({
// 				level: parseInt(req.params.levelValue)
// 			}, {merge: true});
// 			res.status(200).send()
// 		}else{
// 			res.status(400).send()
// 		}
// 	}else{
// 		res.status(401).send()
// 	}
// })

/**
 * Update the progress of a task.
 *
 * @openapi
 * /api/v2/progress/task/{taskId}:
 *   post:
 *     summary: Update task progress
 *     tags:
 *       - "Progress"
 *     description: Update the progress of a task with the provided state.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: The new state of the task.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 description: The new state of the task.
 *                 enum: [uncompleted, completed, failed]
 *     responses:
 *       '200':
 *         description: The task was updated successfully.
 *       '400':
 *         description: Invalid request parameters.
 *       '401':
 *         description: Unauthorized to update progress.
 *       '500':
 *         description: Internal server error.
 */
app.post("/api/v2/progress/task/:taskId", async (req, res) => {
  if (req.apiToken != null && req.apiToken.permissions.includes("WP")) {
    const db = admin.firestore();

    const requesteeProgressRef = db
      .collection("progress")
      .doc(req.apiToken.owner);

    // Check if we have the required data to update a task
    if (req.params.taskId && req.body.state) {
      // Check if state is one of the valid values
      if (["uncompleted", "completed", "failed"].includes(req.body.state)) {
        // Get the task document
        let taskData;

        await getTaskData().then((data) => {
          taskData = data;
        });

        // Check if the task exists
        let relevantTask = taskData.tasks.find(
          (task) => task.id == req.params.taskId
        );

        if (relevantTask) {
          // We have the task, now update the progress according to state.
          try {
            await db.runTransaction(async (transaction) => {
              // Ensure the progress document exists
              const progressDoc = await transaction.get(requesteeProgressRef);
              if (!progressDoc.exists) {
                throw new Error("User's progress document doesn't exist");
              }

              // Create an object to aggregate multiple updates into one write
              let progressUpdate = {};
              let updateTime = Date.now();
              let progressData = progressDoc.data();

              // Update the task state
              progressUpdate = updateTaskState(
                relevantTask, req.body.state, progressData, taskData, progressUpdate, updateTime
              );

              // Update the progress document with the changes we've made
              transaction.update(requesteeProgressRef, progressUpdate);
            });
            // Finally, send OK
            res.status(200).send({ message: "Updated progress" });
          } catch (error) {
            functions.logger.error("Transaction failed", {
              error: error,
              user: req.apiToken.owner,
              token: req.apiToken,
            });
            res.status(500).send({ error: "Progress update failed" });
          }
        } else {
          res.status(400).send({ error: "Unknown task" });
        }
      } else {
        res.status(400).send({ error: "Invalid state provided" });
      }
    } else {
      res.status(400).send({ error: "Invalid parameters provided" });
    }
  } else {
    res.status(401).send();
  }
});

/**
 * Update the progress of multiple tasks.
 *
 * @openapi
 * /api/v2/progress/tasks:
 *   post:
 *     summary: Update multiple tasks' progress
 *     tags:
 *       - "Progress"
 *     description: Update the progress of multiple tasks with the provided states.
 *     requestBody:
 *       required: true
 *       description: An array of objects with a taskId and state.
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the task to update.
 *                 state:
 *                   type: string
 *                   description: The new state of the task.
 *                   enum: [uncompleted, completed, failed]
 *     responses:
 *       '200':
 *         description: The tasks were updated successfully.
 *       '400':
 *         description: Invalid request parameters.
 *       '401':
 *         description: Unauthorized to update progress.
 *       '500':
 *         description: Internal server error.
 */
app.post("/api/v2/progress/tasks", async (req, res) => {
  if (req.apiToken != null && req.apiToken.permissions.includes("WP")) {
    const db = admin.firestore();

    const requesteeProgressRef = db
      .collection("progress")
      .doc(req.apiToken.owner);

    // Get the task document
    let taskData;

    await getTaskData().then((data) => {
      taskData = data;
    });

    // Validate the request body
    // Check if the request body is an array of objects with a taskId and state
    if (!Array.isArray(req.body)) {
      res.status(400).send({ error: "Invalid request body" });
      return;
    }
    req.body.forEach((task) => {
      // Check if the task object has a taskId and state
      if (
        typeof task.id !== "string" ||
        typeof task.state !== "string" ||
        !["uncompleted", "completed", "failed"].includes(task.state)
      ) {
        res.status(400).send({ error: "Invalid request body" });
        return;
      }
    });

    try {
      await db.runTransaction(async (transaction) => {
        // Ensure the progress document exists
        const progressDoc = await transaction.get(requesteeProgressRef);
        if (!progressDoc.exists) {
          throw new Error("User's progress document doesn't exist");
        }

        // Create an object to aggregate multiple updates into one write
        let progressUpdate = {};
        let updateTime = Date.now();
        let progressData = progressDoc.data();

        // For each task in the request body, update the progress according to state.
        req.body.forEach((task) => {
          // Check if the task exists
          let relevantTask = taskData.tasks.find(
            (taskData) => taskData.id == task.id
          );

          if (relevantTask) {
            // Update the task state
            progressUpdate = updateTaskState(
              relevantTask, task.state, progressData, taskData, progressUpdate, updateTime
            );
          }
        });

        // Update the progress document with the changes we've made
        transaction.update(requesteeProgressRef, progressUpdate);
      });
      // Finally, send OK
      res.status(200).send({ message: "Updated progress" });
    } catch (error) {
      functions.logger.error("Transaction failed", {
        error: error,
        user: req.apiToken.owner,
        token: req.apiToken,
      });
      res.status(500).send({ error: "Progress update failed" });
    }
  } else {
    res.status(401).send();
  }
});

/**
 * Update the progress of tasks associated with an objective.
 *
 * @openapi
 * /api/v2/progress/task/objective/{objectiveId}:
 *   post:
 *     summary: Update objective progress for a task.
 *     tags:
 *       - "Progress"
 *     description: Update the progress objectives of tasks.
 *     parameters:
 *       - in: path
 *         name: objectiveId
 *         required: true
 *         description: The ID of the objective to update progress for.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Objective properties to update.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: string
 *                 description: The state of the task objective (completed or uncompleted).
 *                 enum: [completed, uncompleted]
 *                 nullable: true
 *               count:
 *                 type: integer
 *                 description: The number of items or completions toward the objective's goal.
 *                 minimum: 0
 *                 nullable: true
 *     responses:
 *       '200':
 *         description: The objective was updated successfully.
 *       '400':
 *         description: Invalid request parameters.
 *       '401':
 *         description: Unauthorized to update progress.
 *       '500':
 *         description: Internal server error.
 */
app.post("/api/v2/progress/task/objective/:objectiveId", async (req, res) => {
  if (req.apiToken != null && req.apiToken.permissions.includes("WP")) {
    const db = admin.firestore();

    const requesteeProgressRef = db
      .collection("progress")
      .doc(req.apiToken.owner);

    // Check if we have the required data to update an objective
    if (req.params.objectiveId && (req.body.state || req.body.count != null)) {
      // Get the task document
      let taskData;

      await getTaskData().then((data) => {
        taskData = data;
      });

      // Check if the objective exists
      let relevantTask = taskData.tasks.find((task) =>
        task.objectives.find(
          (objective) => objective.id == req.params.objectiveId
        )
      );

      if (relevantTask) {
        // We have the task, now get the objective
        let relevantObjective = relevantTask.objectives.find(
          (objective) => objective.id == req.params.objectiveId
        );

        try {
          await db.runTransaction(async (transaction) => {
            // Our update object so we can batch update the progress document in one write
            let updateTime = Date.now();
            let progressUpdate = {};

            // Validate the state if it's set
            if (req.body.state) {
              if (["uncompleted", "completed"].includes(req.body.state)) {
                switch (req.body.state) {
                  case "uncompleted":
                    // Mark the objective as uncompleted
                    progressUpdate[
                      `taskObjectives.${relevantObjective.id}.complete`
                    ] = false;
                    progressUpdate[
                      `taskObjectives.${relevantObjective.id}.timestamp`
                    ] = admin.firestore.FieldValue.delete();
                    break;
                  case "completed":
                    // Mark the objective as completed
                    progressUpdate[
                      `taskObjectives.${relevantObjective.id}.complete`
                    ] = true;
                    progressUpdate[
                      `taskObjectives.${relevantObjective.id}.timestamp`
                    ] = updateTime;
                    break;
                }
              } else {
                res.status(400).send({ error: "Invalid state provided" });
              }
            }

            // Validate the count if it's set and its an integer
            if (req.body.count != null) {
              if (Number.isInteger(req.body.count) && req.body.count >= 0) {
                // Update the objective count
                progressUpdate[`taskObjectives.${relevantObjective.id}.count`] =
                  req.body.count;
              } else {
                res.status(400).send({ error: "Invalid count provided" });
              }
            }

            if (Object.keys(progressUpdate).length > 0) {
              // Update the progress document with the changes we've made
              transaction.update(requesteeProgressRef, progressUpdate);
              // Finally, send OK
              res.status(200).send({ message: "Updated progress" });
            } else {
              res.status(400).send({ error: "No valid parameters provided" });
            }
          });
        } catch (error) {
          functions.logger.error("Transaction failed", {
            error: error,
            user: req.apiToken.owner,
            token: req.apiToken,
          });
          res.status(500).send({ error: "Progress update failed" });
        }
      } else {
        res.status(400).send({ error: "Unknown objective" });
      }
    } else {
      res.status(400).send({ error: "Invalid parameters provided" });
    }
  } else {
    res.status(401).send();
  }
});

// /**
//  * @openapi
//  * /progress/hideout/{id}:
//  *   post:
//  *     summary: "Marks hideout module as completed."
//  *     parameters:
//  *       - name: "id"
//  *         in: "path"
//  *         description: "Hideout module ID"
//  *         required: true
//  *         schema:
//  *           type: "integer"
//  *     tags:
//  *       - "Progress"
//  *     responses:
//  *       200:
//  *         description: "Hideout module progress was updated successfully"
//  *       400:
//  *         description: "Provided data on input are invalid"
//  *       401:
//  *         description: "Provided API Token is not authorized to access this resource"
//  */
// app.post('/api/v2/progress/hideout/:hideoutId(\\d+)', async (req, res) => {
// 	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
// 		const db = admin.firestore();

// 		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

// 		if (req.body && req.params.hideoutId) {

// 			// Set up an object to update merge with
// 			var updateObject = {}
// 			if ('complete' in req.body && typeof req.body.complete === 'boolean') {
// 				updateObject.complete = req.body.complete
// 				if(req.body.complete) {
// 					updateObject.timeComplete = new Date().getTime()
// 				}else{
// 					updateObject.timeComplete = null
// 				}
// 			}

// 			await requesteeProgressRef.set({
// 				hideout: {[req.params.hideoutId]: updateObject}
// 			}, {merge: true});
// 			res.status(200).send()
// 		}else{
// 			res.status(400).send()
// 		}
// 	}else{
// 		res.status(401).send()
// 	}
// })

// /**
//  * @openapi
//  * /progress/hideout/objective/{id}:
//  *   post:
//  *     summary: "Marks hideout module objective as completed."
//  *     parameters:
//  *       - name: "id"
//  *         in: "path"
//  *         description: "Hideout module objective ID"
//  *         required: true
//  *         schema:
//  *           type: "integer"
//  *     tags:
//  *       - "Progress"
//  *     responses:
//  *       200:
//  *         description: "Hideout objective progress was updated successfully"
//  *       400:
//  *         description: "Provided data on input are invalid"
//  *       401:
//  *         description: "Provided API Token is not authorized to access this resource"
//  */
// app.post('/api/v2/progress/hideout/objective/:objectiveId(\\d+)', async (req, res) => {
// 	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
// 		const db = admin.firestore();

// 		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

// 		if (req.body && req.params.objectiveId) {

// 			// Set up an object to update merge with
// 			var updateObject = {}
// 			// 'have' value
// 			if ('have' in req.body && typeof req.body.have === 'number') { updateObject.have = req.body.have }
// 			if ('complete' in req.body && typeof req.body.complete === 'boolean') {
// 				updateObject.complete = req.body.complete
// 				if(req.body.complete) {
// 					updateObject.timeComplete = new Date().getTime()
// 				}else{
// 					updateObject.timeComplete = null
// 				}
// 			}

// 			await requesteeProgressRef.set({
// 				hideoutObjectives: {[req.params.objectiveId]: updateObject}
// 			}, {merge: true});
// 			res.status(200).send()
// 		}else{
// 			res.status(400).send()
// 		}
// 	}else{
// 		res.status(401).send()
// 	}
// })

// Export the express app as a cloud function
exports.default = functions.https.onRequest(app);
