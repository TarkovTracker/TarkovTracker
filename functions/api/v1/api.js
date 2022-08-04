const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express App and allow all origins
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for checking validity and access of tokens
const verifyBearer = async (req, res, next) => {
  const db = admin.firestore();

	const authHeader = req.get('Authorization')

	// If no auth, 401
	if (authHeader == null) {
		res.status(401).json({"error": "No Authorization header sent"}).send()
	}

	// If auth broken, 400
	if (authHeader.split(' ')[1] == null) {
		res.status(400).json({"error": "No bearer token set"}).send()
	}else{
		var authToken = authHeader.split(' ')[1]
	}

	// Check if token is valid
	try {
		const tokenRef = db.collection('token').doc(authToken);
		const tokenDoc = await tokenRef.get();
		if (tokenDoc.exists) {
			const callIncrement = admin.firestore.FieldValue.increment(1);
			tokenRef.update({ calls: callIncrement });
			req.apiToken = tokenDoc.data()
			next()
		}else{
			res.status(401).send()
		}
	}catch (error) {
		functions.logger.error("Unknown error with Authorization header:", authHeader);
		res.status(400).json({"error": "Unknown error with Authorization header"}).send()
	}

}

// Add verifyBearer middleware for checking tokens
app.use(verifyBearer)

// Error handler
app.use(function (err, req, res, next) {
  res.status(500).send(err.message)
})

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
app.get('/api/v1/token', async (req, res) => {
	if (req.apiToken != null) {
    const db = admin.firestore();
    const tokenRef = db.collection('token').doc(req.apiToken.token);
		const tokenDoc = await tokenRef.get();
		const tokenData = Object.assign({}, tokenDoc.data());
		delete tokenData.owner
		delete tokenData.note
		res.status(200).json(tokenData).send()
	}else{
		res.status(401).send()
	}
})

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
app.get('/api/v1/progress', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('GP')) {
    const db = admin.firestore();
    const progressRef = db.collection('progress').doc(req.apiToken.owner);
		const progressDoc = await progressRef.get();
		res.status(200).json({...progressDoc.data(), self: true, hide: false}).send()
	}else{
		res.status(401).send()
	}
})

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
app.get('/api/v1/team/progress', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('TP')) {
    const db = admin.firestore();

    // Get the requestee's meta documents
    const systemRef = db.collection('system').doc(req.apiToken.owner);
    const userRef = db.collection('user').doc(req.apiToken.owner);

    var systemDoc = null;
    var userDoc = null;

    var systemPromise = systemRef.get().then((result) => {
			systemDoc = result
    })

    var userPromise = userRef.get().then((result) => {
			userDoc = result
    })

		// Get the system and user doc simultaneously
		await Promise.all([systemPromise, userPromise])

		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

		// Create an array to store all the team's progress data
		var team = []

		// We aren't currently in a team
		if (systemDoc.data().team == null) {
			team.push(requesteeProgressRef.get())
		}else{
			// Get the requestee's team doc
			const teamRef = systemDoc.data().team;
			const teamDoc = await teamRef.get();

			// Get copies of your team's progress
			teamDoc.data().members.forEach((member) => {
				// Get each member's progress document as a promise
				const memberProgressRef = db.collection('progress').doc(member);
				team.push(memberProgressRef.get())
			})
		}

		const hideTeammates = userDoc.data()?.hideTeammates || []

		// Wait for all the promises to finish
		var teamResponse = []

		await Promise.all(team).then((members) => {
			members.forEach((member) => {
				teamResponse.push({
					...member.data(),
					hide: hideTeammates.includes(member.id),
					self: member.ref.isEqual(requesteeProgressRef) ? true : undefined
				})
			})
		})

		res.status(200).json(teamResponse).send()
	}else{
		res.status(401).send()
	}
})

