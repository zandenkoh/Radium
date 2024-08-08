document.addEventListener('DOMContentLoaded', (event) => {
    event.preventDefault();

    const signInForm = document.getElementById('sign-in-form');
    const signInButton = document.getElementById('sign-in-button');
    const overlay = document.getElementById('overlay');
    const closeButton = document.getElementById('close-button');
    const closeCButton = document.getElementById('close-c-button');
    const profileContent = document.getElementById('profile-content');
    const createAccountButton = document.getElementById('create-account-button');
    const profileBioInput = document.getElementById('profile-bio');
    const charCount = document.getElementById('char-count');

    signInButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (signInForm.style.display === 'none' || signInForm.style.display === '') {
            signInForm.style.display = 'block';
            overlay.style.display = 'block';
            document.getElementById('email').focus();
        } else {
            signInForm.style.display = 'none';
            overlay.style.display = 'none';
        }
    });

    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        signInForm.style.display = 'none';
        overlay.style.display = 'none';
        profileContent.style.display = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });

    closeCButton.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.style.display = 'none';
        profileContent.style.display = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });

    createAccountButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (profileContent.style.display === 'none' || profileContent.style.display === '') {
            profileContent.style.display = 'block';
            overlay.style.display = 'block';
            document.getElementById('profile-name').focus();
        } else {
            profileContent.style.display = 'none';
            overlay.style.display = 'none';
        }
    });

    profileBioInput.addEventListener('input', () => {
        const remaining = 300 - profileBioInput.value.length;
        charCount.textContent = `${remaining}/300`;
    });
});

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

let isProcessing = false;

// Function to sign in
const signIn = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User signed in:', user);
            localStorage.setItem('signedIn', 'true');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            let errorMessage = "Error logging in";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "This user doesn't exist";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password";
            }
            console.error('Error signing in:', error);
            document.getElementById('error-message').textContent = errorMessage;
            document.getElementById('log-in-button').textContent = 'Log in';
        })
        .finally(() => {
            isProcessing = false;
            document.getElementById('log-in-button').disabled = false;
        });
};

// Add event listener to sign-in form
document.getElementById('sign-in-form-submit').addEventListener('submit', function(event) {
    event.preventDefault();

    if (isProcessing) return;

    isProcessing = true;
    document.getElementById('log-in-button').disabled = true;
    document.getElementById('log-in-button').textContent = 'Logging you in...';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signIn(email, password);
});
/*
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const profileBirthdateInput = document.getElementById('profile-date');
const profileBioInput = document.getElementById('profile-bio');
const profilePasswordInput = document.getElementById('profile-password');
const profileImage = document.getElementById('profile-image');
const changeImageBtn = document.getElementById('change-image-btn');
const imageUpload = document.getElementById('image-upload');
const signUpBtn = document.getElementById('sign-up-btn');
const pleaseEnsure = document.getElementById('please-ensure');

let currentStep = 1;
let profileImageUrl = '';
let isImageUploaded = false;

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

const showStep = (step) => {
    document.querySelectorAll('.step').forEach((element) => {
        element.style.display = 'none';
    });
    document.getElementById(`step-${step}`).style.display = 'block';
};

const saveToLocalStorage = () => {
    localStorage.setItem('profileName', profileNameInput.value.trim());
    localStorage.setItem('profileEmail', profileEmailInput.value.trim());
    localStorage.setItem('profileBirthdate', profileBirthdateInput.value.trim());
    localStorage.setItem('profileBio', profileBioInput.value.trim());
    localStorage.setItem('profilePassword', profilePasswordInput.value.trim());
};

document.getElementById('next-step-1').addEventListener('click', e => {
    e.preventDefault();
    if (profileNameInput.value.trim() !== '' &&
        profileEmailInput.value.trim() !== '' &&
        profileBirthdateInput.value.trim() !== '') {
        saveToLocalStorage();
        currentStep = 2;
        showStep(currentStep);
    }
    signUpBtn.disabled = 'true';
});

document.getElementById('next-step-2').addEventListener('click', (event) => {
    event.preventDefault();
    if (profilePasswordInput.value.trim() !== '') {
        saveToLocalStorage();
        currentStep = 3;
        showStep(currentStep);
    }
});

document.getElementById('next-step-3').addEventListener('click', (event) => {
    event.preventDefault();
    if (profileBioInput.value.trim() !== '') {
        saveToLocalStorage();
        currentStep = 4;
        showStep(currentStep);
        if (isImageUploaded) {
            signUpBtn.style.display = 'block';
        }
    }
});

changeImageBtn.addEventListener('click', (event) => {
    event.preventDefault();
    imageUpload.click();
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const storageRef = storage.ref(`profilePictures/${auth.currentUser.uid}/${file.name}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', null, (error) => {
            console.error('Upload error:', error);
        }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                profileImage.src = downloadURL;
                profileImageUrl = downloadURL;
                isImageUploaded = true;
                if (currentStep === 3) {
                    signUpBtn.style.display = 'block';
                }
                localStorage.setItem('profileImageUrl', profileImageUrl);
            }).catch((error) => {
                console.error('Error getting download URL:', error);
            });
        });
    }
});

signUpBtn.addEventListener('click', (event) => {
    event.preventDefault();

    if (isProcessing) return;

    isProcessing = true;
    document.getElementById('sign-up-button').disabled = true;

    const email = localStorage.getItem('profileEmail');
    const password = localStorage.getItem('profilePassword');
    signUp(email, password);
});

const loadFromLocalStorage = () => {
    profileNameInput.value = localStorage.getItem('profileName') || '';
    profileEmailInput.value = localStorage.getItem('profileEmail') || '';
    profileBirthdateInput.value = localStorage.getItem('profileBirthdate') || '';
    profileBioInput.value = localStorage.getItem('profileBio') || '';
    profilePasswordInput.value = localStorage.getItem('profilePassword') || '';
    profileImageUrl = localStorage.getItem('profileImageUrl') || '';
    if (profileImageUrl) {
        profileImage.src = profileImageUrl;
        isImageUploaded = true;
    }
};

const signUp = (email, password) => {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User created:', user);

            const profileData = {
                name: localStorage.getItem('profileName'),
                email: localStorage.getItem('profileEmail'),
                birthdate: localStorage.getItem('profileBirthdate'),
                bio: localStorage.getItem('profileBio'),
                imageUrl: profileImageUrl
            };

            return firestore.collection('users').doc(user.uid).set(profileData);
        })
        .then(() => {
            localStorage.clear();
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing up:', error);
            pleaseEnsure.textContent = 'Please ensure the required fields are filled';
        })
        .finally(() => {
            isProcessing = false;
            document.getElementById('sign-up-button').disabled = false;
        });
};

showStep(currentStep);
loadFromLocalStorage();
*/

