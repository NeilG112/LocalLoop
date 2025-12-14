// Script to create 50 test users for LocalLoop
// 25 Hosts and 25 Visitors split between China and Germany

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this from Firebase Console

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Sample data
const GERMAN_CITIES = [
    { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
    { city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820 },
    { city: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937 },
    { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821 },
    { city: 'Cologne', country: 'Germany', lat: 50.9375, lng: 6.9603 },
];

const CHINESE_CITIES = [
    { city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
    { city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737 },
    { city: 'Guangzhou', country: 'China', lat: 23.1291, lng: 113.2644 },
    { city: 'Shenzhen', country: 'China', lat: 22.5431, lng: 114.0579 },
    { city: 'Chengdu', country: 'China', lat: 30.5728, lng: 104.0668 },
];

const FIRST_NAMES = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
    'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
    'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'David', 'Avery',
    'Joseph', 'Ella', 'Samuel', 'Scarlett', 'Sebastian', 'Grace', 'Jack',
    'Chloe', 'Owen', 'Victoria', 'Theodore', 'Riley', 'Aiden', 'Aria',
    'Jackson', 'Lily', 'Luke', 'Aubrey', 'Gabriel', 'Zoey', 'Anthony'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Lewis',
    'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott',
    'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson',
    'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'];

const INTERESTS = ['Art', 'Music', 'Food', 'Sports', 'Travel', 'History', 'Nature', 'Photography', 'Movies', 'Tech', 'Fashion', 'Nightlife'];

const BIOS = [
    "Love exploring new places and meeting interesting people! Always up for an adventure.",
    "Passionate about local culture and authentic experiences. Let's discover hidden gems together!",
    "Foodie at heart 🍜 Looking to share the best local spots and try new cuisines.",
    "Outdoor enthusiast who loves hiking, cycling, and nature. Let's explore the great outdoors!",
    "Art and history buff. Would love to show you the cultural side of my city.",
    "Music lover and concert goer. Always looking for the next great live show!",
    "Tech professional who enjoys photography and coffee. Let's grab a cup and chat!",
    "Friendly local who loves showing visitors around. Ask me anything about the city!",
    "Travel addict seeking authentic local experiences. Let's exchange stories!",
    "Sports fan and fitness enthusiast. Down for any outdoor activity!",
];

// Helper function to get random item from array
function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Helper function to generate random age
function getRandomAge() {
    return Math.floor(Math.random() * (50 - 18 + 1)) + 18; // 18-50
}

// Simple geohash encoding (you can use a library like ngeohash instead)
function encodeGeohash(lat, lng, precision = 9) {
    const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let idx = 0;
    let bit = 0;
    let evenBit = true;
    let geohash = '';
    let latMin = -90, latMax = 90;
    let lngMin = -180, lngMax = 180;

    while (geohash.length < precision) {
        if (evenBit) {
            const lngMid = (lngMin + lngMax) / 2;
            if (lng > lngMid) {
                idx = (idx << 1) + 1;
                lngMin = lngMid;
            } else {
                idx = idx << 1;
                lngMax = lngMid;
            }
        } else {
            const latMid = (latMin + latMax) / 2;
            if (lat > latMid) {
                idx = (idx << 1) + 1;
                latMin = latMid;
            } else {
                idx = idx << 1;
                latMax = latMid;
            }
        }
        evenBit = !evenBit;

        if (++bit === 5) {
            geohash += BASE32[idx];
            bit = 0;
            idx = 0;
        }
    }

    return geohash;
}

// Create a single user
async function createUser(role, location, index) {
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@localloop.test`;
    const password = 'TestPassword123!'; // Same password for all test users

    try {
        // Create auth user
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: name,
        });

        console.log(`✓ Created auth user: ${email}`);

        // Create Firestore profile
        const profileData = {
            email: email,
            name: name,
            age: getRandomAge(),
            gender: getRandom(['male', 'female', 'other']),
            bio: getRandom(BIOS),
            languages: getRandomItems(LANGUAGES, Math.floor(Math.random() * 3) + 2), // 2-4 languages
            interests: getRandomItems(INTERESTS, Math.floor(Math.random() * 4) + 3), // 3-6 interests
            photos: [
                `https://i.pravatar.cc/400?img=${index}`, // Using placeholder avatar service
            ],
            role: role,
            location: {
                city: location.city,
                country: location.country,
                coordinates: {
                    lat: location.lat,
                    lng: location.lng,
                },
                geohash: encodeGeohash(location.lat, location.lng),
            },
            preferences: {
                radiusPreference: 50,
                genderPreference: 'any',
                agePreference: { min: 18, max: 60 },
            },
            blockedUsers: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('users').doc(userRecord.uid).set(profileData);

        console.log(`✓ Created profile for: ${name} (${role}) in ${location.city}, ${location.country}`);

        return { success: true, email, password, name, role, location: location.city };
    } catch (error) {
        console.error(`✗ Error creating user ${email}:`, error.message);
        return { success: false, email, error: error.message };
    }
}

// Main function to create all users
async function createAllUsers() {
    console.log('🚀 Starting user creation...\n');

    const results = [];
    let userIndex = 1;

    // Create 25 Hosts (12-13 in Germany, 12-13 in China)
    console.log('Creating Hosts...');
    for (let i = 0; i < 25; i++) {
        const location = i < 13 ? getRandom(GERMAN_CITIES) : getRandom(CHINESE_CITIES);
        const result = await createUser('host', location, userIndex++);
        results.push(result);
    }

    console.log('\nCreating Visitors...');
    // Create 25 Visitors (12-13 in Germany, 12-13 in China)
    for (let i = 0; i < 25; i++) {
        const location = i < 13 ? getRandom(GERMAN_CITIES) : getRandom(CHINESE_CITIES);
        const result = await createUser('visitor', location, userIndex++);
        results.push(result);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✓ Successfully created: ${successful.length} users`);
    console.log(`✗ Failed: ${failed.length} users`);

    if (successful.length > 0) {
        console.log('\n📝 Test User Credentials:');
        console.log('Email: [any of the created emails]');
        console.log('Password: TestPassword123!');
        console.log('\nSample users:');
        successful.slice(0, 5).forEach(user => {
            console.log(`  - ${user.email} (${user.role} in ${user.location})`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed users:');
        failed.forEach(user => {
            console.log(`  - ${user.email}: ${user.error}`);
        });
    }

    console.log('\n✅ User creation complete!');
    process.exit(0);
}

// Run the script
createAllUsers().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
