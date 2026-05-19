import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAVVMB389cZ6AlZlgmQl4DmJGl9Iuqc8ls",
  authDomain: "biriktir-app-c5d16.firebaseapp.com",
  projectId: "biriktir-app-c5d16",
  storageBucket: "biriktir-app-c5d16.firebasestorage.app",
  messagingSenderId: "395595005221",
  appId: "1:395595005221:web:c72ac7a06ad8c3e66a6ecc",
};


const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);