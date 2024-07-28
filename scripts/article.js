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

        fetchUserProfile(user.uid);
        loadArticlesByFilter('all');
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
        loadingScreen.classList.add('hidden'); // Add hidden class to start the fade-out transition
        setTimeout(() => {
          loadingScreen.style.display = 'none'; // Set display to none after the transition ends
        }, 400); // Match the duration of the CSS transition
      }, 1600); // Delay slightly more than the transition duration
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
                const articleTopic = data.theme || 'No topic';
                const imageElement = document.getElementById('article-image');
                imageElement.src = data.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png';

                // Set the title of the document
                document.title = articleTitle + " | Radium";

                // Set the article title and content
                document.getElementById('article-title').textContent = articleTitle;
                document.getElementById('article-topic').textContent = articleTopic;
                document.getElementById('article-content').innerHTML = decodeAndFormatContent(data.content);

                // Fetch the author's information
                const authorDoc = await firestore.collection('users').doc(data.authorId).get();
                if (authorDoc.exists) {
                    const authorData = authorDoc.data();
                    const authorName = authorData.name || 'Unknown Author';
                    const profilePicture = authorData.profilePicture || './assets/default-profile-pic.jpg';
                    const isVerified = authorData.verified || false;
                    
                    document.getElementById('writer-profile-pic').src = authorData.profilePicture || './assets/default-profile-pic.jpg';
                    document.getElementById('user-name-text').textContent = "" + authorData.name || 'Unknown Author';
                    document.getElementById('writer-name').href = "user.html?userId=" + data.authorId || 'WdiE3Q9og5WFnrVjSO2DyUdcEp82';
                    document.getElementById('writer-about').textContent = authorData.bio || 'No bio';
                    
                    const verifiedBadge = document.getElementById('verified-badge');
                    if (isVerified) {
                        verifiedBadge.style.display = 'inline';
                    } else {
                        verifiedBadge.style.display = 'none';
                    }
                    
                    //const publishDate = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown Date';
                    const publishDate = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
                    const readDura = data.timeRead || '1';
                    

                    // Create the author info section
                    const authorInfoHtml = `
                        <div class="author-info">
                            <img src="${profilePicture}" alt="Author" class="author-pic">
                            <div class="author-details">
                                <span class="author-name"><a href="user.html?userId=${data.authorId}">${authorName}</a></span>
                                <span class="publish-date">${readDura} min read · ${publishDate}</span>
                            </div>
                        </div>
                    `;

                    // Insert the author info section below the article title
                    document.getElementById('article-author').innerHTML = authorInfoHtml;

                    await loadComments(postId);
                } else {
                    console.log('No such author document!');
                }

                // Start the view counter
                startViewCounter(postId);
                initializeEchoButtons(postId);
                updateCommentCount(postId);

                updateProgress(100);

            } else {
                console.log('No such document!');
                updateProgress(50);
            }
        } catch (error) {
            console.log('Error getting document:', error);
            updateProgress(50);
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

const profileMobilePic = document.getElementById('profile-mobile-pic');
/*
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
                    profileMobilePic.style.backgroundImage = `url(${data.profilePicture})`;
                } else {
                    profilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                    profileMobilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)'; // Placeholder image if none exists
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
};*/
const fetchCurrentUserProfile = () => {
    const user = auth.currentUser;
    if (user) {
        firestore.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('current-user-profile-pic').src = data.profilePicture || 'https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg';
            }
        }).catch((error) => {
            console.error('Error fetching user profile:', error);
        });
    }
};

const commentTextarea = document.getElementById('comment-textarea');
const commentInputContainer = document.getElementById('comment-input-container');
const commentHeader = document.getElementById('comment-header');
const commentButtons = document.getElementById('comment-buttons');
const commentCancelButton = document.getElementById('comment-cancel-button');
const commentSubmitButton = document.getElementById('comment-submit-button');
const currentUserProfilePic = document.getElementById('current-user-profile-pic');
const currentUserName = document.getElementById('current-user-name');
const commentsCount = document.getElementById('comments-count');
const commentsCount2 = document.getElementById('comments-count-2');

