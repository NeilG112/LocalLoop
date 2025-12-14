// Script to delete all test users from LocalLoop
// This will delete both Auth users and Firestore profiles

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Delete all users
async function deleteAllUsers() {
    console.log('🗑️  Starting user deletion...\n');

    try {
        // Get all Firestore users
        console.log('Fetching all users from Firestore...');
        const usersSnapshot = await db.collection('users').get();
        console.log(`Found ${usersSnapshot.size} users in Firestore`);

        // Delete Firestore profiles
        console.log('\nDeleting Firestore profiles...');
        const batch = db.batch();
        usersSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✓ Deleted ${usersSnapshot.size} Firestore profiles`);

        // Delete Auth users
        console.log('\nDeleting Auth users...');
        let deletedCount = 0;
        let errorCount = 0;

        // List all users
        const listAllUsers = async (nextPageToken) => {
            const result = await auth.listUsers(1000, nextPageToken);

            for (const userRecord of result.users) {
                try {
                    await auth.deleteUser(userRecord.uid);
                    deletedCount++;
                    if (deletedCount % 10 === 0) {
                        console.log(`  Deleted ${deletedCount} auth users...`);
                    }
                } catch (error) {
                    console.error(`  ✗ Error deleting user ${userRecord.email}:`, error.message);
                    errorCount++;
                }
            }

            if (result.pageToken) {
                await listAllUsers(result.pageToken);
            }
        };

        await listAllUsers();

        console.log('\n' + '='.repeat(60));
        console.log('📊 DELETION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✓ Firestore profiles deleted: ${usersSnapshot.size}`);
        console.log(`✓ Auth users deleted: ${deletedCount}`);
        if (errorCount > 0) {
            console.log(`✗ Errors: ${errorCount}`);
        }
        console.log('\n✅ User deletion complete!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }

    process.exit(0);
}

// Run the script
deleteAllUsers().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
