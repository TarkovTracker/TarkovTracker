/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearer:
 *       bearerFormat: "Bearer <your-tarkovtracker-API-token>"
 *       type: http
 *       scheme: bearer
 *   schemas:
 *     Token:
 *       title: "Token"
 *       description: "User's progress data."
 *       type: "object"
 *       properties:
 *         token:
 *           type: "string"
 *           description: "Shows token used to make this call"
 *         calls:
 *           type: "integer"
 *           description: "Shows number of times this token has been used so far"
 *         permissions:
 *           type: array
 *           description: "List of permissions this token has (GP == Read Personal Progression, TP == Read Team Progression, WP == Write Personal Progression)"
 *           items:
 *             type: integer
 *         createdAt:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: number
 *               description: "UNIX Timestamp when this authorization token was created"
 *             _nanoseconds:
 *               type: number
 *               description: "Combined with _seconds field, this will give you more precise time of when this authorization token was created"
 *     TeamProgress:
 *       title: "TeamProgress"
 *       description: "Array of team member's progress data."
 *       type: "array"
 *       items:
 *         $ref: "#/components/schemas/Progress"
 *     Progress:
 *       title: "Progress"
 *       description: "User's progress data."
 *       type: "object"
 *       properties:
 *         level:
 *           type: "integer"
 *           description: "Player's current level"
 *         gameEdition:
 *           type: "integer"
 *           description: "Player's game edition (1 = Standard Edition, 2 == Left to Die Edition, 3 == Prepare to Die Edition, 4 == Edge of Darkness Edition)"
 *         hide:
 *           type: "boolean"
 *           description: "True if this player is being hidden within the team from the perspective of the token owner. Useful when some member are inactive and you are not interested in seeing their progress for the moment. Think of it as a not-a-real-kick from the team."
 *         taskCompletions:
 *           type: "array"
 *           description: "List of completed quests."
 *           items:
 *             $ref: "#/components/schemas/TaskCompletion"
 *         hideout:
 *           type: "array"
 *           description: "List of installed hideout modules."
 *           items:
 *             $ref: "#/components/schemas/HideoutModuleCompletion"
 *         objectives:
 *           type: "array"
 *           description: "List of quest objectives."
 *           items:
 *             $ref: "#/components/schemas/ObjectiveCompletion"
 *         hideoutObjectives:
 *           type: "array"
 *           description: "List of hideout objectives."
 *           items:
 *             $ref: "#/components/schemas/HideoutModuleObjectiveCompletion"
 *     TaskCompletion:
 *       title: "TaskCompletion"
 *       description: "Player's progress of a given task. The key is the UUID correlating to the task ID available via the tarkov.dev API"
 *       type: "object"
 *       properties:
 *         complete:
 *           type: "boolean"
 *           description: "True if a given quest has been completed."
 *         timeComplete:
 *           type: "number"
 *           description: "UNIX timestamp of the time when quest was marked as complete"
 *     HideoutModuleCompletion:
 *       title: "HideoutModuleCompletion"
 *       description: "Player's progress on a given hideout module. The key is the UUID correlating to a hideout station level ID available via the tarkov.dev API"
 *       type: "object"
 *       properties:
 *         complete:
 *           type: "boolean"
 *           description: "True if a given hideout module has been installed"
 *         timeComplete:
 *           type: "number"
 *           description: "UNIX timestamp of the time when hideout module was marked as installed"
 *     ObjectiveCompletion:
 *       title: "ObjectiveCompletion"
 *       description: "Player's progress on a given quest objective."
 *       type: "object"
 *       properties:
 *         complete:
 *           type: "boolean"
 *           description: "True if a given objective has been completed"
 *         timeComplete:
 *           type: "number"
 *           description: "UNIX timestamp of the time when objective was marked as complete"
 *     HideoutModuleObjectiveCompletion:
 *       title: "HideoutModuleObjectiveCompletion"
 *       description: "Player's progress on a given hideout module objective data."
 *       type: "object"
 *       properties:
 *         complete:
 *           type: "boolean"
 *           description: "True if a given hideout module objective has been completed"
 *         timeComplete:
 *           type: "number"
 *           description: "UNIX timestamp of the time when hideout module was marked as complete"
 */