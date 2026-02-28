import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Disclaimer = () => {
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
                <h1 style={styles.title}>Disclaimer</h1>
                <p style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>

                <div style={styles.section}>
                    <h2 style={styles.heading}>1. General Information</h2>
                    <p style={styles.text}>
                        The information provided by CodeConnect ("we," "us," or "our") on our website is for general informational and educational purposes only. All information on the Site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or code snippets on the Site.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>2. Educational Platform</h2>
                    <p style={styles.text}>
                        CodeConnect is a collaborative coding platform designed for learning, problem-solving, and professional development. The code, algorithms, and technical discussions shared on this platform by users or via our AI chatbot are not guaranteed to be secure, bug-free, or suitable for production environments. You are solely responsible for reviewing and testing any code before implementing it into your own software projects.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>3. External Links Disclaimer</h2>
                    <p style={styles.text}>
                        The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. We will not be a party to or in any way be responsible for monitoring any transaction between you and third-party providers of products or services.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>4. Advertising and Affiliates</h2>
                    <p style={styles.text}>
                        This Site may contain advertisements and sponsored content. We use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you. CodeConnect does not endorse the products or services advertised therein.
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
};

export default Disclaimer;
