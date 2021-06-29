const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');

// Initialize Express App and allow all origins
const app = express();
app.use(cors({ origin: true }));

// Middleware for checking validity and access of tokens
const verifyBearer = async (req, res, next) => {
  	const db = admin.firestore();

	const authHeader = req.get('Authorization')

	// If no auth, 401
	if (authHeader == null) {
		res.status(401).send()
	}

	// If auth broken, 400
	if (authHeader.split(' ')[1] == null) {
		res.status(400).send()
	}else{
		var authToken = authHeader.split(' ')[1]
	}

	// Check if token is valid
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


}

// Add verifyBearer middleware for checking tokens
app.use(verifyBearer)

// Error handler
app.use(function (err, req, res, next) {
  res.status(500).send(err.message)
})

// GET progress endpoint
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

// GET progress endpoint
app.get('/api/v1/progress', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('GP')) {
    	const db = admin.firestore();
    	const progressRef = db.collection('progress').doc(req.apiToken.owner);
		const progressDoc = await progressRef.get();
		res.status(200).json({...progressDoc.data(), self: true}).send()
	}else{
		res.status(401).send()
	}
})

// GET team progress endpoint
app.get('/api/v1/team/progress', async (req, res) => {
	if (req.apiToken != null && req.apiToken.permissions.includes('TP')) {
    	const db = admin.firestore();
    	// Get the requestee's system doc
    	const systemRef = db.collection('system').doc(req.apiToken.owner);
		const systemDoc = await systemRef.get();

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

		// Wait for all the promises to finish
		var teamResponse = []
		await Promise.all(team).then((members) => {
			members.forEach((member) => {
				teamResponse.push({...member.data(), self: member.ref.isEqual(requesteeProgressRef) ? true : undefined })
			})
		})

		res.status(200).json(teamResponse).send()
	}else{
		res.status(401).send()
	}
})

// Export the express app as a cloud function
exports.default = functions.https.onRequest(app)
