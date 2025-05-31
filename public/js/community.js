// Community Page JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadUserProfile();
        initializePostCreation();
        initializePostInteractions();
        initializeFeedFilters();
        await loadPosts();
    } catch (error) {
        showNotification('Error initializing page', 'error');
    }
});

// Load User Profile
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        
        // Update profile section
        document.querySelector('.profile-info .username').textContent = userData.username;
        document.querySelector('.user-panel .username').textContent = `@${userData.username}`;
        
        // Update stats
        await updateUserStats();
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update User Stats
async function updateUserStats() {
    try {
        const response = await fetch('/api/community/user/stats');
        if (!response.ok) throw new Error('Failed to fetch user stats');
        const stats = await response.json();
        
        document.getElementById('postsCount').textContent = stats.posts || 0;
        document.getElementById('followersCount').textContent = stats.followers || 0;
        document.getElementById('followingCount').textContent = stats.following || 0;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Post Creation
function initializePostCreation() {
    const postTypeButtons = document.querySelectorAll('.type-option');
    const postInput = document.querySelector('.post-input');
    const shareButton = document.querySelector('.create-post .btn-primary');
    let selectedType = 'text'; // default type

    postTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            postTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedType = button.dataset.type;
            updatePlaceholder(selectedType);
        });
    });

    shareButton?.addEventListener('click', async () => {
        const content = postInput.value.trim();
        if (!content) {
            showNotification('Please enter some content', 'warning');
            return;
        }

        try {
            shareButton.disabled = true;
            await createPost(content, selectedType);
            postInput.value = '';
            showNotification('Post created successfully!');
            await loadPosts(); // Reload posts
            await updateUserStats(); // Update post count
        } catch (error) {
            showNotification('Failed to create post', 'error');
        } finally {
            shareButton.disabled = false;
        }
    });
}

// Feed Filters
function initializeFeedFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', async () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            await loadPosts(button.dataset.filter);
        });
    });
}

// Post Interactions
function initializePostInteractions() {
    const feedPosts = document.querySelector('.feed-posts');
    if (!feedPosts) return;

    feedPosts.addEventListener('click', async (e) => {
        const target = e.target;
        const post = target.closest('.feed-post');
        if (!post) return;

        // Like button
        if (target.closest('.like-btn')) {
            const likeBtn = target.closest('.like-btn');
            try {
                await handleLike(likeBtn, post.dataset.postId);
            } catch (error) {
                showNotification('Failed to update like', 'error');
            }
        }

        // Comment button
        if (target.closest('.comment-btn')) {
            const commentSection = post.querySelector('.comments-section');
            if (commentSection) {
                commentSection.classList.toggle('hidden');
                if (!commentSection.classList.contains('hidden')) {
                    const input = commentSection.querySelector('.comment-input');
                    if (input) input.focus();
                }
            }
        }

        // Send comment button
        if (target.closest('.send-comment')) {
            const commentInput = post.querySelector('.comment-input');
            const content = commentInput?.value.trim();
            
            if (content) {
                try {
                    await handleComment(post, commentInput);
                    commentInput.value = '';
                } catch (error) {
                    showNotification('Failed to add comment', 'error');
                }
            }
        }
    });
}

// API Calls
async function createPost(content, type) {
    const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type })
    });

    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
}

async function loadPosts(filter = 'all') {
    const feedPosts = document.querySelector('.feed-posts');
    if (!feedPosts) return;

    try {
        feedPosts.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';
        
        const response = await fetch(`/api/community/posts?filter=${filter}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        feedPosts.innerHTML = '<div class="error-message">Failed to load posts. Please try again.</div>';
        console.error('Error loading posts:', error);
    }
}

async function handleLike(button, postId) {
    const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to toggle like');
    const { liked } = await response.json();
    
    const icon = button.querySelector('i');
    const count = button.querySelector('.like-count');
    const currentCount = parseInt(count.textContent);
    
    if (liked) {
        button.classList.add('liked');
        icon.className = 'fas fa-heart';
        count.textContent = currentCount + 1;
    } else {
        button.classList.remove('liked');
        icon.className = 'far fa-heart';
        count.textContent = Math.max(0, currentCount - 1);
    }
}

async function handleComment(post, input) {
    const response = await fetch(`/api/community/posts/${post.dataset.postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.value })
    });

    if (!response.ok) throw new Error('Failed to add comment');
    const data = await response.json();
    
    const commentsSection = post.querySelector('.comments-section');
    renderComment(commentsSection, {
        id: data.id,
        content: input.value,
        author: { username: 'You' },
        created_at: new Date()
    });

    // Update comment count
    const countEl = post.querySelector('.comment-count');
    countEl.textContent = parseInt(countEl.textContent || '0') + 1;
}

// Helper Functions
function updatePlaceholder(type) {
    const postInput = document.querySelector('.post-input');
    if (!postInput) return;

    switch (type) {
        case 'workout':
            postInput.placeholder = 'Share your workout achievement...';
            break;
        case 'progress':
            postInput.placeholder = 'Share your fitness progress...';
            break;
        default:
            postInput.placeholder = "What's on your mind?";
    }
}

function renderPosts(posts) {
    const feedPosts = document.querySelector('.feed-posts');
    if (!feedPosts) return;

    if (!posts.length) {
        feedPosts.innerHTML = '<div class="no-posts">No posts to show</div>';
        return;
    }

    feedPosts.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    return `
        <article class="feed-post card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="author-info">
                    <img src="images/user-img.svg" alt="${post.username}" class="author-avatar">
                    <div class="author-meta">
                        <span class="author-name">${post.username}</span>
                        <span class="post-time">${formatTime(post.created_at)}</span>
                    </div>
                </div>
            </div>

            <div class="post-content">
                ${formatContent(post.content)}
                ${post.type === 'workout' ? createWorkoutCard(post) : ''}
                ${post.type === 'progress' ? createProgressCard(post) : ''}
            </div>

            <div class="post-engagement">
                <button class="action-btn like-btn ${post.user_liked ? 'liked' : ''}" aria-label="Like">
                    <i class="${post.user_liked ? 'fas' : 'far'} fa-heart"></i>
                    <span class="like-count">${post.likes_count || 0}</span>
                </button>
                <button class="action-btn comment-btn" aria-label="Comment">
                    <i class="far fa-comment"></i>
                    <span class="comment-count">${post.comments_count || 0}</span>
                </button>
            </div>

            <div class="comments-section hidden">
                ${post.comments ? post.comments.map(comment => createCommentHTML(comment)).join('') : ''}
                <div class="add-comment">
                    <input type="text" class="comment-input" placeholder="Add a comment...">
                    <button class="send-comment" aria-label="Send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function createCommentHTML(comment) {
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <img src="images/user-img.svg" alt="${comment.author.username}" class="comment-avatar">
            <div class="comment-content">
                <span class="comment-author">${comment.author.username}</span>
                <p>${comment.content}</p>
                <span class="comment-time">${formatTime(comment.created_at)}</span>
            </div>
        </div>
    `;
}

function formatContent(content) {
    return content
        .replace(/(#\w+)/g, '<span class="hashtag">$1</span>')
        .replace(/\n/g, '<br>');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}