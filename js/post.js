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

    const currentPost = allPosts.find(p => p.slug === slug);

    if (!currentPost) {
        postContentEl.innerHTML = `<p>错误：在数据文件中未找到 slug 为 "${slug}" 的文章。</p>`;
        return;
    }

    try {
        const response = await fetch(`/content/${slug}/index.md`);
        if (!response.ok) throw new Error('文章 Markdown 文件加载失败');
        const markdownText = await response.text();

        const content = markdownText.replace(/^---\s*([\s\S]*?)\s*---/, '').trim();

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

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

        postContentEl.innerHTML = marked.parse(content);
        hljs.highlightAll();
        renderMathInElement(postContentEl, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });

        initializeReferenceToggler();
        initializeImageLightbox(); // 初始化图片灯箱功能

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

/**
 * 初始化文章内图片的点击放大功能 (灯箱)
 */
function initializeImageLightbox() {
    const postContentEl = document.getElementById('post-content');
    if (!postContentEl) return;

    const images = postContentEl.getElementsByTagName('img');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!lightboxOverlay || !lightboxImage || !lightboxClose) return;

    for (const image of images) {
        image.addEventListener('click', (e) => {
            // 阻止图片点击事件冒泡到上层，避免立即关闭
            e.stopPropagation(); 
            lightboxImage.src = image.src;
            lightboxOverlay.style.display = 'flex';
        });
    }

    const closeLightbox = () => {
        lightboxOverlay.style.display = 'none';
        lightboxImage.src = ''; // 清空src避免显示旧图片
    };

    // 【修改】现在，点击整个覆盖层（包括图片和关闭按钮）都会关闭灯箱
    lightboxOverlay.addEventListener('click', closeLightbox);
}


function initializeReferenceToggler() {
    const contentEl = document.getElementById('post-content');
    if (!contentEl) return;
    const markerEl = Array.from(contentEl.querySelectorAll('h2, h3, p > strong')).find(el => el.textContent.trim().startsWith('参考文献'));
    if (!markerEl) return;
    const referenceStartNode = (markerEl.tagName === 'STRONG') ? markerEl.parentElement : markerEl;
    const container = document.createElement('div');
    container.className = 'references-collapsible';
    const toggle = document.createElement('button');
    toggle.className = 'references-toggle';
    toggle.innerHTML = `<span>参考文献</span><svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>`;
    const panel = document.createElement('div');
    panel.className = 'references-panel';
    const elementsToMove = [];
    let currentNode = referenceStartNode;
    while (currentNode) {
        elementsToMove.push(currentNode);
        currentNode = currentNode.nextElementSibling;
    }
    elementsToMove.forEach(el => panel.appendChild(el));
    container.appendChild(toggle);
    container.appendChild(panel);
    contentEl.appendChild(container);
    toggle.addEventListener('click', () => {
        container.classList.toggle('is-open');
        const buttonText = toggle.querySelector('span');
        if (container.classList.contains('is-open')) {
            buttonText.textContent = '参考文献';
        } else {
            buttonText.textContent = '参考文献';
        }
    });
}

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

