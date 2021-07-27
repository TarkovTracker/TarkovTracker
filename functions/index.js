const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

// Export the API functions
exports.apiv1 = require('./api');

async function userLeaveTeam(userId) {
	const db = admin.firestore();
	// Get the user's system doc
	const systemRef = db.collection('system').doc(userId);
	const systemDoc = await systemRef.get();
	if (systemDoc.exists) {
		if (systemDoc.data().team) {
			// Double check and remove us from the members list of the team
			const teamRef = systemDoc.data().team
			await teamRef.set({
			  members: admin.firestore.FieldValue.arrayRemove(userId)
			}, {merge: true});

			// Remove our team reference from our system doc
			await systemRef.set({
			  team: admin.firestore.FieldValue.delete()
			}, {merge: true});
		}
	}
}

// Should probably rewrite this to use firebase transactions
// https://firebase.google.com/docs/firestore/manage-data/transactions
exports.createTeam = functions.region('us-east4', 'us-central1').https.onCall( async (data, context) => {
	const db = admin.firestore();
  	const systemRef = db.collection('system').doc(context.auth.uid);
  	const myTeamRef = db.collection('team').doc(context.auth.uid);
	const systemDoc = await systemRef.get();

	if (systemDoc?.data()?.team && !myTeamRef.isEqual(systemDoc.data().team)) {
		// We're a part of another team, leave it before creating our team
		await userLeaveTeam(context.auth.uid)
	}

	// The state we want, we aren't in a team
	// Generate a random password
	const UIDGenerator = require('uid-generator');
	const uidgen = new UIDGenerator(64);
	const password = await uidgen.generate()
	// Set the initial data in the team document
	myTeamRef.set({
		owner: context.auth.uid,
		password: password,
		maximumMembers: systemDoc.data()?.teamMax || 5,
		members: [context.auth.uid],
		createdAt: admin.firestore.FieldValue.serverTimestamp()
	})

	// Set our team to our own team
	systemRef.set({
		team: myTeamRef
	}, {merge: true})
	return { team: context.auth.uid }
});

exports.joinTeam = functions.region('us-east4', 'us-central1').https.onCall( async (data, context) => {
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
	if(teamDoc?.data()?.password == password){
		if (teamDoc?.data()?.members.length >= teamDoc?.data()?.maximumMembers) {
			return { error: 'Team is full' }
		}
		// We have the right info, we can join the team
		const systemRef = db.collection('system').doc(context.auth.uid);
		const systemDoc = await systemRef.get();
		if (teamRef.isEqual(systemDoc?.data()?.team)) {
			// We're already in this team
			return { error: 'Already in this team' }
		}else if(systemDoc?.data()?.team) {
			// We're in another team, leave it
			await userLeaveTeam(context.auth.uid)
		}
		// Should be good to join a team now
		systemRef.update({
		  team: teamRef
		}, {merge: true})
		const unionRes = await teamRef.update({
		  members: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
		});
		return { team: teamId }
	}else{
		return { error: 'Team doesn\'t exist, or incorrect password' }
	}
});

exports.kickTeammate = functions.region('us-east4', 'us-central1').https.onCall( async (data, context) => {
	const db = admin.firestore();

	const teammateId = data.id;

	const myTeamRef = db.collection('team').doc(context.auth.uid);
	const myTeamDoc = await myTeamRef.get();

	if (myTeamDoc?.data()?.members.includes(teammateId)) {
		await userLeaveTeam(teammateId)
		return { success: true }
	}else {
		return { error: 'User not in team or you do not have permission to kick' }
	}
});