document.addEventListener('DOMContentLoaded', function () {
    let currentStep = 1;
    const steps = document.querySelectorAll('.step');
    const profileContent = document.getElementById('profile-content');
    const pleaseEnsure = document.getElementById('please-ensure');

    const signUpButton = document.getElementById('sign-up-btn');
    signUpButton.disabled = true;

    // Show the profile content when the "Create account" button is clicked
    document.getElementById('create-account-button').addEventListener('click', function () {
        profileContent.style.display = 'block';
        showStep(currentStep);
    });

    // Move to the next step when the "Next" button is clicked
    document.getElementById('next-step-1').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent form submission
        if (validateStep1()) {
            saveToLocalStorage();
            currentStep++;
            showStep(currentStep);
        }
    });

    document.getElementById('next-step-2').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent form submission
        if (validateStep2()) {
            saveToLocalStorage();
            currentStep++;
            showStep(currentStep);
        }
    });

    document.getElementById('next-step-3').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent form submission
        if (validateStep3()) {
            saveToLocalStorage();
            currentStep++;
            showStep(currentStep);
        }
    });

    document.getElementById('sign-up-btn').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent form submission
        uploadProfilePicture();
        document.getElementById('sign-up-btn').disabled = 'true';
        document.getElementById('sign-up-btn').textContent = 'Creating account...';
    });

    // Handle profile image upload
    document.getElementById('change-image-btn').addEventListener('click', function () {
        document.getElementById('image-upload').click();
    });

    document.getElementById('image-upload').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('profile-image').src = e.target.result;
            };
            reader.readAsDataURL(file);

            signUpButton.disabled = false;
        }
    });

    function showStep(step) {
        steps.forEach(function (element, index) {
            element.style.display = (index + 1 === step) ? 'block' : 'none';
        });
    }

    function validateStep1() {
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const date = document.getElementById('profile-date').value.trim();

        if (!name || !email || !date) {
            alert('Enter a username, your email, and your date of birth to proceed.');
            return false;
        }
        return true;
    }

    function validateStep2() {
        const password = document.getElementById('profile-password').value.trim();

        if (!password) {
            alert('To safegaurd your account, we need you to enter a secure password.');
            return false;
        }
        return true;
    }

    function validateStep3() {
        const bio = document.getElementById('profile-bio').value.trim();

        if (!bio) {
            alert('Make your profile interesting, add a short bio.');
            return false;
        }
        return true;
    }

    function saveToLocalStorage() {
        localStorage.setItem('profileName', document.getElementById('profile-name').value);
        localStorage.setItem('profileEmail', document.getElementById('profile-email').value);
        localStorage.setItem('profileDate', document.getElementById('profile-date').value);
        localStorage.setItem('profilePassword', document.getElementById('profile-password').value);
        localStorage.setItem('profileBio', document.getElementById('profile-bio').value);
    }

    function uploadProfilePicture() {
        const file = document.getElementById('image-upload').files[0];
        const storageRef = firebase.storage().ref();
        const profileImageRef = storageRef.child('profileImages/' + file.name);

        profileImageRef.put(file).then((snapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL) => {
                localStorage.setItem('profileImageURL', downloadURL);
                signUp();
            });
        });
    }

    function signUp() {
        const profileName = localStorage.getItem('profileName');
        const profileEmail = localStorage.getItem('profileEmail');
        const profileDate = localStorage.getItem('profileDate');
        const profilePassword = localStorage.getItem('profilePassword');
        const profileBio = localStorage.getItem('profileBio');
        const profileImageURL = localStorage.getItem('profileImageURL');

        if (profileName && profileEmail && profileDate && profilePassword && profileBio && profileImageURL) {
            // Firebase sign up code here
            firebase.auth().createUserWithEmailAndPassword(profileEmail, profilePassword)
                .then((userCredential) => {
                    // Signed in 
                    var user = userCredential.user;
                    // Add user details to Firestore
                    firebase.firestore().collection('users').doc(user.uid).set({
                        name: profileName,
                        email: profileEmail,
                        dateOfBirth: profileDate,
                        bio: profileBio,
                        profilePicture: profileImageURL,
                        followersCount: 0,
                        followingCount: 0
                    }).then(() => {
                        window.location.href = 'index.html'; // Redirect after sign up
                    });


                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    pleaseEnsure.textContent = errorMessage;
                    pleaseEnsure.style.display = 'block';
                    window.location.reload();
                });
        } else {
            pleaseEnsure.textContent = 'To create your account, please complete all steps.';
            pleaseEnsure.style.display = 'block';
            document.getElementById('sign-up-btn').disabled = 'false';
            window.location.reload();
        }
    }
});
