const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Creates a new user account with a random password.
 * Can only be called by an authenticated user. The function should have
 * security rules to ensure only the admin can trigger it successfully.
 */
exports.createUserAccount = functions.https.onCall(async (data, context) => {
  // Check if the caller is the admin.
  if (context.auth.token.email !== "ahmetnasan1993@gmail.com") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only the admin can create new user accounts.",
    );
  }

  const email = data.email;
  if (!email) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with one argument 'email'.",
    );
  }

  try {
    // Create the user with a temporary random password
    const tempPassword = Math.random().toString(36).slice(-8);
    const userRecord = await admin.auth().createUser({
      email: email,
      password: tempPassword,
      emailVerified: true, // Or false, depending on your flow
    });

    // Optional: Send a welcome email with the temporary password.
    // This requires setting up an email service like SendGrid/Mailgun.
    // For now, you will need to communicate the password manually.

    console.log("Successfully created new user:", userRecord.uid);
    // You could also send them a password reset email immediately
    // await admin.auth().generatePasswordResetLink(email);

    return {
      success: true,
      message: `User ${email} created with UID ${userRecord.uid}.`,
    };
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new functions.https.HttpsError("internal", error.message, error);
  }
});
