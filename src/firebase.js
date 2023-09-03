// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMosjow7Yp7FSZqk82NbdUDnkQxgxQq_U",
  authDomain: "ludo-c2a8d.firebaseapp.com",
  projectId: "ludo-c2a8d",
  storageBucket: "ludo-c2a8d.appspot.com",
  messagingSenderId: "201142783868",
  appId: "1:201142783868:web:02b9ff6dec674bbe3e9ef9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };