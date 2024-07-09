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

let userId;
/*
// Fetch user data on page load
auth.onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        fetchUserProfile();
    }
});*/
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            userId = user.uid;
            displayUserArticles(userId);
            fetchUserProfile();
        } else {
            console.log('No user is signed in.');
        }
    });
});

function fetchUserProfile() {
    firestore.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                largeName.textContent = data.name || 'Anonymous';
                document.title = data.name + ' | Radium' || 'Anonymous';
                profileNameSpan.textContent = data.name || 'No Name';
                articleWritten.textContent = 'Articles written by ' + data.name || 'Anonymous';
                profileEmailSpan.textContent = auth.currentUser.email || 'No Email';
                profileBioP.textContent = data.bio || 'No Bio';
                profileAbout.textContent = data.bio || 'No Bio';

                if (data.profilePicture) {
                    profileImage.src = data.profilePicture;
                    profilePic.style.backgroundImage = `url(${data.profilePicture})`;
                    largePic.style.backgroundImage = `url(${data.profilePicture})`;
                    userBanner.style.backgroundImage = `url(${data.profilePicture})`;
                } else {
                    profileImage.src = 'https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg';
                    profilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                    largePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                    userBanner.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
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
            profileNameSpan.textContent = name;
            largeName.textContent = name;
            profileBioP.textContent = bio;
            profileAbout.textContent = bio;
            toggleEditMode(false);
        })
        .catch(error => {
            console.error('Error updating profile:', error);
        });
}

changeImageBtn.addEventListener('click', () => imageUpload.click());

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
                    profileImage.src = downloadURL;
                    profilePic.style.backgroundImage = `url(${downloadURL})`;
                    largePic.style.backgroundImage = `url(${downloadURL})`;
                    userBanner.style.backgroundImage = `url(${downloadURL})`;
                    firestore.collection('users').doc(userId).update({ profilePicture: downloadURL });
                });
            }
        );
    }
});

editBtn.addEventListener('click', () => toggleEditMode(true));

saveBtn.addEventListener('click', () => {
    const newName = document.getElementById('profile-name-input').value;
    const newBio = document.getElementById('profile-bio-input').value;
    if (newName) {
        updateProfile(newName, newBio);
    }
});

cancelBtn.addEventListener('click', () => toggleEditMode(false));

/*function toggleEditMode(isEditing) {
    if (isEditing) {
        editBtn.style.display = 'none';
        editOptions.style.display = 'block';
        profileNameSpan.style.display = 'none';
        profileBioP.style.display = 'none';

        const profileNameInput = document.createElement('input');
        profileNameInput.id = 'profile-name-input';
        profileNameInput.value = profileNameSpan.textContent;
        profileNameInput.placeholder = 'Enter new name';
        profileNameSpan.parentElement.appendChild(profileNameInput);

        const profileBioInput = document.createElement('textarea');
        profileBioInput.id = 'profile-bio-input';
        profileBioInput.value = profileBioP.textContent;
        profileBioInput.placeholder = 'Enter new bio';
        profileBioP.parentElement.appendChild(profileBioInput);

    } else {
        editBtn.style.display = 'block';
        editOptions.style.display = 'none';
        document.getElementById('profile-name-input')?.remove();
        document.getElementById('profile-bio-input')?.remove();
        profileNameSpan.style.display = 'block';
        profileBioP.style.display = 'block';
    }
}
*/

const MAX_NAME_WORDS = 3; // Adjust the max word count for the name as needed
const MAX_BIO_WORDS = 50; // Adjust the max word count for the bio as needed

function toggleEditMode(isEditing) {
    if (isEditing) {
        editBtn.style.display = 'none';
        editOptions.style.display = 'block';
        profileNameSpan.style.display = 'none';
        profileBioP.style.display = 'none';

        const profileNameInput = document.createElement('input');
        profileNameInput.id = 'profile-name-input';
        profileNameInput.value = profileNameSpan.textContent;
        profileNameInput.placeholder = 'Enter new name';
        profileNameInput.style.fontSize = '15px';
        profileNameSpan.parentElement.appendChild(profileNameInput);

        const profileBioInput = document.createElement('textarea');
        profileBioInput.id = 'profile-bio-input';
        profileBioInput.value = profileBioP.textContent;
        profileBioInput.placeholder = 'Enter new bio';
        profileBioP.parentElement.appendChild(profileBioInput);

        profileNameInput.addEventListener('input', () => {
            limitWordCount(profileNameInput, MAX_NAME_WORDS);
        });

        profileBioInput.addEventListener('input', () => {
            limitWordCount(profileBioInput, MAX_BIO_WORDS);
        });

    } else {
        editBtn.style.display = 'block';
        editOptions.style.display = 'none';
        document.getElementById('profile-name-input')?.remove();
        document.getElementById('profile-bio-input')?.remove();
        profileNameSpan.style.display = 'block';
        profileBioP.style.display = 'block';
    }
}

function limitWordCount(inputElement, maxWords) {
    const words = inputElement.value.split(/\s+/).filter(word => word.length > 0);
    if (words.length > maxWords) {
        inputElement.value = words.slice(0, maxWords).join(' ');
    }
}

editUserBtn.addEventListener('click', () => {
    if (profileContent.style.display === 'none' || !profileContent.style.display) {
        profileContent.style.display = 'flex';
        overlay.style.display = 'block';
        document.body.classList.add('no-scroll');
    } else {
        profileContent.style.display = 'none';
        overlay.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
});

overlay.addEventListener('click', () => {
    profileContent.style.display = 'none';
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
});


function displayUserArticles(userId) {
    const articlesContainer = document.getElementById('articles-container');
    
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
                
                // Create and append elements for article title and content
                const titleElement = document.createElement('h3');
                titleElement.textContent = article.title;
                
                const contentElement = document.createElement('p');
                contentElement.textContent = article.description;
                
                // Optionally create a link to the article
                const linkElement = document.createElement('a');
                linkElement.href = `article.html?id=${doc.id}`;
                linkElement.textContent = 'Read more';
                linkElement.classList.add('read-more-link');
                
                articleElement.appendChild(titleElement);
                articleElement.appendChild(contentElement);
                articleElement.appendChild(linkElement);
                
                articlesContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
}