// Show profile picture, name, and buttons when textarea is focused
commentTextarea.addEventListener('focus', () => {
    commentHeader.classList.remove('hidden');
    commentButtons.classList.remove('hidden');
    commentInputContainer.classList.remove('when-hidden');
    commentInputContainer.style.paddingTop = '15px';
    commentTextarea.style.height = '200px';
    commentTextarea.style.paddingTop = '10px';


    // Display profile picture and name
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
        const userId = currentUser.uid;
        firestore.collection('users').doc(userId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                currentUserProfilePic.src = data.profilePicture || 'https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg';
                currentUserName.textContent = data.name || 'Anonymous';
            }
        }).catch((error) => {
            console.error('Error fetching user profile:', error);
        });
    }
});

// Hide profile picture, name, and buttons, and reset textarea height on cancel
commentCancelButton.addEventListener('click', () => {
    commentHeader.classList.add('hidden');
    commentButtons.classList.add('hidden');
    commentInputContainer.classList.add('when-hidden');
    commentInputContainer.style.paddingTop = '10px';
    commentTextarea.style.height = '30px';
    commentTextarea.style.paddingTop = '0';

});

// Handle comment submission
commentSubmitButton.addEventListener('click', () => {
    const commentText = commentTextarea.value.trim();
    if (commentText) {
        const postId = new URLSearchParams(window.location.search).get('id');
        const currentUser = firebase.auth().currentUser;

        if (postId && currentUser) {
            firestore.collection('posts').doc(postId).collection('comments').add({
                userId: currentUser.uid,
                userProfilePicture: currentUserProfilePic.src,
                userName: currentUserName.textContent,
                comment: commentText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0
            }).then(() => {
                commentTextarea.value = '';
                commentHeader.classList.add('hidden');
                commentButtons.classList.add('hidden');
                commentInputContainer.classList.add('when-hidden');
                commentInputContainer.style.paddingTop = '10px';
                commentTextarea.style.height = '30px'; // Reset height
                commentTextarea.style.paddingTop = '0';
                loadComments(postId);
                updateCommentCount(postId);
            }).catch((error) => {
                console.error('Error adding comment:', error);
            });
        }
    }
});

/*
const commentTextarea = document.getElementById('comment-textarea');
const commentHeader = document.getElementById('comment-header');
const commentButtons = document.getElementById('comment-buttons');
const commentCancelButton = document.getElementById('comment-cancel-button');
const commentSubmitButton = document.getElementById('comment-submit-button');

// Show textarea and buttons on input focus
commentTextarea.addEventListener('focus', () => {
    commentTextarea.classList.remove('hidden');
    commentTextarea.value = commentInput.value;
    commentButtons.classList.remove('hidden');
    commentTextarea.focus();
});

// Hide textarea and buttons on cancel
commentCancelButton.addEventListener('click', () => {
    commentTextarea.classList.add('hidden');
    commentButtons.classList.add('hidden');
}); 

// Submit comment on button click
commentSubmitButton.addEventListener('click', async () => {
    const commentText = commentTextarea.value.trim();
    if (commentText) {
        try {
            const postId = new URLSearchParams(window.location.search).get('id');
            if (postId && currentUser) {
                await firestore.collection('posts').doc(postId).collection('comments').add({
                    userId: currentUser.uid,
                    comment: commentText,
                    likes: 0,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                commentTextarea.value = '';
                commentTextarea.classList.add('hidden');
                commentButtons.classList.add('hidden');
                commentInput.classList.remove('hidden');
                loadComments(postId); // Reload comments
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }
});*/