exports.leaveTeam = functions.region('us-east4', 'us-central1').https.onCall( async (data, context) => {
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
		}else{
			// We are just a member
			await userLeaveTeam(context.auth.uid)
			return { team: false }
		}
	}else{
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

// Removes the system team ref to a team if it matches
async function removeSytemTeamRef(userId, teamRef) {
	const db = admin.firestore();
	const systemRef = db.collection('system').doc(userId);
	const systemDoc = await systemRef.get();
	if (systemDoc.exists) {
		// System doc exists, check to see if we are set to this team
		if (systemDoc.data().team && teamRef.isEqual(systemDoc.data().team)) {
			// We're set to the specified team ref, so lets remove ourself.
			return systemRef.set({
			  team: admin.firestore.FieldValue.delete(),
			  lastTeamLeave: admin.firestore.FieldValue.serverTimestamp()
			}, {merge: true})
		}
	}else{
		// Cool - no system doc exists so it doesn't matter
		return new Promise(() => {})
	}
}

exports.teamChanged = functions.region('us-east4', 'us-central1').firestore
    .document('team/{teamId}')
    .onWrite(async (change, context) => {
      var removedMembers = difference(new Set(change.before.data()?.members), new Set(change.after.data()?.members))
      // Loop through the removed members, and ensure they're all out of the team properly
      removedMembers.forEach(async (member) => {
      	await removeSytemTeamRef(member, change.before.ref)
      }, this)
});

exports.createToken = functions.region('us-east4', 'us-central1').https.onCall( async (data, context) => {
	const db = admin.firestore();

	if ( data.note == null || !(data.permissions.length > 0)) {
		return { error: 'Invalid token parameters' }
	}

  	const systemRef = db.collection('system').doc(context.auth.uid);
	const systemDoc = await systemRef.get();

	if (systemDoc?.data()?.tokens?.length >= 5) {
		// We have too many tokens already
		return { error: 'You have the maximum number of tokens' }
	}

	// Generate a random token
	const UIDGenerator = require('uid-generator');
	const uidgen = new UIDGenerator(128);
	const token = await uidgen.generate()

	const tokenRef = db.collection('token').doc(token);
	const tokenDoc = await tokenRef.get();
	if (tokenDoc.exists) {
		// Somehow the generator hit an existing Id in 2^128 possibilities
		return { error: 'Play the lottery' }
	}else{
		// Create a token document
		tokenRef.set({
			owner: context.auth.uid,
			note: data.note,
			permissions: data.permissions,
			token: token,
			calls: 0,
			createdAt: admin.firestore.FieldValue.serverTimestamp()
		})
	}

	// Reference the token from our system doc
	const unionRes = await systemRef.update({
	  tokens: admin.firestore.FieldValue.arrayUnion(tokenRef)
	});

	return { token: token }
});

exports.revokeToken = functions.region('us-east4', 'us-central1').https.onCall( async (data, context) => {
	const db = admin.firestore();

	if ( data.token == null) {
		return { error: 'Invalid token parameters' }
	}

  	const systemRef = db.collection('system').doc(context.auth.uid);
	const systemDoc = await systemRef.get();
	const tokenRef = db.collection('token').doc(data.token);
	const tokenDoc = await tokenRef.get();

	if (!tokenDoc.exists || tokenDoc.data().owner != context.auth.uid) {
		// We have too many tokens already
		return { error: 'This is not one of your tokens' }
	}else{
		const tokenRef = db.collection('token').doc(data.token);
		await systemRef.set({
		  tokens: admin.firestore.FieldValue.arrayRemove(tokenRef)
		}, {merge: true});
		await tokenRef.delete()
		return { revoked: true }
	}
});

exports.deletedUserCleanup = functions.region('us-east4', 'us-central1').firestore
    .document('system/{userId}')
    .onDelete(async (snap, context) => {
      const db = admin.firestore();
      if(snap.data().tokens) {
      	// Create promises to remove each token
      	var tokenPromises = []
      	snap.data().tokens.forEach((token) => {
      		tokenPromises.push(db.collection('token').doc(token).delete())
      	})
      	// Await for all the promises to finish
      	await Promise.all(tokenPromises)
      }
      if(snap.data().team) {
      	// We had a team value, make sure we aren't in that team any more
      	return snap.data().team.set({
			  members: admin.firestore.FieldValue.arrayRemove(context.params.userId)
		}, {merge: true});
      }else{
      	return new Promise(() => {})
      }
});

// If a token is deleted on its own, make sure its removed from the system document
exports.deletedTokenCleanup = functions.region('us-east4', 'us-central1').firestore
.document('token/{tokenId}')
.onDelete(async (snap, context) => {
    const db = admin.firestore();
    const systemRef = db.collection('system').doc(snap.data().owner);
    const tokenRef = db.collection('token').doc(context.params.tokenId);
	await systemRef.set({
		tokens: admin.firestore.FieldValue.arrayRemove(tokenRef)
	}, {merge: true});
});

exports.setUpTTUser = functions.region('us-east4', 'us-central1').auth.user().onCreate((user) => {
    const db = admin.firestore();
    const systemRef = db.collection('system').doc(user.uid);
    return systemRef.set({
	  	firstSeen: admin.firestore.FieldValue.serverTimestamp()
    }, {merge: true})
});