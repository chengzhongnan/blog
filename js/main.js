document.addEventListener('DOMContentLoaded', function () {
    const postListContainer = document.getElementById('post-list');
    const paginationNav = document.getElementById('pagination-nav');

    // 从 URL 获取当前页码，默认为第 1 页
    const params = new URLSearchParams(window.location.search);
    let currentPage = parseInt(params.get('page') || '1', 10);

    // paginatedPosts 和 postsPerPage 来自于 posts-data.js
    const totalPages = paginatedPosts.length;

    // 确保页码在有效范围内
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;

    /**
     * 渲染指定页码的文章列表
     */
    function renderPosts(page) {
        // 获取当前页的文章数据，注意数组索引从0开始
        const postsForPage = paginatedPosts[page - 1] || [];

        postListContainer.innerHTML = ''; // 清空旧内容

        if (postsForPage.length === 0) {
            postListContainer.innerHTML = '<p>暂无文章，敬请期待！</p>';
            return;
        }

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            // 检查日期是否有效
            if (isNaN(date.getTime())) {
                return dateStr; // 如果日期无效，返回原始字符串
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以+1
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const postHTML = postsForPage.map(post => `
            <a href="/post.html?slug=${post.slug}" class="post-card">
                <img src="${post.heroImage}" alt="${post.title}">
                <div class="post-card-content">
                    <h2>${post.title}</h2>
                    <p class="meta">发布于 ${formatDate(post.date)}</p>
                    <p>${post.excerpt}</p>
                </div>
            </a>
        `).join('');

        postListContainer.innerHTML = postHTML;
    }

    /**
     * 渲染分页导航
     */
    function renderPagination() {
        if (totalPages <= 1) return; // 如果只有一页或没有文章，则不显示分页

        let paginationHTML = '';

        // 上一页按钮
        if (currentPage > 1) {
            paginationHTML += `<a href="?page=${currentPage - 1}">&laquo; 上一页</a>`;
        }

        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHTML += `<span class="active">${i}</span>`;
            } else {
                paginationHTML += `<a href="?page=${i}">${i}</a>`;
            }
        }

        // 下一页按钮
        if (currentPage < totalPages) {
            paginationHTML += `<a href="?page=${currentPage + 1}">下一页 &raquo;</a>`;
        }

        paginationNav.innerHTML = paginationHTML;
    }

    // 初始化页面
    renderPosts(currentPage);
    renderPagination();
});

// --- 樱花飘落特效 (保持不变) ---
function createSakuraPetals() {
    const sakuraContainer = document.querySelector('.sakura-petals');
    if (!sakuraContainer) return;
    const numberOfPetals = 20;
    for (let i = 0; i < numberOfPetals; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.animationDelay = `${Math.random() * 10}s`;
        petal.style.animationDuration = `${5 + Math.random() * 10}s`;
        const size = 15 + Math.random() * 15;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.opacity = Math.random();
        sakuraContainer.appendChild(petal);
    }
}
createSakuraPetals();