const loadComments = async (postId) => {
    try {
        const commentsSnapshot = await firestore.collection('posts').doc(postId).collection('comments').orderBy('timestamp', 'desc').get();
        const commentsContainer = document.getElementById('existing-comments-container');
        commentsContainer.innerHTML = '';
        // Fetch user details for each comment
        const userPromises = commentsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userDoc = await firestore.collection('users').doc(data.userId).get(); // Fetch user data using userId
            const userData = userDoc.data() || {};

            return {
                ...data,
                userProfilePicture: userData.profilePicture || 'https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg', // Default image if none exists
                userName: userData.name || 'Unknown User'
            };
        });

        // Wait for all user details to be fetched
        const commentsWithUserDetails = await Promise.all(userPromises);

        // Create comment elements and append to the container
        commentsWithUserDetails.forEach((comment) => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment">
                    <div class="comment-header">
                        <img src="${comment.userProfilePicture}" class="comment-profile-pic" alt="Profile Picture">
                        <span class="comment-author">${comment.userName}</span>
                        <span class="comment-date"> • ${comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</span>
                    </div>
                    <p class="comment-text">${comment.comment}</p>
                </div>
                <hr class="comment-hr">
            `;
            commentsContainer.appendChild(commentElement);
        });

    } catch (error) {
        console.error('Error loading comments:', error);
    }
};

const updateCommentCount = async (postId) => {
    try {
        const commentsSnapshot = await firestore.collection('posts').doc(postId).collection('comments').get();
        const commentCount = commentsSnapshot.size;

        commentsCount.textContent = commentCount;
        commentsCount2.textContent = 'Responses (' + commentCount + ')';
    } catch (error) {
        console.error('Error updating comment count:', error);
    }
};


// Function to fetch and display the logged-in user's profile picture
const fetchUserProfile = (userId) => {
    return new Promise((resolve, reject) => {
        firestore.collection('users').doc(userId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                const profilePic = document.getElementById('profile-pic');

                if (data.profilePicture) {
                    profilePic.style.backgroundImage = `url(${data.profilePicture})`;
                    profileMobilePic.style.backgroundImage = `url(${data.profilePicture})`;
                } else {
                    profilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)';
                    profileMobilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)'; // Placeholder image if none exists
                }
                fetchCurrentUserProfile();
                resolve();
            } else {
                console.log('No such user!');
                resolve(); // Resolve even if there's no user document
            }
        }).catch((error) => {
            console.error('Error fetching user profile:', error);
            reject(error);
        });
    });
};


// Function to start the view counter
const startViewCounter = (postId) => {
    let viewTimeout = setTimeout(async () => {
        try {
            const articleRef = firestore.collection('posts').doc(postId);
            await articleRef.update({
                views: firebase.firestore.FieldValue.increment(1)
            });
            console.log('View count incremented');
        } catch (error) {
            console.error('Error updating view count:', error);
        }
    }, 60000); // 1 minute in milliseconds

    // If the user leaves the page before 1 minute, clear the timeout
    window.addEventListener('beforeunload', () => {
        clearTimeout(viewTimeout);
    });
};

const handleEcho = async (postId) => {
    try {
        const userEchoRef = firestore.collection('posts').doc(postId).collection('echos').doc(currentUser.uid);
        const userEchoDoc = await userEchoRef.get();

        if (!userEchoDoc.exists) {
            // Optimistically update the UI for echoing
            applyEchoStyles(true);

            await userEchoRef.set({ echoed: true });
        } else {
            // Optimistically update the UI for unechoing
            applyEchoStyles(false);

            await userEchoRef.delete();
        }
        
        // Update the echo count based on the current state
        updateEchoCount(postId);
    } catch (error) {
        console.error('Error handling echo:', error);
    }
};

const updateEchoCount = async (postId) => {
    try {
        const echosSnapshot = await firestore.collection('posts').doc(postId).collection('echos').get();
        const echoCount = echosSnapshot.size; // Get the number of echo documents

        document.getElementById('echo-count').textContent = echoCount;
    } catch (error) {
        console.error('Error updating echo count:', error);
    }
};

const applyEchoStyles = (echoed) => {
    const clapItem = document.querySelector('.clap-item');
    const clapItemImg = clapItem.querySelector('img');
    const echoButton = document.getElementById('echo-button-bottom');
    const echoButtonSpan = echoButton.querySelector('span');
    const echoButtonImg = echoButton.querySelector('img');

    if (echoed) {
        clapItem.classList.add('echoed');
        echoButton.classList.add('echoed');
        echoButtonSpan.textContent = 'Echoed';
        echoButtonImg.src = 'assets/echo-coloured.svg';
        clapItemImg.src = 'assets/echo-coloured.svg';
    } else {
        clapItem.classList.remove('echoed');
        echoButton.classList.remove('echoed');
        echoButtonSpan.textContent = 'Echo';
        echoButtonImg.src = 'assets/slap-1.svg';
        clapItemImg.src = 'assets/slap-1.svg';
    }
};

const initializeEchoButtons = async (postId) => {
    const echoButton = document.getElementById('echo-button-bottom');
    const clapItem = document.querySelector('.clap-item');

    // Check if the button was already initialized to prevent duplicate listeners
    if (echoButton.dataset.initialized === "true") return;
    echoButton.dataset.initialized = "true";

    const echoHandler = () => handleEcho(postId);

    echoButton.addEventListener('click', echoHandler);
    clapItem.addEventListener('click', echoHandler);

    try {
        const userEchoDoc = await firestore.collection('posts').doc(postId).collection('echos').doc(currentUser.uid).get();
        if (userEchoDoc.exists) {
            applyEchoStyles(true);
        } else {
            applyEchoStyles(false);
        }
    } catch (error) {
        console.error('Error checking echo status:', error);
    }

    // Update the echo count initially
    updateEchoCount(postId);
};

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            fetchUserProfile(user.uid).then(() => {
                displayArticle().then(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const postId = urlParams.get('id');
                    if (postId) {
                        initializeEchoButtons(postId);
                    }
                });
            });
        } else {
            window.location.href = 'log-in.html'; // Redirect if not authenticated
        }
    });
});





/*
// Call the functions to display the article and user profile picture when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayArticle();
    auth.onAuthStateChanged((user) => {
        if (user) {
            fetchUserProfile();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            fetchUserProfile(user.uid);
            displayArticle();
        } else {
            window.location.href = 'log-in.html'; // Redirect if not authenticated
        }
    });
});*/
/*
function displayAllArticles() {
    const articlesContainer = document.getElementById('articles-container');
    const MAX_DESCRIPTION_LENGTH = 55;

    firestore.collection('posts')
        .orderBy('timestamp', 'desc') // Order by timestamp in descending order
        .get()
        .then(querySnapshot => {
            articlesContainer.innerHTML = ''; // Clear any existing articles
            
            if (querySnapshot.empty) {
                articlesContainer.innerHTML = '<p>No articles found.</p>';
                return;
            }

            // Fetch author profile            
            querySnapshot.forEach(doc => {

                const article = doc.data();
                const articleElement = document.createElement('div');
                articleElement.classList.add('article-more');
                
                // Create and append elements for article image and title
                const imageElement = document.createElement('img');
                imageElement.src = article.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png'; // Replace with your default image URL
                imageElement.alt = article.title;
                imageElement.classList.add('article-image-more');
                
                const contentElement = document.createElement('div');
                contentElement.classList.add('article-content-more');
                
                const titleElement = document.createElement('h3');
                let title = article.title;
                if (title.length > MAX_DESCRIPTION_LENGTH) {
                    title = title.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
                }
                titleElement.textContent = title;

                const infoContainer = document.createElement('div');
                infoContainer.classList.add('info-container');

                firestore.collection('users').doc(article.authorId).get()
                    .then(authorDoc => {
                        if (authorDoc.exists) {
                            const authorData = authorDoc.data();
                            const authorName = document.createElement('span');
                            authorName.textContent = authorData.name;
                            authorName.classList.add('author-name');

                            infoContainer.appendChild(authorName);
                        } else {
                            console.log('No such author found!');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching author data:', error);
                    });
                
                // Create and append elements for echo count
                const echoContainer = document.createElement('div');
                echoContainer.classList.add('echo-container-more');
                
                const echoImage = document.createElement('img');
                echoImage.src = 'assets/slap-1.svg';
                echoImage.alt = 'clap';
                echoImage.classList.add('clap-comment-img-more');
                
                const echoCount = document.createElement('span');
                echoCount.id = 'echo-count';
                echoCount.classList.add('count');
                echoCount.textContent = article.echos || 0; // Default to 0 if echoCount is not defined
                
                echoContainer.appendChild(echoImage);
                echoContainer.appendChild(echoCount);
                
                // Create a link for the article
                const linkElement = document.createElement('a');
                linkElement.href = `article.html?id=${doc.id}`;
                linkElement.appendChild(titleElement);
                linkElement.appendChild(infoContainer);
                linkElement.appendChild(echoContainer);
                linkElement.classList.add('article-link');

                contentElement.appendChild(linkElement);
                
                articleElement.appendChild(imageElement);
                articleElement.appendChild(contentElement);
                
                articlesContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
}   */

        
        
        


// Call the function to display all articles
//displayAllArticles();

const articlesContainer = document.getElementById('articles-container');
const observerElement = document.getElementById('observer');
const MAX_DESCRIPTION_LENGTH = 55;
const ARTICLES_PER_PAGE = 6;
let lastVisible = null;
let fetching = false;
let noMoreArticles = false; // Flag to indicate if there are no more articles

function fetchArticles() {
    if (fetching || noMoreArticles) return;
    fetching = true;

    let query = firestore.collection('posts').orderBy('timestamp', 'desc').limit(ARTICLES_PER_PAGE);

    if (lastVisible) {
        query = query.startAfter(lastVisible);
    }

    query.get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                if (!lastVisible) {
                    articlesContainer.innerHTML = '<p>No articles found.</p>';
                }
                noMoreArticles = true; // Set flag to true when no more articles are available
                fetching = false;
                return;
            }

            lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

            querySnapshot.forEach(doc => {
                const article = doc.data();
                const articleElement = document.createElement('div');
                articleElement.classList.add('article-more');

                // Create and append elements for article image and title
                const imageElement = document.createElement('img');
                imageElement.src = article.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png';
                imageElement.alt = article.title;
                imageElement.classList.add('article-image-more');

                const contentElement = document.createElement('div');
                contentElement.classList.add('article-content-more');

                const titleElement = document.createElement('h3');
                let title = article.title;
                if (title.length > MAX_DESCRIPTION_LENGTH) {
                    title = title.substring(0, MAX_DESCRIPTION_LENGTH) + '...';
                }
                titleElement.textContent = title;

                const infoContainer = document.createElement('div');
                infoContainer.classList.add('info-container');

                firestore.collection('users').doc(article.authorId).get()
                    .then(authorDoc => {
                        if (authorDoc.exists) {
                            const authorData = authorDoc.data();
                            const authorName = document.createElement('span');
                            authorName.textContent = authorData.name;
                            authorName.classList.add('author-name-more');

                            infoContainer.appendChild(authorName);
                        } else {
                            console.log('No such author found!');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching author data:', error);
                    });

                // Create and append elements for echo count
                const echoContainer = document.createElement('div');
                echoContainer.classList.add('echo-container-more');

                const echoImage = document.createElement('img');
                echoImage.src = 'assets/slap-1.svg';
                echoImage.alt = 'clap';
                echoImage.classList.add('clap-comment-img-more');

                const echoCount = document.createElement('span');
                echoCount.id = 'echo-count-article';
                echoCount.classList.add('count-more');
                echoCount.textContent = article.echos || 0;

                const echoPublish = document.createElement('span');
                echoPublish.id = 'echo-publish';
                echoPublish.classList.add('publish');
                
                // Ensure the timestamp is correctly accessed and formatted
                const publishDate = article.timestamp ? 
                    new Date(article.timestamp.seconds * 1000).toLocaleDateString('en-GB', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                    }) : 'Unknown Date';
                
                echoPublish.textContent = ' • ' + publishDate;

                echoContainer.appendChild(echoImage);
                echoContainer.appendChild(echoCount);
                echoContainer.appendChild(echoPublish);

                // Create a link for the article
                const linkElement = document.createElement('a');
                linkElement.href = `article.html?id=${doc.id}`;
                linkElement.appendChild(titleElement);
                linkElement.appendChild(infoContainer);
                linkElement.appendChild(echoContainer);
                linkElement.classList.add('article-link');

                contentElement.appendChild(linkElement);

                articleElement.appendChild(imageElement);
                articleElement.appendChild(contentElement);

                articlesContainer.appendChild(articleElement);
            });

            fetching = false;
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
            fetching = false;
        });
}

// Initial fetch
fetchArticles();

// Intersection Observer setup
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !fetching) {
            console.log('Observer triggered');
            fetchArticles();
        }
    });
}, {
    root: null, // Use the viewport as the root
    rootMargin: '100px', // Load articles slightly before the element is in view
    threshold: 0 // Trigger when even a small part of the element is visible
});

// Observe the observerElement
observer.observe(observerElement);

document.addEventListener('DOMContentLoaded', () => {
    // Select the button and textarea
    const commentButton = document.getElementById('comment-button');
    const commentItem = document.getElementById('comment-item');
    const commentTextarea = document.getElementById('comment-textarea');

    // Define the offset from the top of the screen
    const offset = 100; // Adjust this value as needed

    // Add click event listener to the button
    commentButton.addEventListener('click', () => {
        // Use scrollIntoView with smooth behaviour
        commentTextarea.scrollIntoView({
            behavior: 'smooth',
            block: 'start' // Align to the start of the container
        });

        // Ensure textarea is within a certain distance from the top
        setTimeout(() => {
            // Calculate the final scroll position
            const finalTop = commentTextarea.getBoundingClientRect().top + window.pageYOffset - offset;

            // Scroll to the final position with smooth behaviour
            window.scrollTo({
                top: finalTop,
                behavior: 'smooth'
            });

            // Focus on the textarea
            commentTextarea.focus();
        }, 500); // Delay to allow the initial smooth scroll to complete
    });

        // Add click event listener to the button
    commentItem.addEventListener('click', () => {
        // Use scrollIntoView with smooth behaviour
        commentTextarea.scrollIntoView({
            behavior: 'smooth',
            block: 'start' // Align to the start of the container
        });
    
        // Ensure textarea is within a certain distance from the top
        setTimeout(() => {
            // Calculate the final scroll position
            const finalTop = commentTextarea.getBoundingClientRect().top + window.pageYOffset - offset;
            // Scroll to the final position with smooth behaviour
            window.scrollTo({
                top: finalTop,
                behavior: 'smooth'
            });
        }, 500); // Delay to allow the initial smooth scroll to complete
    });
});





document.addEventListener('DOMContentLoaded', () => {
    // Select the button and profile elements
    const followUserBtn = document.getElementById('follow-user-btn');
    const followNotificationsImg = document.getElementById('notifications-svg');
    let isFollowing = false; // State to track if the current user is following the displayed user
    let isProcessing = false; // State to track if a follow/unfollow operation is in progress
    let authorId = ''; // Variable to store the authorId of the article

    auth.onAuthStateChanged(user => {
        if (user) {
            // Fetch the authorId of the article
            const articleId = getArticleIdFromUrl();
            if (articleId) {
                firestore.collection('posts').doc(articleId).get()
                    .then(articleDoc => {
                        if (articleDoc.exists) {
                            authorId = articleDoc.data().authorId;
                            if (authorId) {
                                checkIfFollowing(user.uid, authorId);
                                if (user.uid === authorId) {
                                    followUserBtn.style.display = 'none';
                                    return;
                                }

                                followUserBtn.addEventListener('click', () => {
                                    if (isProcessing) return; // Prevent multiple clicks while processing

                                    isProcessing = true;
                                    followUserBtn.disabled = true;

                                    if (!isFollowing) {
                                        followUser(user.uid, authorId);
                                    } else {
                                        unfollowUser(user.uid, authorId);
                                    }
                                });
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching article data:', error);
                    });
            }
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

    function getArticleIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
});
