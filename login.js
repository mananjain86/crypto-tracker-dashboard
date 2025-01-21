// Firebase Authentication
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
  import { getAuth, signInWithPopup} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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


// Login Button
// function logout(){
//   // const logoutBtn = document.createElement("button");
//   //   logoutBtn.innerText = "Logout";
//   //   logoutBtn.classList.add("logoutBtn");
//   //   logoutBtn.onclick = function() {
//   //     alert("Logging Out!");
//   //     // Logout code 	  
        
//              signOut(auth).then(() => {
//                  console.log('Log-out successful.');
//              //    logoutBtn.parentNode.replaceChild(nav_loginBtn, logoutBtn); 
//                  window.location.href="index.html";
//                }).catch((error) => {
//                  console.log('An error happened.',error);
//                });		  		  
        
//     };
//    // nav_loginBtn.parentNode.replaceChild(logoutBtn, nav_loginBtn); 
// //}

auth.languageCode='en';

 const googleLogin = document.getElementById("continueWithGoogle");
googleLogin.addEventListener("click",function(event) {
  event.preventDefault();
  signInWithPopup(auth,provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    console.log(user);    
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

// Authorization through Metamask
const metamaskLogin = document.getElementById("continueWithMetamask");
metamaskLogin.addEventListener("click",function(event) {
  event.preventDefault();
  if(window.ethereum) {
      window.ethereum.request({
        method:'eth_requestAccounts'
      }).then(result => {
      console.log(result[0]);
      popup.classList.remove("active");
      complete.classList.remove("active");
      alert("logging in with metamask")
      logout();
    })
      } else {
        alert("Please install MetaMask!");
      }
})

// onAuthStateChanged(auth, (user) => {
//   if(user){
//     nav_loginBtn.textContent = "Logout";  
//     nav_loginBtn.addEventListener("click", ()=>{
//       signOut(auth).then(() => {
//         console.log('Log-out successful.');
//         window.location.href="index.html";
//       }).catch((error) => {
//         console.log('An error happened.',error);
//       });	
//     });
//    } else {
//     const loginAuth = document.getElementById("loginAuth");
//     nav_loginBtn.textContent = "Login";
//     loginAuth.addEventListener("click", function(event){
//       event.preventDefault();
//       //   Inputs
//       var email = document.getElementById("email").value;
//       var password = document.getElementById("password").value;
//       signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//       // Signed up 
//       const user = userCredential.user;
//       console.log(user);
//       window.alert("Logging In...");
//       popup.classList.remove("active");
//       complete.classList.remove("active");
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       console.log(errorMessage);
//       alert(errorMessage);
//       // ..
//     });
//   });
//    }
// });