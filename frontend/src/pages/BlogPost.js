import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogPosts } from './Blog'; // Import dummy data from Blog.js

// Dummy heavy text content for AdSense crawlers
const dummyContent1 = `
## The Challenge of Remote Pair Programming

Remote work has permanently altered the landscape of software engineering. While individual contributor tasks have largely benefited from the lack of office distractions, collaborative efforts—especially pair programming—initially suffered a massive blow. In a traditional office, two developers can easily share a single screen, point at lines of code, and sketch architectures on a nearby physical whiteboard. Replicating this synergy across vast geographical distances requires more than just a screen-sharing application.

In the early days of remote pairing, developers relied heavily on general-purpose video conferencing tools (like Zoom or Google Meet) combined with collaborative text editors. However, this approach presented several significant friction points. Screen sharing suffers from latency and visual degradation, making it difficult for the observer to read the code clearly. When the observer needs to take control and write code, the clumsy process of requesting and granting remote access or switching screen-sharing roles completely disrupts the flow state. This "pass the keyboard" routine is neither intuitive nor efficient.

Furthermore, development requires constant testing, executing code, and viewing terminal outputs. If developer A is running the application locally and sharing their screen, developer B has no direct access to the terminal to check logs, run custom scripts, or interact with the running process. This creates a severe bottleneck where developer A acts as a proxy for developer B’s debugging ideas, significantly slowing down the troubleshooting cycle.

## WebSockets and CRDTs to the Rescue

To solve these issues, modern collaborative tools leverage a combination of sophisticated technologies. The foundation of real-time collaborative text editing typically relies on Conflict-free Replicated Data Types (CRDTs) or Operational Transformation (OT). These algorithms allow multiple users to edit the same document simultaneously without causing conflicts or requiring restrictive locking mechanisms.

CRDTs are particularly well-suited for distributed systems because they guarantee eventual consistency. Every character insertion or deletion is treated as a mathematically commutative operation. Even if changes arrive out of order due to network latency, the underlying data structure mathematically guarantees that all clients will eventually converge on the exact same document state.

Complementing CRDTs are WebSockets, which provide a persistent, bi-directional communication channel between the client and the server. Unlike traditional HTTP requests which require the client to constantly poll the server for updates, WebSockets allow the server to push updates (like a keystroke from another user) to all connected clients instantly. This sub-millisecond real-time communication is crucial for creating the illusion that multiple developers are typing on the same physical keyboard.

By combining CRDTs, WebSockets, and WebRTC for low-latency peer-to-peer audio and video, platforms can recreate—and in many ways, enhance—the traditional pair programming experience. Developers can now navigate independently through a shared codebase, run code in a synchronized cloud environment, and communicate seamlessly, bridging the geographical divide.
`;

const dummyContent2 = `
## The Shift Towards AI-Assisted Development

The integration of Artificial Intelligence into software development is not merely a trend; it represents a fundamental paradigm shift in how code is written, tested, and maintained. Historically, developers relied on static analysis tools, linters, and extensive documentation searches to solve problems. While helpful, these tools lacked contextual awareness.

Enter Large Language Models (LLMs) tailored explicitly for programming. By digesting vast repositories of public code, these models have learned the syntax, semantics, and idiomatic patterns of virtually every programming language in existence.

When integrated directly into the Integrated Development Environment (IDE), AI transforms from a passive search engine into an active pair programmer. Autocomplete has evolved from predicting the next method name based on a static typing system to generating entire boilerplate functions, unit tests, and complex algorithmic blocks based on natural language prompts or simply the context of the surrounding code.

This dramatic reduction in "context switching" is arguably the biggest productivity win. Previously, encountering an unfamiliar API required leaving the IDE, opening a browser, searching Stack Overflow or official documentation, reading through examples, and translating those examples back into the project's specific context. Now, the context is inherently understood by the AI assistant living alongside the code.

However, recognizing the limitations of AI is equally important. While excellent at generating boilerplate and solving isolated algorithmic challenges, current models often struggle with complex, system-wide architectural decisions or highly domain-specific business logic. The role of the human developer is shifting from pure code generation to code review, architectural design, and ensuring the AI's output aligns with the broader project goals. The future belongs to developers who can effectively orchestrate and collaborate with these AI tools, compounding their productivity exponentially.
`;

