const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Creates a user account and updates the corresponding access request.
 * Can only be called by the admin.
 */
exports.createUserAccount = functions.https.onCall(async (data, context) => {
    // 1. Check if the caller is the admin.
    if (context.auth.token.email !== "ahmetnasan1993@gmail.com") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only the admin can approve new user accounts.",
        );
    }

    // 2. Validate input data.
    const email = data.email;
    const requestId = data.requestId;
    if (!email || !requestId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with 'email' and 'requestId'.",
        );
    }

    try {
        // 3. Create the user with a temporary random password.
        const tempPassword = Math.random().toString(36).slice(-8);
        const userRecord = await admin.auth().createUser({
            email: email,
            password: tempPassword,
            emailVerified: true,
        });

        // 4. Update the request status in Firestore.
        const requestRef = db.collection("accessRequests").doc(requestId);
        await requestRef.update({
            status: "approved",
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: context.auth.token.email,
        });

        // Optional: Send a welcome email to the user with their temporary password.
        // This requires setting up an email service. For now, you must send it manually.
        console.log(`User ${email} created. Temporary Password: ${tempPassword}`);

        // 5. Return a success message.
        return {
            success: true,
            message: `User ${email} created successfully. Their temporary password is ${tempPassword}.`,
        };
    } catch (error) {
        console.error("Error creating new user:", error);
        // Throw a specific error for existing users
        if (error.code === 'auth/email-already-exists') {
             throw new functions.https.HttpsError("already-exists", "This email is already registered.");
        }
        throw new functions.https.HttpsError("internal", error.message, error);
    }
});
