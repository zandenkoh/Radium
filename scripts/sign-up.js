let isProcessing = false;

// Function to sign up
const signUp = (email, password) => {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            console.log('User signed up:', user);
            // Save a flag to local storage
            localStorage.setItem('signedIn', 'true');
            // Redirect to log-in page
            window.location.href = 'profile.html';
        })
        .catch((error) => {
            console.error('Error signing up:', error);
            document.getElementById('error-message').textContent = error.message;
        })
        .finally(() => {
            // Reset processing state and re-enable button
            isProcessing = false;
            document.getElementById('sign-up-button').disabled = false;
        });
};

// Add event listener to sign-up form
document.getElementById('sign-up-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (isProcessing) return;

    isProcessing = true;
    document.getElementById('sign-up-button').disabled = true;

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signUp(email, password);
});
/*
// Check if user is already signed in on page load
window.onload = function() {
    if (localStorage.getItem('signedIn') === 'true') {
        // Redirect to index.html
        window.location.href = 'index.html';
    }
};*/
