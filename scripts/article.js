/*// scripts/article.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id'); // Get article ID from URL

    if (articleId) {
        const db = firebase.firestore();
        const articleRef = db.collection('posts').doc(articleId);

        articleRef.get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('article-title').textContent = data.title;
                document.getElementById('article-content').textContent = data.content;

                if (data.imageUrl) {
                    const imageElement = document.getElementById('article-image');
                    imageElement.src = data.imageUrl;
                    imageElement.style.display = 'block';
                }
            } else {
                console.log('No such document!');
                // Handle case where article does not exist
            }
        }).catch((error) => {
            console.error('Error getting document:', error);
        });
    } else {
        console.log('No article ID in URL');
        // Handle case where no article ID is provided
    }
});
*/
/*
document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    if (!articleId) {
        document.getElementById('article-container').innerHTML = '<p>Invalid article ID.</p>';
        return;
    }

    try {
        const doc = await firebase.firestore().collection('posts').doc(articleId).get();

        if (!doc.exists) {
            document.getElementById('article-container').innerHTML = '<p>Article not found.</p>';
            return;
        }

        const data = doc.data();
        const userDoc = await firebase.firestore().collection('users').doc(data.authorId).get();
        const authorData = userDoc.data();

        const articleContainer = document.getElementById('article-container');
        articleContainer.innerHTML = `
            <h1>${data.title}</h1>
            <div class="author-info">
                <img src="${authorData.profilePicture || './assets/default-profile-pic.jpg'}" alt="Author" class="author-pic">
                <div class="author-details">
                    <span class="author-name">${authorData.name || 'Unknown Author'}</span>
                    <span class="publish-date">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown Date'}</span>
                </div>
            </div>
            <div class="article-content">${data.content}</div>
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Article Image" class="article-image">` : ''}
        `;
    } catch (error) {
        console.error('Error fetching article:', error);
        document.getElementById('article-container').innerHTML = '<p>Error loading article. Please try again later.</p>';
    }
});
*/


/*
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

const firestore = firebase.firestore();

// Function to fetch and display the article
const displayArticle = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        firestore.collection('posts').doc(postId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('article-title').textContent = data.title || 'Untitled';
                document.getElementById('article-content').innerHTML = formatContent(data.content);
            } else {
                console.log('No such document!');
            }
        }).catch((error) => {
            console.log('Error getting document:', error);
        });
    }
};

// Function to format content for HTML
const formatContent = (content) => {
    // Replace new lines with <br> for HTML display
    return content.replace(/\n/g, '<br>');
};

// Call the function to display the article when the page loads
document.addEventListener('DOMContentLoaded', displayArticle);
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

const firestore = firebase.firestore();
const auth = firebase.auth();

// Check authentication and fetch user data
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;        
        localStorage.setItem('userId', user.uid);

        fetchUserProfile(user.uid); // Pass user ID here
    } else {
        window.location.href = 'log-in.html'; // Redirect if not authenticated
    }
});

const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');

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

// Function to fetch and display the article
const displayArticle = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        try {
            const doc = await firestore.collection('posts').doc(postId).get();
            if (doc.exists) {
                const data = doc.data();
                const articleTitle = data.title || 'Untitled';

                // Set the title of the document
                document.title = articleTitle + " | Radium";

                // Set the article title and content
                document.getElementById('article-title').textContent = articleTitle;
                document.getElementById('article-content').innerHTML = decodeAndFormatContent(data.content);

                // Fetch the author's information
                const authorDoc = await firestore.collection('users').doc(data.authorId).get();
                if (authorDoc.exists) {
                    const authorData = authorDoc.data();
                    const authorName = authorData.name || 'Unknown Author';
                    const profilePicture = authorData.profilePicture || './assets/default-profile-pic.jpg';
                    const publishDate = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown Date';

                    // Create the author info section
                    const authorInfoHtml = `
                        <div class="author-info">
                            <img src="${profilePicture}" alt="Author" class="author-pic">
                            <div class="author-details">
                                <span class="author-name"><a href="user.html?userId=${data.authorId}">${authorName}</a></span>
                                <span class="publish-date">${publishDate}</span>
                            </div>
                        </div>
                    `;

                    // Insert the author info section below the article title
                    document.getElementById('article-author').innerHTML = authorInfoHtml;
                } else {
                    console.log('No such author document!');
                }
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.log('Error getting document:', error);
        }
    }
};

// Function to decode and format content for HTML
const decodeAndFormatContent = (content) => {
    return content.replace(/&nbsp;/g, ' ') // Decode spaces
                  .replace(/<br>/g, '\n')  // Decode new lines
                  .replace(/\n/g, '<br>')  // Convert new lines to <br> for HTML display
                  .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold formatting
                  .replace(/_(.*?)_/g, '<i>$1</i>');      // Italic formatting
};

// Function to fetch and display the logged-in user's profile picture
const fetchUserProfile = () => {
    const user = auth.currentUser;

    if (user) {
        firestore.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const profilePic = document.getElementById('profile-pic');

                if (data.profilePicture) {
                    profilePic.style.backgroundImage = `url(${data.profilePicture})`;
                } else {
                    profilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                }
            } else {
                console.log('No such user!');
            }
            updateProgress(50);
        }).catch((error) => {
            console.error('Error fetching user profile:', error);
            updateProgress(50);
        });
    } else {
        console.log('No user is signed in.');
        updateProgress(50);
    }
};

// Call the functions to display the article and user profile picture when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayArticle();
    auth.onAuthStateChanged((user) => {
        if (user) {
            fetchUserProfile();
        }
    });
});
