import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const CookiePolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-container" style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.content}
            >
                <h1 style={styles.title}>Cookie Policy</h1>
                <p style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>

                <div style={styles.section}>
                    <h2 style={styles.heading}>1. What Are Cookies?</h2>
                    <p style={styles.text}>
                        Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to recognize your device and remember if you've been to the website before. Cookies are widely used to make websites work more efficiently, as well as to provide reporting information to the site owners.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>2. How We Use Cookies</h2>
                    <p style={styles.text}>
                        CodeConnect uses cookies for various purposes, including:
                    </p>
                    <ul style={styles.list}>
                        <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our website, such as secure login sessions.</li>
                        <li><strong>Performance and Analytics Cookies:</strong> These cookies collect information about how you use our website, which helps us to improve its performance and design.</li>
                        <li><strong>Advertising Cookies (Google AdSense):</strong> We use third-party advertising companies, such as Google, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide personalized advertisements about goods and services of interest to you.</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>3. Google AdSense and DoubleClick Cookie</h2>
                    <p style={styles.text}>
                        Google, as a third-party vendor, uses cookies to serve ads on our Service. Google's use of the DoubleClick cookie enables it and its partners to serve ads to our users based on their visit to our Service or other websites on the Internet.
                    </p>
                    <p style={styles.text}>
                        You may opt out of the use of the DoubleClick Cookie for interest-based advertising by visiting the Google Ads Settings web page: <a href="http://www.google.com/ads/preferences/" target="_blank" rel="noopener noreferrer" style={styles.link}>http://www.google.com/ads/preferences/</a>
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>4. Managing Cookies</h2>
                    <p style={styles.text}>
                        You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>5. Contact Us</h2>
                    <p style={styles.text}>
                        If you have any questions about our use of cookies or other technologies, please contact us via our Contact Us page.
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
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)',
    },
    lastUpdated: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        marginBottom: '2rem',
    },
    section: {
        marginBottom: '2rem',
    },
    heading: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem',
    },
    text: {
        fontSize: '1rem',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
    },
    list: {
        paddingLeft: '1.5rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        listStyleType: 'disc',
        marginBottom: '1rem',
    },
    link: {
        color: 'var(--accent-primary)',
        textDecoration: 'none',
    },
};

export default CookiePolicy;
