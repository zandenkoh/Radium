document.addEventListener('DOMContentLoaded', function() {
    // Check if the screen width is less than 900px
    if (window.innerWidth < 900) {
        // Get the current page's URL
        const currentPage = window.location.pathname;

        // Check if the user is not already on join.html
        if (!currentPage.endsWith("join.html")) {
            // Redirect to join.html if the condition is met
            window.location.href = "join.html";
        }
    }
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

const auth = firebase.auth();
const firestore = firebase.firestore();

const profilePic = document.getElementById('profile-pic');
const profileMobilePic = document.getElementById('profile-mobile-pic');
const userNameSpan = document.getElementById('user-name');
let currentUser = null;

// Check authentication and fetch user data
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        fetchUserProfile(user.uid);
        const searchQuery = new URLSearchParams(window.location.search).get('search_query');
        if (searchQuery) {
            searchArticles(searchQuery);
        }
    } else {
        window.location.href = 'join.html';
    }
});

// Fetch user profile from Firestore
const fetchUserProfile = (userId) => {
    firestore.collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            userNameSpan.textContent = data.name || 'User';
            const profileImage = data.profilePicture || 'https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg';
            profilePic.style.backgroundImage = `url(${profileImage})`;
            profileMobilePic.style.backgroundImage = `url(${profileImage})`;
        } else {
            console.log('No such document!');
        }
    }).catch((error) => {
        console.log('Error getting document:', error);
    });
};

// Initialize Firestore
const db = firebase.firestore();
let loading = false;

async function searchArticles(query) {
    if (loading) return;
    loading = true;

    const articlesContainer = document.getElementById('search-results-container');
    const resultsHeader = document.getElementById('results-header');
    
    // Set the header to show the search query
    resultsHeader.innerHTML = `Results for <b>${query}</b>`;

    articlesContainer.innerHTML = '<p class="load-articles-loader">Loading articles...</p>'; // Show loading indicator

    try {
        const queryWords = query.toLowerCase().split(' ');
        const snapshot = await db.collection('posts').get();

        articlesContainer.innerHTML = ''; // Clear loading indicator

        let hasMatches = false;

        const articlePromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const title = data.title ? data.title.toLowerCase() : '';
            const description = data.description ? data.description.toLowerCase() : '';

            const matches = queryWords.some(word => title.includes(word) || description.includes(word));

            if (matches) {
                hasMatches = true;
                const authorDoc = await firestore.collection('users').doc(data.authorId).get();
                const authorData = authorDoc.data() || {};
                const articleElement = createArticleElement(doc.id, data, authorData);
                articlesContainer.appendChild(articleElement);
            }
        });

        await Promise.all(articlePromises); // Ensure all article promises are resolved
    } catch (error) {
        console.error('Error searching articles: ', error);
        articlesContainer.innerHTML = '<p>Failed to search articles. Please try again later.</p>';
    } finally {
        loading = false;
    }
}

