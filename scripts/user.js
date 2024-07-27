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
const profileNameSpan = document.getElementById('profile-name');
const profileEmailSpan = document.getElementById('profile-email');
const profileBioP = document.getElementById('profile-bio');
const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editOptions = document.getElementById('edit-options');
const profilePic = document.getElementById('profile-pic');
const largeName = document.getElementById('user-name-large');
const largePic = document.getElementById('profile-content-pic');
const userBanner = document.getElementById('user-banner');
const editUserBtn = document.getElementById('edit-user-btn');
const profileContent = document.getElementById('profile-content');
const profileAbout = document.getElementById('user-about');
const overlay = document.getElementById('overlay');
const articleWritten = document.getElementById('article-user');
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const userFollowers = document.getElementById('user-followers');

let progress = 0;

const updateProgress = (increment) => {
    progress += increment;
    loadingBar.style.width = `${progress}%`;
    if (progress >= 100) {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1500); // Delay slightly more than the transition duration
    }
};


// Fetch logged-in user's profile picture
const fetchMyUserProfile = () => {
    const user = auth.currentUser;

    if (user) {
        firestore.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.profilePicture) {
                    profilePic.style.backgroundImage = `url(${data.profilePicture})`;
                } else {
                    profilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                }
            } else {
                console.log('No such user!');
            }
            updateProgress(100);
        }).catch((error) => {
            console.error('Error fetching user profile:', error);
            updateProgress(50);
        });
    } else {
        console.log('No user is signed in.');
        updateProgress(0);
    }
};

// Fetch user data on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            fetchMyUserProfile();
        }
    });

    const userIdFromUrl = getUserIdFromUrl();

    if (userIdFromUrl) {
        displayUserArticles(userIdFromUrl);
        fetchUserProfile(userIdFromUrl);
    } else {
        console.log('No user ID found in the URL.');
    }
});

function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('userId');
}

function fetchUserProfile(userId) {
    firestore.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                largeName.textContent = data.name || 'Anonymous';
                userFollowers.textContent = data.followersCount + ' followers' || '0';
                document.title = data.name + ' | Radium' || 'Anonymous';
                articleWritten.textContent = 'Written by ' + data.name || 'Anonymous';
                profileAbout.textContent = data.bio || 'No bio available';

                if (data.profilePicture) {
                    largePic.style.backgroundImage = `url(${data.profilePicture})`;
                    //userBanner.style.backgroundImage = `url(${data.profilePicture})`;
                } else {
                    largePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                    //userBanner.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                }

                if (data.bannerImage) {
                    userBanner.style.backgroundImage = `url(${data.bannerImage})`;
                } else {
                    //userBanner.style.backgroundImage = 'url(https://phlearn.com/wp-content/uploads/2019/03/david-klaasen-775082-unsplash.jpg)';
                    userBanner.style.backgroundImage = `url(${data.profilePicture})`;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
}

function updateProfile(name, bio) {
    firestore.collection('users').doc(userId).update({ name, bio })
        .then(() => {
            console.log('Profile updated');
            largeName.textContent = name;
            profileBioP.textContent = bio;
            profileAbout.textContent = bio;
            toggleEditMode(false);
        })
        .catch(error => {
            console.error('Error updating profile:', error);
        });
}

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const uploadTask = storage.ref(`profile_pics/${userId}`).put(file);
        uploadTask.on('state_changed',
            (snapshot) => {},
            (error) => {
                console.error('Error uploading image:', error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    largePic.style.backgroundImage = `url(${downloadURL})`;
                    userBanner.style.backgroundImage = `url(${downloadURL})`;
                    firestore.collection('users').doc(userId).update({ profilePicture: downloadURL });
                });
            }
        );
    }
});

overlay.addEventListener('click', () => {
    profileContent.style.display = 'none';
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
});

