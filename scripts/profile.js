/*// Initialize Firebase
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
            if (data.profilePicture) {
                profileImage.src = data.profilePicture;
            }
        }
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
                saveProfileData({ profilePicture: downloadURL });
            });
        });
    }
});

// Handle saving profile
const saveProfileData = (updates) => {
    if (currentUser) {
        firestore.collection('users').doc(currentUser.uid).set({
            name: profileNameInput.value,
            bio: profileBioInput.value,
            ...updates
        }, { merge: true })
        .then(() => {
            console.log('Profile updated successfully');
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
        });
    };
};

// Handle Next button click
nextBtn.addEventListener('click', () => {
    saveProfileData({});
    window.location.href = 'index.html';
});

// Edit mode
editBtn.addEventListener('click', () => {
    profileNameInput.disabled = false;
    profileBioInput.disabled = false;
    nextBtn.style.display = 'none';
    document.getElementById('edit-options').style.display = 'block';
});

saveBtn.addEventListener('click', () => {
    profileNameInput.disabled = true;
    profileBioInput.disabled = true;
    saveProfileData({});
    document.getElementById('edit-options').style.display = 'none';
    nextBtn.style.display = 'inline-block';
});

cancelBtn.addEventListener('click', () => {
    fetchUserProfile(currentUser.uid);
    profileNameInput.disabled = true;
    profileBioInput.disabled = true;
    document.getElementById('edit-options').style.display = 'none';
    nextBtn.style.display = 'inline-block';
});
*/

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
            if (data.profilePicture) {
                profileImage.src = data.profilePicture;
            }
            // Show edit button if profile exists
            editBtn.style.display = 'inline-block';
            nextBtn.style.display = 'none';
        } else {
            // Show profile setup form if no profile exists
            setupProfile();
        }
    }).catch((error) => {
        console.error('Error fetching profile:', error);
    });
};

// Setup profile form for initial setup
const setupProfile = () => {
    document.getElementById('edit-options').style.display = 'none'; // Hide edit options initially
    editBtn.style.display = 'none'; // Hide edit button during setup
    saveBtn.style.display = 'inline-block'; // Show save button during setup
    cancelBtn.style.display = 'inline-block'; // Show cancel button during setup
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
        firestore.collection('users').doc(currentUser.uid).set({
            name: profileNameInput.value,
            bio: profileBioInput.value,
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

// Handle Next button click
nextBtn.addEventListener('click', () => {
    saveProfileData({});
    window.location.href = 'index.html';
});

// Edit mode
editBtn.addEventListener('click', () => {
    profileNameInput.disabled = false;
    profileBioInput.disabled = false;
    nextBtn.style.display = 'none';
    document.getElementById('edit-options').style.display = 'block';
});

saveBtn.addEventListener('click', () => {
    profileNameInput.disabled = true;
    profileBioInput.disabled = true;
    saveProfileData({});
    document.getElementById('edit-options').style.display = 'none';
    nextBtn.style.display = 'inline-block';
});

cancelBtn.addEventListener('click', () => {
    fetchUserProfile(currentUser.uid); // Reset to original values
    profileNameInput.disabled = true;
    profileBioInput.disabled = true;
    document.getElementById('edit-options').style.display = 'none';
    nextBtn.style.display = 'inline-block';
});
