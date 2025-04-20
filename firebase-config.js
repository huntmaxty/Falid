// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_WGj92eLXpZkFcECGij4q6q2nOHHBNaU",
  authDomain: "magistro-3e355.firebaseapp.com",
  projectId: "magistro-3e355",
  storageBucket: "magistro-3e355.firebasestorage.app",
  messagingSenderId: "282094079424",
  appId: "1:282094079424:web:75251b079963f3d2c70c25",
  measurementId: "G-W6H88EPZKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Exportar o objeto auth para uso global
window.firebase = {
  auth: () => auth
};
