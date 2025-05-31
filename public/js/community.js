// Community Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initializePostCreation();
    initializePostInteractions();
    loadPosts();
});

// Post Creation
function initializePostCreation() {
    const postTypeButtons = document.querySelectorAll('.type-option');
    const postInput = document.querySelector('.post-input');
    const shareButton = document.querySelector('.create-post .btn-primary');
    let selectedType = 'text'; // default type

    // Handle post type selection
    postTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            postTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedType = button.dataset.type;
            updatePlaceholder(selectedType);
        });
    });

    // Handle post creation
    shareButton?.addEventListener('click', async () => {
        const content = postInput.value.trim();
        if (!content) return;

        try {
            await createPost(content, selectedType);
            postInput.value = '';
            showNotification('Post created successfully!');
            await loadPosts(); // Reload posts to show the new one
        } catch (error) {
            showNotification('Failed to create post', 'error');
        }
    });
}

// Post Interactions
function initializePostInteractions() {
    document.querySelector('.feed-posts')?.addEventListener('click', async (e) => {
        const postElement = e.target.closest('.feed-post');
        if (!postElement) return;

        // Like button handling
        if (e.target.closest('.like-btn')) {
            const postId = postElement.dataset.postId;
            const likeButton = e.target.closest('.like-btn');
            try {
                await handleLike(likeButton, postId);
            } catch (error) {
                showNotification('Failed to update like', 'error');
            }
        }

        // Comment button handling
        if (e.target.closest('.comment-btn')) {
            const commentSection = postElement.querySelector('.comments-section');
            if (commentSection) {
                commentSection.classList.toggle('hidden');
                focusCommentInput(postElement);
            }
        }

        // Comment submission
        if (e.target.closest('.send-comment')) {
            const input = postElement.querySelector('.comment-input');
            if (input && input.value.trim()) {
                try {
                    await handleComment(postElement, input);
                    input.value = '';
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
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, type })
    });

    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
}

async function loadPosts() {
    try {
        const response = await fetch('/api/community/posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        showNotification('Failed to load posts', 'error');
    }
}

async function handleLike(button, postId) {
    const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to toggle like');
    const data = await response.json();
    
    // Update UI
    const likeCount = button.querySelector('.like-count');
    const icon = button.querySelector('i');
    if (data.liked) {
        button.classList.add('liked');
        icon.classList.replace('far', 'fas');
        likeCount.textContent = parseInt(likeCount.textContent || 0) + 1;
    } else {
        button.classList.remove('liked');
        icon.classList.replace('fas', 'far');
        likeCount.textContent = Math.max(0, parseInt(likeCount.textContent || 0) - 1);
    }
}

async function handleComment(postElement, input) {
    const postId = postElement.dataset.postId;
    const content = input.value.trim();

    const response = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) throw new Error('Failed to add comment');
    const data = await response.json();

    // Update UI
    const commentsSection = postElement.querySelector('.comments-section');
    const newComment = {
        id: data.id,
        content,
        author: { username: 'You' }, // We'll show the current user as 'You'
        created_at: new Date()
    };
    renderComment(commentsSection, newComment);
    updateCommentCount(postElement);
}

// Helper Functions
function updatePlaceholder(type) {
    const postInput = document.querySelector('.post-input');
    switch (type) {
        case 'workout':
            postInput.placeholder = 'Share your workout achievement...';
            break;
        case 'progress':
            postInput.placeholder = 'Share your fitness progress...';
            break;
        default:
            postInput.placeholder = 'What\'s on your mind?';
    }
}

function renderPosts(posts) {
    const feedContainer = document.querySelector('.feed-posts');
    if (!feedContainer) return;

    feedContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    return `
        <article class="feed-post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">
                        <img src="/images/user-img.svg" alt="${post.username}">
                    </div>
                    <div class="author-info">
                        <h3 class="author-name">${post.username}</h3>
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
                <div class="engagement-actions">
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
                        <button class="send-comment" aria-label="Send comment">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function createWorkoutCard(workout) {
    if (!workout.workout_data) return '';
    // Add your workout card HTML here
    return `<div class="workout-card">...</div>`;
}

function createProgressCard(progress) {
    if (!progress.progress_data) return '';
    // Add your progress card HTML here
    return `<div class="progress-card">...</div>`;
}

function createCommentHTML(comment) {
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-avatar">
                <img src="/images/user-img.svg" alt="${comment.author.username}">
            </div>
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
    const diff = (now - date) / 1000; // difference in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}

function renderComment(commentsSection, comment) {
    const commentHTML = createCommentHTML(comment);
    const commentsContainer = commentsSection.querySelector('.comments-list') || 
                            commentsSection.insertAdjacentElement('afterbegin', createElement('div', 'comments-list'));
    commentsContainer.insertAdjacentHTML('beforeend', commentHTML);
}

function updateCommentCount(postElement) {
    const countElement = postElement.querySelector('.comment-count');
    const currentCount = parseInt(countElement.textContent || 0);
    countElement.textContent = currentCount + 1;
}

function showNotification(message, type = 'success') {
    // You can use any notification library here, or create a simple one
    alert(message);
}

// Helper function to create elements with classes
function createElement(tag, className) {
    const element = document.createElement(tag);
    if