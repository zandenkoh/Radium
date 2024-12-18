/*window.onload = function() {
    var currentUrl = window.location.href;
    var newUrl = currentUrl.replace("zandenkoh.github.io", "zandenkoh.codeberg.page");
    if (currentUrl !== newUrl) {
        window.location.href = newUrl;
    }
};*/

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
  const welcomeMessage = document.getElementById('welcome-message');
  let currentUser = null;
  
  // Check authentication and fetch user data
  auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        fetchUserProfile(user.uid); // Pass user ID here
        loadArticlesByFilter('all');
    } else {
        window.location.href = 'join.html'; // Redirect if not authenticated
    }
  });
  
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  
  let progress = 0;
  
  /*const updateProgress = (increment) => {
    progress += increment;
    loadingBar.style.width = `${progress}%`;
    if (progress >= 100) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1500); // Delay slightly more than the transition duration
    }
  };*/

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
                profileMobilePic.style.backgroundImage = `url(${data.profilePicture})`;
            } else {
                profilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)'; // Placeholder image if none exists
                profileMobilePic.style.backgroundImage = 'url(https://i.pinimg.com/474x/81/8a/1b/818a1b89a57c2ee0fb7619b95e11aebd.jpg)'; // Placeholder image if none exists
            }
            updateProgress(100);
        } else {
            console.log('No such document!');
            updateProgress(50);
        }
    }).catch((error) => {
        console.log('Error getting document:', error);
        updateProgress(50);
    });
  };
  
  // Initialize Firestore
  const db = firebase.firestore();
  
  let lastVisible = null;
  let loading = false;
  
  async function loadArticlesByFilter(filter) {
      if (loading) return;
      loading = true;
    
      try {
          const articlesContainer = document.getElementById('articles-container');
          //let query = db.collection('posts').orderBy('timestamp', 'desc').limit(5);
          let query = db.collection('posts')
            .orderBy('timestamp', 'desc') // Ensure 'timestamp' exists and is indexed in Firestore
            .limit(5);

    
          if (filter !== 'all') {
              query = query.where('theme', '==', filter);
          }
    
          if (lastVisible) {
              query = query.startAfter(lastVisible);
          }
    
          const snapshot = await query.get();
    
          if (snapshot.empty) {
              if (!lastVisible) {
                  articlesContainer.innerHTML = '<p>No articles available.</p>';
              }
              return;
          }
    
          // Update the last visible document
          lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
          // Fetch and display articles
          snapshot.forEach(async (doc) => {
              const data = doc.data();
              console.log('Article data:', data); // Log article data for debugging
    
              // Fetch author profile
              const authorDoc = await firestore.collection('users').doc(data.authorId).get();
              const authorData = authorDoc.data() || {};
              console.log('Author data:', authorData); // Log author data for debugging
    
              // Create article element
              const articleElement = document.createElement('article');
              articleElement.classList.add('article');
    
              // Generate HTML for the article
              articleElement.innerHTML = `
                  <div class="article-link">
                      <div class="article-header">
                          <div class="author-info">
                              <img src="${authorData.profilePicture || './assets/default-profile-pic.jpg'}" alt="Author" class="author-pic">
                              <div class="author-details">
                                  <p class="author-name"><a title="Written by ${authorData.name || 'an unknown author'}" href="user.html?userId=${data.authorId}">${authorData.name || 'Unknown Author'}</a> in <b title="${data.theme || 'Topic'}">${data.theme || 'Topic'}</b></p>
                              </div>
                          </div>
                      </div>
                      <a class="article-body" title="${data.title || 'No Title'}" href="article.html?id=${doc.id}">
                          <div class="article-text">
                              <h2 class="article-title">${data.title || 'No Title'}</h2>
                              <p title="${data.description || 'No Description'}" class="article-excerpt">
                                  ${data.description
                                      ? (data.description.length > 125 
                                          ? data.description.substring(0, 125) + '...' 
                                          : data.description)
                                      : 'No content available.'}
                              </p>

                              <span class="publish-date" title="${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'} • ${data.timeRead || 'Unknown number of'} min read">${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'} • ${data.timeRead || 'Unknown number of'} min read</span>
                          </div>
                          <img src="${data.imageUrl || 'https://www.impactmania.com/wp-content/themes/cardinal/images/default-thumb.png'}" class="article-image" style="object-fit: cover;">
                      </a>
                  </div>
              `;
    
              // Append article element to the container
              articlesContainer.appendChild(articleElement);
          });
      } catch (error) {
          console.error('Error loading articles: ', error);
          document.getElementById('articles-container').innerHTML = '<p>Failed to load articles. Please try again later.</p>';
      } finally {
          loading = false;
      }
  }
  // Intersection observer for lazy loading
  const loadMoreTrigger = document.getElementById('load-more-trigger');
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading) {
        const activeTab = document.querySelector('.tab.active').getAttribute('data-filter');
        loadArticlesByFilter(activeTab);
    }
  });
  
  observer.observe(loadMoreTrigger);
  
  document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const searchInput = document.getElementById('search-input');

    // Update tabs based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tabId') || 'all'; // Default to 'all' if no tabId is specified
    updateActiveTab(activeTab);

    // Add click event listeners to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.textContent.toLowerCase();
            window.history.pushState({}, '', `index.html?tabId=${encodeURIComponent(filter)}`);
            updateActiveTab(filter);
            lastVisible = null; // Reset pagination
            document.getElementById('articles-container').innerHTML = ''; // Clear existing articles
            loadArticlesByFilter(filter); // Load articles based on selected filter
        });
    });

    // Initial load based on URL filter
    loadArticlesByFilter(activeTab);

    // Add event listener for Enter key on search input
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const searchQuery = searchInput.value.trim();
            if (searchQuery) {
                window.location.href = `search.html?search_query=${encodeURIComponent(searchQuery)}`;
            }
        }
    });
});

const updateActiveTab = (filter) => {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase() === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
};

  
/*
window.addEventListener('scroll', adjustMobileNav);

function adjustMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 0) {
        mobileNav.style.transform = 'translateY(-20px)'; // Adjust the value as needed
    } else {
        mobileNav.style.transform = 'translateY(0)';
    }
}
*/

window.addEventListener('scroll', adjustMobileNav);

function adjustMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    if (window.innerHeight < vh) {
        mobileNav.style.transform = `translateY(${vh - window.innerHeight}px)`;
    } else {
        mobileNav.style.transform = 'translateY(0)';
    }
}


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
