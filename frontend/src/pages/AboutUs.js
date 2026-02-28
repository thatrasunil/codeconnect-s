import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-container" style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.content}
            >
                <div style={styles.header}>
                    <h1 style={styles.title}>About CodeConnect</h1>
                    <p style={styles.subtitle}>Empowering developers to build, collaborate, and ship faster.</p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>Our Mission</h2>
                    <p style={styles.text}>
                        At CodeConnect, we believe that coding should be an accessible, collaborative, and engaging experience for everyone. Our mission is to break down the barriers of remote development by providing a state-of-the-art platform where engineers can seamlessly edit, solve problems, and communicate in real-time, no matter where they are in the world.
                    </p>
                </div>

                <div style={styles.gridSection}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Real-time Collaboration</h3>
                        <p style={styles.cardText}>
                            Experience pair programming like never before. With our collaborative editor, you can code together with your peers in real-time, share terminal outputs, and debug seamlessly.
                        </p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Integrated Workspaces</h3>
                        <p style={styles.cardText}>
                            Everything you need in one place. From video calls to a virtual whiteboard, we provide all the tools necessary to run effective technical interviews, hackathons, or daily standups.
                        </p>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Community-Driven</h3>
                        <p style={styles.cardText}>
                            We grow with our users. CodeConnect is continually evolving based on the feedback from our community, allowing us to build the features that developers actually want and need.
                        </p>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>Our Story</h2>
                    <p style={styles.text}>
                        CodeConnect was born out of frustration with existing collaboration tools that felt clunky and disconnected. We wanted a holistic environment where we could jump on a call, pull up an IDE, diagram a systemic architecture, and execute code all in the same browser tab. What started as an internal tool rapidly grew into the platform you see today, helping thousands of engineers connect and create extraordinary software every day.
                    </p>
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
        maxWidth: '1000px',
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
        fontSize: '1.4rem',
        color: 'var(--text-secondary)',
        maxWidth: '700px',
        margin: '0 auto',
    },
    section: {
        backgroundColor: 'var(--bg-secondary)',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)',
        marginBottom: '3rem',
    },
    heading: {
        fontSize: '2rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.8rem',
    },
    text: {
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: 'var(--text-secondary)',
    },
    gridSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    card: {
        backgroundColor: 'var(--bg-tertiary)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        transition: 'transform 0.2s ease',
    },
    cardTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--accent-primary)',
    },
    cardText: {
        fontSize: '1rem',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
    },
};

export default AboutUs;
