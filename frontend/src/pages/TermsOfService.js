import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
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
                <h1 style={styles.title}>Terms of Service</h1>
                <p style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>

                <div style={styles.section}>
                    <h2 style={styles.heading}>1. Acceptance of Terms</h2>
                    <p style={styles.text}>
                        By accessing or using CodeConnect, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>2. Description of Service</h2>
                    <p style={styles.text}>
                        CodeConnect provides a platform for developers to collaborate, write code, solve problems, and connect with peers. The service is provided "as is" and we reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>3. User Accounts</h2>
                    <p style={styles.text}>
                        When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>
                    <p style={styles.text}>
                        You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>4. User Content</h2>
                    <p style={styles.text}>
                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service.
                    </p>
                    <p style={styles.text}>
                        By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>5. Prohibited Conduct</h2>
                    <p style={styles.text}>
                        You agree not to use the Service:
                    </p>
                    <ul style={styles.list}>
                        <li>In any way that violates any applicable local, national, or international law or regulation.</li>
                        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
                        <li>To impersonate or attempt to impersonate CodeConnect, a CodeConnect employee, another user, or any other person or entity.</li>
                        <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
                    </ul>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>6. Intellectual Property</h2>
                    <p style={styles.text}>
                        The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of CodeConnect and its licensors.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>7. Limitation of Liability</h2>
                    <p style={styles.text}>
                        In no event shall CodeConnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.heading}>8. Changes to Terms</h2>
                    <p style={styles.text}>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
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
};

export default TermsOfService;
