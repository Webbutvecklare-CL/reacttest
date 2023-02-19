import { firestore } from "../firebase/clientApp";
import { getDoc, setDoc, doc, updateDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";

function googleLogin() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    hd: "cl-sektionen.se",
    login_hint: "post@cl-sektionen.se",
  });

  const auth = getAuth();
  return signInWithPopup(auth, provider);
}

async function validateAccountCheck(user) {
  console.log("getDoc - Get user validate");
  // Försöker hämta användaren
  const userRef = doc(firestore, "users", user.uid);
  let docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    if (!docSnap.data().committee || !docSnap.data().permission) {
      console.log(
        "Du saknar tillhörighet till någon nämnd eller behörighet att komma åt personalrummet."
      );
      return false;
    }
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("UID hittades inte!");
    return false;
  }
}

async function createUser(user) {
  console.log("setDoc - Skapar användare");
  let profileInfo = {
    displayName: user.displayName,
    email: user.email,
    permission: null,
    committee: null,
  };

  const userRef = doc(firestore, "users", user.uid);
  try {
    await setDoc(userRef, profileInfo);
    console.log("Uppgifter sparade!");
    return true;
  } catch (err) {
    throw err;
  }
}

async function updateUser(user) {
  console.log("updateDoc - Update user");
  let profileInfo = {
    displayName: user.displayName,
    email: user.email,
  };

  const userRef = doc(firestore, "users", user.uid);

  return updateDoc(userRef, profileInfo);
}

export { googleLogin, validateAccountCheck, createUser, updateUser };
