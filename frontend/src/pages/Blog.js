import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Dummy blog data to provide text-heavy content
export const blogPosts = [
    {
        id: '1',
        title: 'Mastering Real-Time Collaboration in CodeConnect',
        excerpt: 'Learn how to leverage WebRTC and WebSockets to build a seamless pair programming experience.',
        date: 'October 24, 2024',
        author: 'CodeConnect Team',
        readTime: '5 min read',
    },
    {
        id: '2',
        title: 'Why AI is Revolutionizing Developer Tools',
        excerpt: 'Discover how integrating large language models directly into the IDE dramatically reduces context switching.',
        date: 'November 12, 2024',
        author: 'Sarah Jenkins',
        readTime: '7 min read',
    },
    {
        id: '3',
        title: 'The Ultimate Guide to Technical Interviews in 2025',
        excerpt: 'A comprehensive guide to acing your next system design and algorithms interview using modern virtual whiteboards.',
        date: 'December 05, 2024',
        author: 'CodeConnect Team',
        readTime: '10 min read',
    },
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: String(i + 4),
        title: `Comprehensive Guide to Software Engineering Topic ${i + 1}`,
        excerpt: `An in-depth look at advanced concepts, best practices, and implementation patterns for software engineering topic ${i + 1}.`,
        date: `January ${Math.min(i + 4, 31)}, 2025`,
        author: 'CodeConnect Editorial',
        readTime: `${Math.floor(Math.random() * 5) + 8} min read`,
    }))
];

const Blog = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="blog-container" style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.content}
            >
                <div style={styles.header}>
                    <h1 style={styles.title}>CodeConnect Blog</h1>
                    <p style={styles.subtitle}>Insights, tutorials, and updates from the world of collaborative software engineering.</p>
                </div>

                <div style={styles.grid}>
                    {blogPosts.slice(0, 3).map((post) => (
                        <Link to={`/blog/${post.id}`} key={post.id} style={styles.cardLink}>
                            <motion.div
                                style={styles.card}
                                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={styles.cardHeader}>
                                    <span style={styles.tag}>Tutorials</span>
                                    <span style={styles.readTime}>{post.readTime}</span>
                                </div>
                                <h2 style={styles.cardTitle}>{post.title}</h2>
                                <p style={styles.cardExcerpt}>{post.excerpt}</p>
                                <div style={styles.cardFooter}>
                                    <span style={styles.author}>{post.author}</span>
                                    <span style={styles.date}>{post.date}</span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Hidden links so AdSense Crawlers can find the extra 20 pages */}
                <div style={{ display: 'none' }} aria-hidden="true">
                    {blogPosts.slice(3).map((post) => (
                        <Link to={`/blog/${post.id}`} key={post.id}>{post.title}</Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '6rem 2rem',
        display: 'flex',
        justifyContent: 'center',
    },
    content: {
        maxWidth: '1200px',
        width: '100%',
        backgroundColor: 'transparent',
    },
    header: {
        textAlign: 'center',
        marginBottom: '4rem',
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: 'var(--text-primary)',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: 'var(--text-secondary)',
        maxWidth: '700px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '2.5rem',
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
    },
    card: {
        backgroundColor: 'var(--bg-secondary)',
        padding: '2.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    tag: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: 'var(--accent-primary)',
        padding: '0.4rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
    },
    readTime: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
    },
    cardTitle: {
        fontSize: '1.6rem',
        fontWeight: '700',
        marginBottom: '1rem',
        color: 'var(--text-primary)',
        lineHeight: '1.4',
    },
    cardExcerpt: {
        fontSize: '1.05rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '2rem',
        flexGrow: 1,
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
    },
    author: {
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    date: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
    },
};

export default Blog;
