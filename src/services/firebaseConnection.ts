
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: "AIzaSyDPZ-to1FepYlVF5GFm0halgeTvCzrnang",
  authDomain: "webcarros-dd45a.firebaseapp.com",
  projectId: "webcarros-dd45a",
  storageBucket: "webcarros-dd45a.firebasestorage.app",
  messagingSenderId: "612125770113",
  appId: "1:612125770113:web:ade18fd8968b523508a880"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app);

export { db, auth }
