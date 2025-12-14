# Manage Test Users Scripts

This directory contains scripts to manage test users for LocalLoop.

## Scripts

### 1. `createUsers.js` - Create Test Users
Creates 10 test users for LocalLoop:
- 5 Hosts (3 in Germany, 2 in China)
- 5 Visitors (3 in Germany, 2 in China)

### 2. `deleteAllUsers.js` - Delete All Users
Deletes all users from both Firebase Auth and Firestore.

## Prerequisites

1. **Firebase Admin SDK Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project (localloop-auth)
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in this directory

2. **Install Dependencies**
   ```bash
   npm install firebase-admin
   ```

## Usage

### To Delete All Existing Users
```bash
node deleteAllUsers.js
```

### To Create New Test Users
```bash
node createUsers.js
```

## What It Creates

Each user has:
- **Random name** from a pool of first and last names
- **Email**: `firstname.lastname.number@localloop.test`
- **Password**: `TestPassword123!` (same for all test users)
- **Age**: Random between 18-50
- **Gender**: Random (male/female/other)
- **Bio**: Random from a pool of realistic bios
- **Languages Spoken**: 2-4 random languages with proficiency levels (A1-C2)
- **Languages to Learn**: 1-3 random languages with target proficiency levels (A1-C2)
- **Interests**: 3-6 random interests
- **Photo**: Placeholder avatar from pravatar.cc
- **Location**: Random city in Germany or China with real coordinates
- **Role**: Host or Visitor

## Language Proficiency Levels (CEFR)
- **A1**: Beginner
- **A2**: Elementary
- **B1**: Intermediate
- **B2**: Upper Intermediate
- **C1**: Advanced
- **C2**: Proficient/Native

## Test Credentials

After running the script, you can log in with any created user:
- **Email**: Check console output for created emails
- **Password**: `TestPassword123!` (for all users)

Example emails:
- `emma.smith.1@localloop.test`
- `liam.johnson.2@localloop.test`
- etc.

## Cities Included

### Germany
- Berlin
- Munich
- Hamburg
- Frankfurt
- Cologne

### China
- Beijing
- Shanghai
- Guangzhou
- Shenzhen
- Chengdu

## Notes

- All users have real coordinates for accurate distance calculations
- Geohashes are generated for efficient location queries
- Users are distributed between countries
- Each user has unique email and realistic data
- Script uses Firebase Admin SDK for direct database access
- Languages are randomly assigned with proficiency levels

## Recommended Workflow

1. **Delete old users**: `node deleteAllUsers.js`
2. **Create new users**: `node createUsers.js`
3. **Test the app** with the new user data

