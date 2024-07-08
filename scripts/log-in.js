// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBsG6KOqNFSmgmW5FFdEdnvIegKYFdaFko",
    authDomain: "logz-6b051.firebaseapp.com",
    projectId: "logz-6b051",
    storageBucket: "logz-6b051.appspot.com",
    messagingSenderId: "821932097794",
    appId: "1:821932097794:web:0bfc112f5ccdd12b39421b"
};
firebase.initializeApp(firebaseConfig);

// Function to sign in
const signIn = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User signed in:', user);
            // Save a flag to local storage
            localStorage.setItem('signedIn', 'true');
            // Redirect to home page or update UI
            window.location.href = 'index.html';
        })
        .catch((error) => {
            let errorMessage = 'Error signing in';
            if (error.code === 'auth/user-not-found') {
                errorMessage = "This user doesn't exist";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password";
            }
            console.error('Error signing in:', error);
            document.getElementById('error-message').textContent = errorMessage;
        });
};

// Add event listener to sign-in form
document.getElementById('sign-in-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signIn(email, password);
});


// Check if user is already signed in on page load
window.onload = function() {
    if (localStorage.getItem('signedIn') === 'true') {
        // Redirect to index.html
        window.location.href = 'index.html';
    }
};
