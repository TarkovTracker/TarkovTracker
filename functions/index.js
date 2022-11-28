// eslint-disable-next-line no-unused-vars
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Export the v2 API
//exports.apiv2 = require('./api/v2/index.js');

// Create an API token for the user
// This is a Firebase callable function (not part of the REST API)
exports.createToken = functions.https.onCall( async (data, context) => {
  const db = admin.firestore();

  functions.logger.log("createToken called with data:", data);
  
	if ( data.note == null || !(data.permissions.length > 0)) {
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
			createdAt: admin.firestore.FieldValue.serverTimestamp()
		})
	}

	// Reference the token from our system doc
	const unionRes = await systemRef.update({
	  tokens: admin.firestore.FieldValue.arrayUnion(tokenRef)
	});

	return { token: token }
});

// Remove an API token for the user
// This is a Firebase callable function (not part of the REST API)
exports.revokeToken = functions.https.onCall( async (data, context) => {
	const db = admin.firestore();

	if ( data.token == null) {
		return { error: 'Invalid token parameters' }
	}

  const systemRef = db.collection('system').doc(context.auth.uid);
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