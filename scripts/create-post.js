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

document.getElementById('create-post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const content = encodeText(document.getElementById('content').value);
    const imageUrl = document.getElementById('image').value;

    const user = firebase.auth().currentUser;
    if (user) {
        const postRef = firebase.firestore().collection('posts').doc();
        postRef.set({
            title: title,
            description: description, // Add description field here
            content: content,
            imageUrl: imageUrl || null,
            authorId: user.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Post created successfully');
            window.location.href = `article.html?id=${postRef.id}`; // Redirect to the new article page
        })
        .catch((error) => {
            console.error('Error creating post:', error);
            document.getElementById('error-message').textContent = 'Error creating post: ' + error.message;
        });
    } else {
        document.getElementById('error-message').textContent = 'User not logged in';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('title');
    const textarea2 = document.getElementById('content');
    const textarea3 = document.getElementById('description');


    // Function to auto-resize the textarea
    function autoResize() {
        textarea.style.height = 'auto'; // Reset the height
        textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to scroll height
        textarea2.style.height = 'auto'; // Reset the height
        textarea2.style.height = textarea2.scrollHeight + 'px'; // Set the height to scroll height
        textarea3.style.height = 'auto'; // Reset the height
        textarea3.style.height = textarea3.scrollHeight + 'px'; // Set the height to scroll height
    }

    // Event listeners to handle input and change events
    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('change', autoResize);
    textarea2.addEventListener('input', autoResize);
    textarea2.addEventListener('change', autoResize);
    textarea3.addEventListener('input', autoResize);
    textarea3.addEventListener('change', autoResize);

    // Initial resize to fit existing content
    autoResize();
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
