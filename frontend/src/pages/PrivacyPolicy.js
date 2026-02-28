import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
                <h1 style={styles.title}>Privacy Policy</h1>
                <p style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>

                <div style={styles.section}>
                    <h2 style={styles.heading}>1. Introduction</h2>
                    <p style={styles.text}>
                        Welcome to CodeConnect. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>2. The Data We Collect</h2>
                    <p style={styles.text}>
                        Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                    </p>
                    <ul style={styles.list}>
                        <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data:</strong> includes email address.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                        <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>3. Cookies and Third-Party Advertisers (AdSense)</h2>
                    <p style={styles.text}>
                        We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.
                    </p>
                    <p style={styles.text}>
                        Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google's <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" style={styles.link}>Ads Settings</a>.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>4. How We Use Your Data</h2>
                    <p style={styles.text}>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul style={styles.list}>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal obligation.</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>5. Data Security</h2>
                    <p style={styles.text}>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>6. Your Legal Rights</h2>
                    <p style={styles.text}>
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>7. Contact Us</h2>
                    <p style={styles.text}>
                        If you have any questions about this privacy policy or our privacy practices, please contact us via our Contact Us page.
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

export default PrivacyPolicy;
