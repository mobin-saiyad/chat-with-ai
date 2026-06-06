# Love — Next.js App Router + Firebase

Modern real-time chat app built with Next.js 14 (App Router) and Firebase.

## Project Structure

```
love/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (renders ChatShell)
│   └── globals.css       # All styles
├── components/
│   ├── ChatShell.tsx     # Main client shell (auth + chat logic)
│   ├── AuthScreen.tsx    # Login / Register UI
│   ├── Sidebar.tsx       # Left sidebar
│   ├── MessageList.tsx   # Scrollable message feed
│   ├── MessageInput.tsx  # Textarea + image upload + send button
│   └── ConfirmDialog.tsx # Delete confirmation modal
├── lib/
│   └── firebase.ts       # Firebase init — ADD YOUR CONFIG HERE
├── next.config.js
├── tsconfig.json
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Firebase config
Open `lib/firebase.ts` and replace the placeholder values:
```ts
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

### 3. Enable Firebase services

In the Firebase Console, enable:
- **Authentication** → Email/Password sign-in
- **Firestore Database** → Start in production mode
- **Storage** → Default bucket

### 4. Set Firestore rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{id} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.uid;
    }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### 5. Set Storage rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat/{file} {
      allow read:         if request.auth != null;
      allow write, delete: if request.auth != null;
    }
  }
}
```

### 6. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Features
- ✅ Email/password auth (register + login)
- ✅ Real-time messages via Firestore
- ✅ Send photos (multiple at once, with preview)
- ✅ Delete your own messages + their storage files
- ✅ Lightbox for full-size image view
- ✅ Date dividers in message feed
- ✅ Animated message entrance
- ✅ Uploading indicator
- ✅ Responsive sidebar with message count
