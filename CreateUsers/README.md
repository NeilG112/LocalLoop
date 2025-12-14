# Create Test Users Script

This script creates 50 test users for LocalLoop:
- 25 Hosts (13 in Germany, 12 in China)
- 25 Visitors (13 in Germany, 12 in China)

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

1. Place your `serviceAccountKey.json` in this directory
2. Run the script:
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
- **Languages**: 2-4 random languages
- **Interests**: 3-6 random interests
- **Photo**: Placeholder avatar from pravatar.cc
- **Location**: Random city in Germany or China with real coordinates
- **Role**: Host or Visitor

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
- Users are distributed evenly between countries
- Each user has unique email and realistic data
- Script uses Firebase Admin SDK for direct database access

## Cleanup

To delete all test users later, you can:
1. Go to Firebase Console → Authentication
2. Filter by email domain: `@localloop.test`
3. Delete users in bulk
4. Or use Firebase Admin SDK to delete programmatically