function createArticleElement(docId, data, authorData) {
    const articleElement = document.createElement('article');
    articleElement.classList.add('article');

    articleElement.innerHTML = `
        <a href="article.html?id=${docId}" class="article-link">
            <div class="article-header">
                <div class="author-info">
                    <img src="${authorData.profilePicture || './assets/default-profile-pic.jpg'}" alt="Author" class="author-pic">
                    <div class="author-details">
                        <p class="author-name" href="user.html?userId=${data.authorId}"><b>${authorData.name || 'Unknown Author'}</b> in <b>${data.theme || 'Topic'}</b></p>
                    </div>
                </div>
            </div>
            <div class="article-body">
                <div class="article-text">
                    <h2 class="article-title" style="font-weight: 900; color: #000;">${data.title || 'No Title'}</h2>
                    <p class="article-excerpt" style="font-size: 17px; color: #666;">${data.description ? data.description.substring(0, 125) + '...' : ''}</p>
                    <span class="publish-date">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'} • ${data.timeRead || '1'} min read</span>
                </div>
                <img src="${data.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png'}" class="article-image" style="object-fit: cover;">
            </div>
        </a>
    `;
    return articleElement;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsHeader = document.getElementById('results-header');

    // Check URL for search query and perform search
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search_query');
    if (searchQuery) {
        searchInput.value = searchQuery;
        searchArticles(searchQuery);
    } else {
        resultsHeader.textContent = ''; // Clear the header if no search query is present
    }

    // Add event listener for the search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.history.pushState({}, '', `?search_query=${query}`);
                searchArticles(query);
            } else {
                resultsHeader.textContent = ''; // Clear the header if no search query is present
                document.getElementById('search-results-container').innerHTML = '';
            }
        }
    });
});
/*
// Initialize Firestore
const db = firebase.firestore();
let loading = false;

function showStories() {
    document.getElementById('tab-stories').classList.add('active');
    document.getElementById('tab-people').classList.remove('active');
    document.getElementById('search-results-container').style.display = 'block';
    document.getElementById('user-results-container').style.display = 'none';
}

function showPeople() {
    document.getElementById('tab-stories').classList.remove('active');
    document.getElementById('tab-people').classList.add('active');
    document.getElementById('search-results-container').style.display = 'none';
    document.getElementById('user-results-container').style.display = 'block';
}

async function searchArticles(query) {
    if (loading) return;
    loading = true;

    const articlesContainer = document.getElementById('search-results-container');
    const usersContainer = document.getElementById('user-results-container');
    const resultsHeader = document.getElementById('results-header');
    
    // Set the header to show the search query
    resultsHeader.innerHTML = `Results for <b>${query}</b>`;

    articlesContainer.innerHTML = '<p class="load-articles-loader">Loading articles...</p>'; // Show loading indicator

    try {
        const queryWords = query.toLowerCase().split(' ');
        const snapshot = await db.collection('posts').get();

        articlesContainer.innerHTML = ''; // Clear loading indicator
        usersContainer.innerHTML = ''; // Clear previous user results

        let hasMatches = false;

        const articlePromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const title = data.title ? data.title.toLowerCase() : '';
            const description = data.description ? data.description.toLowerCase() : '';

            const matches = queryWords.some(word => title.includes(word) || description.includes(word));

            if (matches) {
                hasMatches = true;
                const authorDoc = await firestore.collection('users').doc(data.authorId).get();
                const authorData = authorDoc.data() || {};
                const articleElement = createArticleElement(doc.id, data, authorData);
                articlesContainer.appendChild(articleElement);
            }
        });

        await Promise.all(articlePromises); // Ensure all article promises are resolved

        // Search for users
        const userSnapshot = await db.collection('users').get();
        const userPromises = userSnapshot.docs.map(doc => {
            const userData = doc.data();
            const name = userData.name ? userData.name.toLowerCase() : '';
            const bio = userData.bio ? userData.bio.toLowerCase() : '';

            const userMatches = queryWords.some(word => name.includes(word) || bio.includes(word));

            if (userMatches) {
                const userElement = createUserElement(doc.id, userData);
                usersContainer.appendChild(userElement);
            }
        });

        await Promise.all(userPromises); // Ensure all user promises are resolved

    } catch (error) {
        console.error('Error searching articles: ', error);
        articlesContainer.innerHTML = '<p>Failed to search articles. Please try again later.</p>';
    } finally {
        loading = false;
    }
}

function createArticleElement(docId, data, authorData) {
    const articleElement = document.createElement('article');
    articleElement.classList.add('article');

    articleElement.innerHTML = `
        <a href="article.html?id=${docId}" class="article-link">
            <div class="article-header">
                <div class="author-info">
                    <img src="${authorData.profilePicture || './assets/default-profile-pic.jpg'}" alt="Author" class="author-pic">
                    <div class="author-details">
                        <p class="author-name" href="user.html?userId=${data.authorId}"><b>${authorData.name || 'Unknown Author'}</b> in <b>${data.theme || 'Topic'}</b></p>
                    </div>
                </div>
            </div>
            <div class="article-body">
                <div class="article-text">
                    <h2 class="article-title" style="font-weight: 900; color: #000;">${data.title || 'No Title'}</h2>
                    <p class="article-excerpt" style="font-size: 17px; color: #666;">${data.description ? data.description.substring(0, 125) + '...' : ''}</p>
                    <span class="publish-date">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'} • ${data.timeRead || '1'} min read</span>
                </div>
                <img src="${data.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png'}" class="article-image" style="object-fit: cover;">
            </div>
        </a>
    `;
    return articleElement;
}

function createUserElement(userId, userData) {
    const userElement = document.createElement('div');
    userElement.classList.add('user');

    userElement.innerHTML = `
        <a href="user.html?userId=${userId}" class="user-link">
            <div class="user-info">
                <img src="${userData.profilePicture || './assets/default-profile-pic.jpg'}" alt="User" class="user-pic">
                <div class="user-details">
                    <p class="user-name"><b>${userData.name || 'Unknown User'}</b></p>
                    <p class="user-bio">${userData.bio || ''}</p>
                </div>
            </div>
        </a>
    `;

    return userElement;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsHeader = document.getElementById('results-header');

    // Check URL for search query and perform search
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search_query');
    if (searchQuery) {
        searchInput.value = searchQuery;
        searchArticles(searchQuery);
        showStories(); // Default to showing stories
    } else {
        resultsHeader.textContent = ''; // Clear the header if no search query is present
    }

    // Add event listener for the search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.history.pushState({}, '', `?search_query=${query}`);
                searchArticles(query);
                showStories(); // Default to showing stories
            } else {
                resultsHeader.textContent = ''; // Clear the header if no search query is present
                document.getElementById('search-results-container').innerHTML = '';
                document.getElementById('user-results-container').innerHTML = '';
            }
        }
    });
});*/








document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    const headerHeight = header.offsetHeight;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = scrollTop - lastScrollTop;
        const currentTransform = getComputedStyle(header).transform;
        const currentTransformY = currentTransform !== 'none' ? parseInt(currentTransform.split(',')[5]) : 0;

        if (scrollDelta > 0) {
            // Scrolling down
            const newTransformY = Math.max(-headerHeight, currentTransformY - scrollDelta);
            header.style.transform = `translateY(${newTransformY}px)`;
        } else if (scrollDelta < 0) {
            // Scrolling up
            const newTransformY = Math.min(0, currentTransformY - scrollDelta);
            header.style.transform = `translateY(${newTransformY}px)`;
        }

        lastScrollTop = scrollTop;
    });
});
