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
const welcomeMessage = document.getElementById('welcome-message');
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
      welcomeMessage.textContent = `Welcome, ${data.name || 'User'}!`;
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

// Initialize Firestore
const db = firebase.firestore();

// Function to load articles
async function loadArticles(query = '') {
  try {
    const articlesContainer = document.getElementById('articles-container');
    let snapshot;

    if (query) {
      // Split the query into lowercase keywords
      const keywords = query.toLowerCase().split(' ');

      // Fetch articles where any search keyword matches and order by timestamp
      snapshot = await db.collection('posts')
        .where('searchKeywords', 'array-contains-any', keywords)
        .orderBy('timestamp', 'desc')
        .get();
    } else {
      // Fetch all articles if no query is provided and order by timestamp
      snapshot = await db.collection('posts')
        .orderBy('timestamp', 'desc')
        .get();
    }

    if (snapshot.empty) {
      articlesContainer.innerHTML = '<p>No articles available.</p>';
      return;
    }

    // Clear any existing content
    articlesContainer.innerHTML = '';

    // Fetch and display articles
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Fetch author profile
      const authorDoc = await firestore.collection('users').doc(data.authorId).get();
      const authorData = authorDoc.data() || {};

      // Create article element
      const articleElement = document.createElement('article');
      articleElement.classList.add('article');

      // Log data for debugging
      console.log('Article Data:', data);

      // Generate HTML for the article
      articleElement.innerHTML = `
        <a href="article.html?id=${doc.id}" class="article-link">
          <div class="article-header">
            <div class="author-info">
              <img src="${authorData.profilePicture || './assets/default-profile-pic.jpg'}" alt="Author" class="author-pic">
              <div class="author-details">
                <span class="author-name">${authorData.name || 'Unknown Author'}</span>
              </div>
            </div>
          </div>
          <div class="article-body">
            <div class="article-text">
              <h2 class="article-title">${data.title || 'No Title'}</h2>
              <p class="article-excerpt">${data.description ? data.description.substring(0, 400) + '...' : 'No content available.'}</p>
              <span class="publish-date">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown Date'}</span>
            </div>
            <!--<img src="${data.imageURL || 'No Image'}" class="article-image" style="width: 100%; max-height: 400px; object-fit: cover;">-->
          </div>
        </a>
      `;

      // Append article element to the container
      articlesContainer.appendChild(articleElement);
    }
  } catch (error) {
    console.error('Error loading articles: ', error);
    document.getElementById('articles-container').innerHTML = '<p>Failed to load articles. Please try again later.</p>';
  }
}

// Load articles on page load or when search query changes
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('search') || '';
  loadArticles(query);
};

// Add event listener to search bar
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value;
    window.location.href = `index.html?search=${encodeURIComponent(query)}`;
  }
});
