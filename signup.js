// Firebase Authentication
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword , GoogleAuthProvider, signInWithPopup , signOut} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAA136fBD1NQEaa_X6PSBp2-W-9PvX541s",
    authDomain: "crypto-tracker-b26cf.firebaseapp.com",
    projectId: "crypto-tracker-b26cf",
    storageBucket: "crypto-tracker-b26cf.firebasestorage.app",
    messagingSenderId: "602351349910",
    appId: "1:602351349910:web:54b857cf388080f41252b7",
    measurementId: "G-E43K8SFMRZ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth();
  const popup  = document.getElementById("popup");
  const complete = document.getElementById("complete");
  const nav_loginBtn = document.getElementById("login");

function logout(){
  const logoutBtn = document.createElement("button");
    logoutBtn.innerText = "Logout";
    logoutBtn.classList.add("logoutBtn");
    logoutBtn.onclick = function() {
      alert("Logging Out!");
      
      // Logout code 	  
        
             signOut(auth).then(() => {
                 console.log('Log-out successful.');
                 logoutBtn.parentNode.replaceChild(nav_loginBtn, logoutBtn); 
                 window.location.href="index.html";
               }).catch((error) => {
                 console.log('An error happened.',error);
               });		  		  
        
    };
    nav_loginBtn.parentNode.replaceChild(logoutBtn, nav_loginBtn); 
}

// SignUp Button
const signupAuth = document.getElementById("signupAuth");

signupAuth.addEventListener("click", function(event){
    event.preventDefault();

    //   Inputs
    var name = document.getElementById("sign-name").value;
    var email = document.getElementById("sign-email").value;
    var password = document.getElementById("sign-pass").value;
    var confirmPassword = document.getElementById("sign-confirmPass").value;

    

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    } else {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    } else {
      createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    console.log(user);
    window.alert("Creating Account...");
    // savetoDatabase(name, email);
    popup.classList.remove("active");
    complete.classList.remove("active");
    logout();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
      alert(errorMessage);
      // ..
    });
  }
}
})

//Sign In With Google!
auth.languageCode='en';
 const provider = new GoogleAuthProvider();

 const googleLogin = document.getElementById("continueWithGoogle");
googleLogin.addEventListener("click",function(event) {
  event.preventDefault();
  signInWithPopup(auth,provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    // window.location.href ="index.html";
    popup.classList.remove("active");
    complete.classList.remove("active");
    logout();
  })
  .catch((error) => {
    const errorMessage = error.message;
    console.log(errorMessage);
    alert(error);
  })
})
// Sign in with metamask
const metamaskLogin = document.getElementById("continueWithMetamask");
metamaskLogin.addEventListener("click",function() {
  if(window.ethereum) {
      window.ethereum.request({
        method:'eth_requestAccounts'
      }).then(result => {
      console.log(result[0]);
      // window.location.href="index_auth.html";
      popup.classList.remove("active");
      complete.classList.remove("active");
      logout();
      })
      } else {
        alert("Please install MetaMask!");
      }
      
})