function displayUserArticles(userId) {
    const articlesContainer = document.getElementById('articles-container');
    const MAX_DESCRIPTION_LENGTH = 400;
    
    firestore.collection('posts')
        .where('authorId', '==', userId)
        .get()
        .then(querySnapshot => {
            articlesContainer.innerHTML = ''; // Clear any existing articles
            
            if (querySnapshot.empty) {
                articlesContainer.innerHTML = '<p>No articles found.</p>';
                return;
            }
            
            querySnapshot.forEach(doc => {
                const article = doc.data();
                const articleElement = document.createElement('div');
                articleElement.classList.add('article');
                
                // Create and append elements for article image, title, and content
                const imageElement = document.createElement('img');
                imageElement.src = article.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png'; // Replace with your default image URL
                imageElement.alt = article.title;
                imageElement.classList.add('article-image');
                
                const contentElement = document.createElement('div');
                contentElement.classList.add('article-content');
                
                const titleElement = document.createElement('h3');
                titleElement.textContent = article.title;
                
                const descriptionElement = document.createElement('p');
                let description = article.description;
                if (description.length > MAX_DESCRIPTION_LENGTH) {
                    description = description.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
                }
                descriptionElement.textContent = description;
                
                // Optionally create a link to the article
                const linkElement = document.createElement('a');
                linkElement.href = `article.html?id=${doc.id}`;
                linkElement.textContent = 'Read more';
                linkElement.classList.add('read-more-link');
                
                contentElement.appendChild(titleElement);
                contentElement.appendChild(descriptionElement);
                contentElement.appendChild(linkElement);
                
                articleElement.appendChild(imageElement);
                articleElement.appendChild(contentElement);
                
                articlesContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
}


//follow
const followUserBtn = document.getElementById('follow-user-btn');
let isFollowing = false; // State to track if the current user is following the displayed user
let isProcessing = false; // State to track if a follow/unfollow operation is in progress

auth.onAuthStateChanged(user => {
    if (user) {
        const userIdFromUrl = getUserIdFromUrl();
        if (userIdFromUrl) {
            // Hide the follow button if the user is viewing their own profile
            if (user.uid === userIdFromUrl) {
                followUserBtn.style.display = 'none';
                return;
            }
            checkIfFollowing(user.uid, userIdFromUrl);
        }

        followUserBtn.addEventListener('click', () => {
            if (isProcessing) return; // Prevent multiple clicks while processing

            isProcessing = true;
            followUserBtn.disabled = true;

            if (!isFollowing) {
                followUser(user.uid, userIdFromUrl);
            } else {
                unfollowUser(user.uid, userIdFromUrl);
            }
        });
    }
});


function checkIfFollowing(currentUserId, profileUserId) {
    firestore.collection('users').doc(currentUserId).collection('following').doc(profileUserId)
        .get()
        .then(doc => {
            if (doc.exists) {
                isFollowing = true;
                followUserBtn.textContent = 'Following';
                followUserBtn.classList.add('unfollow-btn');
            } else {
                isFollowing = false;
                followUserBtn.textContent = 'Follow';
                followUserBtn.classList.remove('unfollow-btn');
            }
            followUserBtn.disabled = false; // Enable the button after initial check
        })
        .catch(error => {
            console.error('Error checking follow status:', error);
            followUserBtn.disabled = false; // Enable the button if there's an error
        });
}

function followUser(currentUserId, profileUserId) {
    const batch = firestore.batch();

    const currentUserFollowingRef = firestore.collection('users').doc(currentUserId).collection('following').doc(profileUserId);
    const profileUserFollowersRef = firestore.collection('users').doc(profileUserId).collection('followers').doc(currentUserId);
    
    batch.set(currentUserFollowingRef, { timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    batch.set(profileUserFollowersRef, { timestamp: firebase.firestore.FieldValue.serverTimestamp() });

    const currentUserRef = firestore.collection('users').doc(currentUserId);
    const profileUserRef = firestore.collection('users').doc(profileUserId);
    
    batch.update(currentUserRef, { followingCount: firebase.firestore.FieldValue.increment(1) });
    batch.update(profileUserRef, { followersCount: firebase.firestore.FieldValue.increment(1) });

    batch.commit()
        .then(() => {
            isFollowing = true;
            followUserBtn.textContent = 'Following';
            followUserBtn.classList.add('unfollow-btn');
            isProcessing = false;
            followUserBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error following user:', error);
            isProcessing = false;
            followUserBtn.disabled = false;
        });
}

function unfollowUser(currentUserId, profileUserId) {
    const batch = firestore.batch();

    const currentUserFollowingRef = firestore.collection('users').doc(currentUserId).collection('following').doc(profileUserId);
    const profileUserFollowersRef = firestore.collection('users').doc(profileUserId).collection('followers').doc(currentUserId);
    
    batch.delete(currentUserFollowingRef);
    batch.delete(profileUserFollowersRef);

    const currentUserRef = firestore.collection('users').doc(currentUserId);
    const profileUserRef = firestore.collection('users').doc(profileUserId);
    
    batch.update(currentUserRef, { followingCount: firebase.firestore.FieldValue.increment(-1) });
    batch.update(profileUserRef, { followersCount: firebase.firestore.FieldValue.increment(-1) });

    batch.commit()
        .then(() => {
            isFollowing = false;
            followUserBtn.textContent = 'Follow';
            followUserBtn.classList.remove('unfollow-btn');
            isProcessing = false;
            followUserBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error unfollowing user:', error);
            isProcessing = false;
            followUserBtn.disabled = false;
        });
}
