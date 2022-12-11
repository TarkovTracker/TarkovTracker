// eslint-disable-next-line no-unused-vars
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Export the v2 API
//exports.apiv2 = require('./api/v2/index.js');

// Create an API token for the user
// This is a Firebase callable function (not part of the REST API)
exports.createToken = functions.https.onCall(async (data, context) => {
	const db = admin.firestore();

	functions.logger.log("Starting create token", { data: data, owner: context.auth.uid });

	if (data.note == null || !(data.permissions.length > 0)) {
		return { error: 'Invalid token parameters' }
	}

	const systemRef = db.collection('system').doc(context.auth.uid);
	const systemDoc = await systemRef.get();
	// If the system document doesn't exist, create it
	if (!systemDoc.exists) {
		await systemRef.set({
			tokens: []
		});
	}

	if (systemDoc?.data()?.tokens?.length >= 5) {
		// We have too many tokens already
		return { error: 'You have the maximum number of tokens' }
	}

	// Generate a random token
	const UIDGenerator = require('uid-generator');
	const uidgen = new UIDGenerator(128);
	const token = await uidgen.generate()
	const tokenRef = db.collection('token').doc(token);
	// Run a transaction to create the token and add it to the system document
	try {
		await db.runTransaction(async (transaction) => {
			// Ensure the token doesn't already exist
			const tokenDoc = await transaction.get(tokenRef);
			if (tokenDoc.exists) {
				functions.logger.error("Token already existed", { owner: context.auth.uid, token: token });
				// The user won the losing 2^128 lottery
				throw new Error('Tried to create a token that already existed')
			}
			transaction.set(tokenRef, {
				owner: context.auth.uid,
				note: data.note,
				permissions: data.permissions,
				token: token,
				createdAt: admin.firestore.FieldValue.serverTimestamp()
			})
			transaction.update(systemRef, {
				tokens: admin.firestore.FieldValue.arrayUnion(token)
			})
		});
		functions.logger.log("Created token", { owner: context.auth.uid, token: token });
		return { token: token }
	} catch (e) {
		functions.logger.error("Failed to create token", { owner: context.auth.uid, token: token, error: e });
		return { error: 'Error during token creation transaction', timestamp: Date.now() }
	}
});

// Remove an API token for the user
// This is a Firebase callable function (not part of the REST API)
exports.revokeToken = functions.https.onCall(async (data, context) => {
	const db = admin.firestore();

	if (data.token == null) {
		functions.logger.error("No token specified", { owner: context.auth.uid });
		return { error: 'Invalid token parameters', timestamp: Date.now() }
	}

	const systemRef = db.collection('system').doc(context.auth.uid);
	const tokenRef = db.collection('token').doc(data.token);

	// Run a transaction to remove the token from the system document and delete the token document
	try {
		await db.runTransaction(async (transaction) => {
			// Ensure the token doesn't already exist
			const tokenDoc = await transaction.get(tokenRef);
			const systemDoc = await transaction.get(systemRef);
			// If tokenDoc or systemDoc doesn't exist, there's something wrong
			if (!tokenDoc.exists || !systemDoc.exists) {
				functions.logger.error("Token or system document doesn't exist", { owner: context.auth.uid, token: data.token, tokenDoc: tokenDoc.exists, systemDoc: systemDoc.exists });
				throw new Error('Token or system document doesn\'t exist')
			}
			// If the token doesn't belong to the user, there's something wrong
			if (tokenDoc.data().owner != context.auth.uid) {
				throw new Error('Token doesn\'t belong to user')
			}

			// Assuming everything is fine, remove the token from the system document and delete the token document
			transaction.update(systemRef, {
				tokens: admin.firestore.FieldValue.arrayRemove(data.token)
			})
			transaction.delete(tokenRef)
		});
		functions.logger.log("Removed token", { owner: context.auth.uid, token: data.token });
		return { revoked: true }
	} catch (e) {
		functions.logger.error("Failed to create token", { owner: context.auth.uid, token: data.token, error: e });
		return { error: 'Error during token deletion', timestamp: Date.now() }
	}
});

