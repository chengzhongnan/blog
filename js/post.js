document.addEventListener('DOMContentLoaded', async () => {
    // 获取页面元素
    const postTitleEl = document.getElementById('post-title');
    const postNumberEl = document.getElementById('post-number');
    const postMetaEl = document.getElementById('post-meta');
    const postHeroImageEl = document.getElementById('post-hero-image');
    const postContentEl = document.getElementById('post-content');

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        postContentEl.innerHTML = '<p>错误：未找到指定的文章。</p>';
        return;
    }

    // 从全局 allPosts (来自 posts-data.js) 中查找当前文章
    const currentPost = allPosts.find(p => p.slug === slug);

    if (!currentPost) {
        postContentEl.innerHTML = `<p>错误：在数据文件中未找到 slug 为 "${slug}" 的文章。</p>`;
        return;
    }

    try {
        const response = await fetch(`/content/${slug}/index.md`);
        if (!response.ok) throw new Error('文章 Markdown 文件加载失败');
        const markdownText = await response.text();

        // 仅提取内容部分，因为元数据已在 currentPost 对象中
        const content = markdownText.replace(/^---\s*([\s\S]*?)\s*---/, '').trim();

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

        // 填充页面元数据
        document.title = currentPost.title;
        postTitleEl.textContent = currentPost.title;
        postNumberEl.textContent = `#${currentPost.number}`;
        postMetaEl.textContent = `发布于 ${formatDate(currentPost.date)}`;
        
        if (currentPost.heroImage) {
            postHeroImageEl.src = currentPost.heroImage;
            postHeroImageEl.alt = currentPost.title;
        } else {
            postHeroImageEl.style.display = 'none';
        }

        // 渲染 Markdown 内容
        postContentEl.innerHTML = marked.parse(content);
        hljs.highlightAll();
        renderMathInElement(postContentEl, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });

        // 渲染前后文章导航
        const prevPostEl = document.getElementById('prev-post');
        const nextPostEl = document.getElementById('next-post');

        if (currentPost.previous) {
            prevPostEl.innerHTML = `<a href="/post.html?slug=${currentPost.previous.slug}"><span class="nav-label">&laquo; 前一篇</span><span class="nav-title">${currentPost.previous.title}</span></a>`;
        }
        if (currentPost.next) {
            nextPostEl.innerHTML = `<a href="/post.html?slug=${currentPost.next.slug}"><span class="nav-label">后一篇 &raquo;</span><span class="nav-title">${currentPost.next.title}</span></a>`;
        }

    } catch (error) {
        console.error('加载文章时出错:', error);
        postContentEl.innerHTML = `<p>抱歉，加载文章时遇到问题。</p>`;
    }
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