/**
 * @openapi
 * /progress/level/{level}:
 *   post:
 *     summary: "Sets player's level to value specified in the path"
 *     tags:
 *       - "Progress"
 *     parameters:
 *       - name: "level"
 *         in: "path"
 *         description: "Player's new level"
 *         required: true
 *         schema:
 *           type: "integer"
 *     responses:
 *       200:
 *         description: "Player's level was updated successfully"
 *       400:
 *         description: "Provided data on input are invalid"
 *       401:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.post('/api/v1/progress/level/:levelValue(\\d+)', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
		const db = admin.firestore();

		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

		if (req.params.levelValue) {
			await requesteeProgressRef.set({
				level: parseInt(req.params.levelValue)
			}, {merge: true});
			res.status(200).send()
		}else{
			res.status(400).send()
		}
	}else{
		res.status(401).send()
	}
})

/**
 * @openapi
 * /progress/quest/{id}:
 *   post:
 *     summary: "Marks given quest as completed."
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Quest ID"
 *         required: true
 *         schema:
 *           type: "integer"
 *     tags:
 *       - "Progress"
 *     responses:
 *       200:
 *         description: "Quest progress was updated successfully"
 *       400:
 *         description: "Provided data on input are invalid"
 *       401:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.post('/api/v1/progress/quest/:questId(\\d+)', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
		const db = admin.firestore();

		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

		if (req.body && req.params.questId) {

			// Set up an object to update merge with
			var updateObject = {}
			if ('complete' in req.body && typeof req.body.complete === 'boolean') {
				updateObject.complete = req.body.complete
				if(req.body.complete) {
					updateObject.timeComplete = new Date().getTime()
				}else{
					updateObject.timeComplete = null
				}
			}

			await requesteeProgressRef.set({
				quests: {[req.params.questId]: updateObject}
			}, {merge: true});
			res.status(200).send()
		}else{
			res.status(400).send()
		}
	}else{
		res.status(401).send()
	}
})

/**
 * @openapi
 * /progress/quest/objective/{id}:
 *   post:
 *     summary: "Marks given quest objective as completed."
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Quest objective ID"
 *         required: true
 *         schema:
 *           type: "integer"
 *     tags:
 *       - "Progress"
 *     responses:
 *       200:
 *         description: "Quest objective progress was updated successfully"
 *       400:
 *         description: "Provided data on input are invalid"
 *       401:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.post('/api/v1/progress/quest/objective/:objectiveId(\\d+)', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
		const db = admin.firestore();

		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

		if (req.body && req.params.objectiveId) {

			// Set up an object to update merge with
			var updateObject = {}
			// 'have' value
			if ('have' in req.body && typeof req.body.have === 'number') { updateObject.have = req.body.have }
			if ('complete' in req.body && typeof req.body.complete === 'boolean') {
				updateObject.complete = req.body.complete
				if(req.body.complete) {
					updateObject.timeComplete = new Date().getTime()
				}else{
					updateObject.timeComplete = null
				}
			}

			await requesteeProgressRef.set({
				objectives: {[req.params.objectiveId]: updateObject}
			}, {merge: true});
			res.status(200).send()
		}else{
			res.status(400).send()
		}
	}else{
		res.status(401).send()
	}
})

/**
 * @openapi
 * /progress/hideout/{id}:
 *   post:
 *     summary: "Marks hideout module as completed."
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Hideout module ID"
 *         required: true
 *         schema:
 *           type: "integer"
 *     tags:
 *       - "Progress"
 *     responses:
 *       200:
 *         description: "Hideout module progress was updated successfully"
 *       400:
 *         description: "Provided data on input are invalid"
 *       401:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.post('/api/v1/progress/hideout/:hideoutId(\\d+)', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
		const db = admin.firestore();

		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

		if (req.body && req.params.hideoutId) {

			// Set up an object to update merge with
			var updateObject = {}
			if ('complete' in req.body && typeof req.body.complete === 'boolean') {
				updateObject.complete = req.body.complete
				if(req.body.complete) {
					updateObject.timeComplete = new Date().getTime()
				}else{
					updateObject.timeComplete = null
				}
			}

			await requesteeProgressRef.set({
				hideout: {[req.params.hideoutId]: updateObject}
			}, {merge: true});
			res.status(200).send()
		}else{
			res.status(400).send()
		}
	}else{
		res.status(401).send()
	}
})

/**
 * @openapi
 * /progress/hideout/objective/{id}:
 *   post:
 *     summary: "Marks hideout module objective as completed."
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Hideout module objective ID"
 *         required: true
 *         schema:
 *           type: "integer"
 *     tags:
 *       - "Progress"
 *     responses:
 *       200:
 *         description: "Hideout objective progress was updated successfully"
 *       400:
 *         description: "Provided data on input are invalid"
 *       401:
 *         description: "Provided API Token is not authorized to access this resource"
 */
app.post('/api/v1/progress/hideout/objective/:objectiveId(\\d+)', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('WP')) {
		const db = admin.firestore();

		const requesteeProgressRef = db.collection('progress').doc(req.apiToken.owner);

		if (req.body && req.params.objectiveId) {

			// Set up an object to update merge with
			var updateObject = {}
			// 'have' value
			if ('have' in req.body && typeof req.body.have === 'number') { updateObject.have = req.body.have }
			if ('complete' in req.body && typeof req.body.complete === 'boolean') {
				updateObject.complete = req.body.complete
				if(req.body.complete) {
					updateObject.timeComplete = new Date().getTime()
				}else{
					updateObject.timeComplete = null
				}
			}

			await requesteeProgressRef.set({
				hideoutObjectives: {[req.params.objectiveId]: updateObject}
			}, {merge: true});
			res.status(200).send()
		}else{
			res.status(400).send()
		}
	}else{
		res.status(401).send()
	}
})


// Export the express app as a cloud function
exports.default = functions.https.onRequest(app)