exports.leaveTeam = functions.https.onCall(async (data, context) => {
	const db = admin.firestore();

	// Reference to the team
	const systemRef = db.collection('system').doc(context.auth.uid);
	const systemDoc = await systemRef.get();
	if (systemDoc?.data()?.team) {
		// We are in a team, time to get out
		const teamRef = systemDoc.data().team;
		const teamDoc = await teamRef.get();
		if (teamDoc?.data()?.owner == context.auth.uid) {
			// We are the room owner, remove ourself directly
			await removeSytemTeamRef(context.auth.uid, teamRef)
			// Update the team to no members to trigger removals for everyone else
			await teamRef.update({
				members: []
			});
			//await db.collection('team').doc(context.auth.uid).delete()
			return { team: false }
		} else {
			// We are just a member
			await userLeaveTeam(context.auth.uid)
			return { team: false }
		}
	} else {
		return { error: 'You are not in a team' }
	}
});

function difference(setA, setB) {
	let _difference = new Set(setA)
	for (let elem of setB) {
		_difference.delete(elem)
	}
	return _difference
}

exports.joinTeam = functions.https.onCall(async (data, context) => {
	const db = admin.firestore();

	// Parameters from request
	const teamId = data.id;
	const password = data.password;

	if (!context?.auth?.uid) {
		return { error: 'No authentication' }
	}

	if (teamId == context.auth.uid) {
		return { error: 'Can\'t join your own team' }
	}

	// Reference to the team
	const teamRef = db.collection('team').doc(teamId);
	const teamDoc = await teamRef.get();
	if (teamDoc?.data()?.password == password) {
		if (teamDoc?.data()?.members.length >= teamDoc?.data()?.maximumMembers) {
			return { error: 'Team is full' }
		}
		// We have the right info, we can join the team
		const systemRef = db.collection('system').doc(context.auth.uid);
		const systemDoc = await systemRef.get();
		if (teamRef.isEqual(systemDoc?.data()?.team)) {
			// We're already in this team
			return { error: 'Already in this team' }
		} else if (systemDoc?.data()?.team) {
			// We're in another team, leave it
			await userLeaveTeam(context.auth.uid)
		}
		// Should be good to join a team now
		systemRef.update({
			team: teamRef
		}, { merge: true })
		const unionRes = await teamRef.update({
			members: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
		});
		return { team: teamId }
	} else {
		return { error: 'Team doesn\'t exist, or incorrect password' }
	}
});

exports.createTeam = functions.https.onCall(async (data, context) => {
	const db = admin.firestore();
	const systemRef = db.collection('system').doc(context.auth.uid);
	const myTeamRef = db.collection('team').doc(context.auth.uid);

	functions.logger.log("Creating team", { owner: context.auth.uid });

	try {
		await db.runTransaction(async (transaction) => {
			const systemDoc = await transaction.get(systemRef);

			// Check if the user is already in a team
			if (systemDoc?.data()?.team) {
				throw new Error('User already in a team')
			}

			// Check if the user's team document exists, if it does, we can't create a team
			const myTeamDoc = await transaction.get(myTeamRef);
			if (myTeamDoc.exists) {
				throw new Error('Team already exists')
			}

			// Generate a random password
			const UIDGenerator = require('uid-generator');
			const uidgen = new UIDGenerator(64);
			const password = await uidgen.generate()

			// Create the team document
			transaction.set(myTeamRef, {
				owner: context.auth.uid,
				password: password,
				maximumMembers: systemDoc.data()?.teamMax || 10,
				members: [context.auth.uid],
				createdAt: admin.firestore.FieldValue.serverTimestamp()
			})

			// Set our team to our own team
			transaction.update(systemRef, {
				team: context.auth.uid
			})
		});
		functions.logger.info("Created team", { owner: context.auth.uid })
		return { team: context.auth.uid }
	} catch (e) {
		functions.logger.error("Failed to create team", { owner: context.auth.uid, error: e });
		return { error: 'Error during team creation', timestamp: Date.now() }
	}


});