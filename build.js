const fs = require('fs');
const path = require('path');

// --- 配置 ---
const CONTENT_DIR = path.join(__dirname, 'content');
const OUTPUT_FILE = path.join(__dirname, 'js', 'posts-data.js');
const POSTS_PER_PAGE = 5;

/**
 * 从 Markdown 文本中解析 Front Matter
 */
function parseFrontMatter(text, slug) {
    const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = text.match(frontMatterRegex);
    const metadata = {};
    let content = text;

    if (match) {
        const frontMatter = match[1];
        content = text.substring(match[0].length).trim();
        frontMatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');
            }
        });
    }

    const firstParagraph = content.split('\n\n')[0] || '';
    const plainText = firstParagraph
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^[#\s>*-]+/gm, '')
        .replace(/\n/g, ' ')
        .trim();

    metadata.excerpt = plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '');
    metadata.slug = slug;
    metadata.heroImage = `content/${slug}/${metadata.heroImage}`;
    return metadata;
}

/**
 * 主构建函数
 */
function build() {
    console.log('🚀 开始构建文章数据...');
    const postDirs = fs.readdirSync(CONTENT_DIR).filter(file => fs.statSync(path.join(CONTENT_DIR, file)).isDirectory());
    
    const allPostsRaw = postDirs.map(slug => {
        const mdPath = path.join(CONTENT_DIR, slug, 'index.md');
        if (!fs.existsSync(mdPath)) return null;
        const markdownText = fs.readFileSync(mdPath, 'utf-8');
        return parseFrontMatter(markdownText, slug);
    }).filter(post => post !== null);

    // 按日期倒序排序 (最新 -> 最旧)
    allPostsRaw.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 【核心改动】处理编号和前后文章链接
    const allPosts = allPostsRaw.map((post, index, arr) => ({
        ...post,
        number: arr.length - index, // 最新的文章编号最大
        previous: index + 1 < arr.length ? { title: arr[index + 1].title, slug: arr[index + 1].slug } : null,
        next: index - 1 >= 0 ? { title: arr[index - 1].title, slug: arr[index - 1].slug } : null,
    }));

    const paginatedPosts = [];
    for (let i = 0; i < allPosts.length; i += POSTS_PER_PAGE) {
        paginatedPosts.push(allPosts.slice(i, i + POSTS_PER_PAGE));
    }

    console.log(`✅ 找到并处理了 ${allPosts.length} 篇文章, 分为 ${paginatedPosts.length} 页。`);

    // 【核心改动】同时导出 allPosts 和 paginatedPosts
    const fileContent = `
// 该文件由 build.js 自动生成，请勿手动修改！
const allPosts = ${JSON.stringify(allPosts, null, 4)};
const paginatedPosts = ${JSON.stringify(paginatedPosts, null, 4)};
const postsPerPage = ${POSTS_PER_PAGE};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`🎉 成功生成文章数据文件: ${OUTPUT_FILE}`);
}

build();

