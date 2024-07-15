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

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

const profileImage = document.getElementById('profile-image');
const changeImageBtn = document.getElementById('change-image-btn');
const imageUpload = document.getElementById('image-upload');
const profileNameInput = document.getElementById('profile-name');
const profileEmailSpan = document.getElementById('profile-email');
const profileBioInput = document.getElementById('profile-bio');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const nextBtn = document.getElementById('next-btn');
const editBtn = document.getElementById('edit-btn');
const pleaseEnsure = document.getElementById('please-ensure');

const defaultProfileImageUrl = 'https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg';

let currentUser = null;

// Check authentication and fetch user data
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        profileEmailSpan.textContent = user.email;
        fetchUserProfile(user.uid);
    } else {
        window.location.href = 'log-in.html'; // Redirect if not authenticated
    }
});

// Fetch user profile from Firestore
const fetchUserProfile = (userId) => {
    firestore.collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            profileNameInput.value = data.name || '';
            profileBioInput.value = data.bio || '';
            profileImage.src = defaultProfileImageUrl;
            changeImageBtn.textContent = 'Upload your image';
            nextBtn.style.display = 'block';
        } else {
            // Show profile setup form if no profile exists
            profileImage.src = defaultProfileImageUrl;
            changeImageBtn.textContent = 'Upload your image';
            nextBtn.style.display = 'block';
        }
    }).catch((error) => {
        console.error('Error fetching profile:', error);
    });
};

// Handle image upload
changeImageBtn.addEventListener('click', () => {
    imageUpload.click();
});

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const storageRef = storage.ref(`profilePictures/${currentUser.uid}/${file.name}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', null, (error) => {
            console.error('Upload error:', error);
        }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                profileImage.src = downloadURL;
                // Save profile data with the new image URL
                saveProfileData({ profilePicture: downloadURL });
            }).catch((error) => {
                console.error('Error getting download URL:', error);
            });
        });
    }
});

// Handle saving profile
const saveProfileData = (updates) => {
    if (currentUser) {
        const profilePicture = updates.profilePicture || defaultProfileImageUrl;
        firestore.collection('users').doc(currentUser.uid).set({
            name: profileNameInput.value,
            bio: profileBioInput.value,
            profilePicture: profilePicture,
            ...updates
        }, { merge: true })
        .then(() => {
            console.log('Profile updated successfully');
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
        });
    }
};

// Validate profile completion
const validateProfile = () => {
    const isValid = profileNameInput.value.trim() !== '' && profileBioInput.value.trim() !== '';
    nextBtn.disabled = !isValid;
    return isValid;
};

nextBtn.addEventListener('click', () => {
    if (validateProfile()) {
        saveProfileData({});
        window.location.href = 'index.html';
    } else {
        pleaseEnsure.style.opacity = '1';
        pleaseEnsure.style.bottom = '-30px';
        pleaseEnsure.style.color = 'red';
    }
});

profileNameInput.addEventListener('input', validateProfile);
profileBioInput.addEventListener('input', validateProfile);
profileImage.addEventListener('input', validateProfile);