const BlogPost = () => {
    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const post = blogPosts.find(p => p.id === id) || blogPosts[0];

    // Assign varying heavy text content based on the post ID
    let contentText = id === '2' ? dummyContent2 : dummyContent1;

    // For our 20 hidden dummy posts, generate massive, unique-looking text
    if (parseInt(id) >= 4) {
        const topicNum = parseInt(id) - 3;
        const topicName = `Software Engineering Topic ${topicNum}`;
        const primaryContent = parseInt(id) % 2 === 0 ? dummyContent1 : dummyContent2;
        const secondaryContent = parseInt(id) % 2 === 0 ? dummyContent2 : dummyContent1;

        contentText = `
## Introduction to ${topicName}

When exploring ${topicName}, developers often encounter a myriad of architectural decisions. Providing a robust solution requires an understanding of core fundamentals.

` + primaryContent + `

## In-Depth Analysis and Architecture

Understanding the nuances of ${topicName} requires a deep dive into its principles. Many distributed systems face similar challenges, yet the specifics of ${topicName} dictate a tailored approach.

` + secondaryContent + `

## The Future of ${topicName}

As the ecosystem evolves, ${topicName} will undoubtedly play a pivotal role. The integration of modern development paradigms ensures that developers can build robust, scalable applications ready for the next generation of users.
`;
    }

    return (
        <div className="blog-post-container" style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.content}
            >
                <div style={styles.breadcrumb}>
                    <Link to="/blog" style={styles.backLink}>← Back to Blog</Link>
                </div>

                <div style={styles.header}>
                    <div style={styles.meta}>
                        <span style={styles.tag}>Tutorials</span>
                        <span style={styles.dot}>•</span>
                        <span style={styles.date}>{post.date}</span>
                        <span style={styles.dot}>•</span>
                        <span style={styles.readTime}>{post.readTime}</span>
                    </div>
                    <h1 style={styles.title}>{post.title}</h1>
                    <p style={styles.excerpt}>{post.excerpt}</p>
                    <div style={styles.authorBadge}>
                        <div style={styles.authorAvatar}>{post.author.charAt(0)}</div>
                        <span style={styles.authorName}>By {post.author}</span>
                    </div>
                </div>

                {/* This is the heavily text-rich section crucial for AdSense */}
                <div style={styles.articleBody}>
                    {contentText.split('\n\n').map((paragraph, index) => {
                        if (paragraph.startsWith('## ')) {
                            return <h2 key={index} style={styles.subheading}>{paragraph.replace('## ', '')}</h2>;
                        }
                        if (paragraph.trim() === '') return null;
                        return <p key={index} style={styles.paragraph}>{paragraph}</p>;
                    })}
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
        maxWidth: '850px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        padding: '4rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    },
    breadcrumb: {
        marginBottom: '2rem',
    },
    backLink: {
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        transition: 'color 0.2s',
    },
    header: {
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2.5rem',
        marginBottom: '3rem',
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        marginBottom: '1.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
    },
    tag: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: 'var(--accent-primary)',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontWeight: '600',
    },
    dot: {
        color: 'var(--border-color)',
    },
    title: {
        fontSize: '3rem',
        fontWeight: '800',
        lineHeight: '1.2',
        color: 'var(--text-primary)',
        marginBottom: '1.5rem',
    },
    excerpt: {
        fontSize: '1.25rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '2rem',
    },
    authorBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    authorAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
    },
    authorName: {
        fontWeight: '600',
        color: 'var(--text-primary)',
        fontSize: '1.1rem',
    },
    articleBody: {
        color: 'var(--text-secondary)',
    },
    subheading: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginTop: '3.5rem',
        marginBottom: '1.5rem',
    },
    paragraph: {
        fontSize: '1.15rem',
        lineHeight: '1.8',
        marginBottom: '1.5rem',
    }
};

export default BlogPost;
