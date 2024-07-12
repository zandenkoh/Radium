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
const profilePic = document.getElementById('profile-pic');
const userNameSpan = document.getElementById('user-name');
const publishTo = document.getElementById('popup-content-h2');
let currentUser = null;

// Check authentication and fetch user data
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        fetchUserProfile(user.uid); // Pass user ID here
    } else {
        window.location.href = 'log-in.html'; // Redirect if not authenticated
    }
});

// Fetch user profile from Firestore
const fetchUserProfile = (userId) => {
    firestore.collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            console.log('User data fetched:', data);
            userNameSpan.textContent = data.name || 'User';
            publishTo.textContent = data.name || 'User';
            if (data.profilePicture) {
                profilePic.style.backgroundImage = `url(${data.profilePicture})`;
            } else {
                profilePic.style.backgroundImage = 'url(default-profile-pic.jpg)'; // Placeholder image if none exists
            }
        } else {
            console.log('No such document!');
        }
    }).catch((error) => {
        console.log('Error getting document:', error);
    });
};

// Encode text and handle custom formatting
function encodeText(text) {
    return text.replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length))
               .replace(/\n/g, '<br>')
               .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold formatting
               .replace(/_(.*?)_/g, '<i>$1</i>');      // Italic formatting
}

// Show the popup modal
function showPopup() {
    const popupModal = document.getElementById('popup-modal');
    popupModal.style.display = 'block';
}

const closePopupModal = document.getElementById('close-popup-modal');
closePopupModal.addEventListener('click', function(e) {
    hidePopup();
});

// Hide the popup modal
function hidePopup() {
    const popupModal = document.getElementById('popup-modal');
    popupModal.style.display = 'none';
}

document.getElementById('create-post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Display the popup modal
    document.getElementById('popup-modal').style.display = 'block';
});

document.getElementById('publish-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Publishing...';
    submitButton.classList.add('disabled');

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const content = encodeText(document.getElementById('content').value);
    const imageUrl = document.getElementById('image').value;
    const theme = tagsArray.join(', ');

    // Calculate reading time
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(/\s+/).length;
    const timeRead = Math.ceil(wordCount / wordsPerMinute);

    const user = firebase.auth().currentUser;
    if (user) {
        const postRef = firebase.firestore().collection('posts').doc();
        postRef.set({
            title: title,
            description: description,
            content: content,
            imageUrl: imageUrl || null,
            authorId: user.uid,
            theme: theme,
            timeRead: timeRead,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Post created successfully');
            window.location.href = `article.html?id=${postRef.id}`; // Redirect to the new article page
        })
        .catch((error) => {
            console.error('Error creating post:', error);
            document.getElementById('error-message').textContent = 'Error creating post: ' + error.message;
            submitButton.disabled = false;
            submitButton.textContent = 'Publish';
            submitButton.classList.remove('disabled');
        });
    } else {
        document.getElementById('error-message').textContent = 'User not logged in';
        submitButton.disabled = false;
        submitButton.textContent = 'Publish';
        submitButton.classList.remove('disabled');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const textareas = [document.getElementById('title'), document.getElementById('content'), document.getElementById('description')];

    // Function to auto-resize the textarea
    function autoResize(event) {
        const textarea = event.target;
        const scrollPosition = window.scrollY;

        textarea.style.height = 'auto'; // Reset the height
        textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to scroll height

        window.scrollTo(0, scrollPosition); // Restore the scroll position
    }

    // Event listeners to handle input and change events
    textareas.forEach(textarea => {
        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('change', autoResize);
    });

    // Initial resize to fit existing content
    textareas.forEach(textarea => {
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('content');

    textarea.addEventListener('keydown', function(e) {
        // Check if the Tab key is pressed
        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent default tab behaviour (focus shift)

            // Get the current cursor position
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Insert four spaces at the current cursor position
            const spaces = '    '; // Four spaces
            textarea.value = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);

            // Move the cursor to the end of the inserted spaces
            textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
        }
    });
});

const input = document.getElementById('theme');
const container = document.getElementById('tag-container');
let tagsArray = []; // Array to store tags

// Function to create a tag element
function createTag(text) {
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.textContent = text;

    const removeButton = document.createElement('button');
    removeButton.textContent = '×';
    removeButton.onclick = function () {
        container.removeChild(tag);
        // Remove the tag from the tagsArray
        tagsArray = tagsArray.filter(tagText => tagText !== text);
        updateThemeField(); // Update the theme field when a tag is removed
    };

    tag.appendChild(removeButton);
    return tag;
}

// Function to update the theme field with comma-separated tags
function updateThemeField() {
    input.value = ''; // Clear the input field
}

// Event listener for the input field
input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission behavior

        const text = input.value.trim();
        if (text && !tagsArray.includes(text)) {
            // Add new tag to the tagsArray
            tagsArray.push(text);
            // Create and append a new tag
            const tag = createTag(text);
            container.insertBefore(tag, input);
            input.value = ''; // Clear the input field
        }
    }
});

// Optional: allow for tag removal by clicking outside the tag input
document.addEventListener('click', function (event) {
    if (!container.contains(event.target) && event.target !== input) {
        input.focus();
    }
});
