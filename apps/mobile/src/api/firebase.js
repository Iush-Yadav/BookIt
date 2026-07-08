import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential } from "firebase/auth";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID", // Replace with your Firebase Web Client ID
});

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyPlaceholderKeyForFirebase123",
  authDomain: "bookit-placeholder.firebaseapp.com",
  projectId: "bookit-placeholder",
  storageBucket: "bookit-placeholder.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (Platform.OS === "web") {
    return await signInWithPopup(auth, googleProvider);
  } else {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    // userInfo in recent versions has data.idToken, or just idToken depending on version.
    // The version installed is likely v13+ which returns { data: { idToken } }
    const idToken = userInfo?.data?.idToken || userInfo.idToken;
    const credential = GoogleAuthProvider.credential(idToken);
    return await signInWithCredential(auth, credential);
  }
}
