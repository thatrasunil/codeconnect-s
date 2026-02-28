import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', formData);
        setStatus('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Hide status after 5 seconds
        setTimeout(() => setStatus(''), 5000);
    };

    return (
        <div className="contact-container" style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={styles.content}
            >
                <div style={styles.header}>
                    <h1 style={styles.title}>Contact Us</h1>
                    <p style={styles.subtitle}>Have a question, feedback, or business inquiry? We'd love to hear from you.</p>
                </div>

                <div style={styles.flexContainer}>
                    <div style={styles.infoSection}>
                        <h2 style={styles.heading}>Get in Touch</h2>
                        <p style={styles.text}>
                            Whether you're looking for help with an issue, want to provide feedback on our platform, or are interested in partnership opportunities, our team is ready to assist you.
                        </p>

                        <div style={styles.contactDetails}>
                            <div style={styles.contactItem}>
                                <strong style={styles.itemLabel}>Email:</strong>
                                <span>support@codeconnect.com</span>
                            </div>
                            <div style={styles.contactItem}>
                                <strong style={styles.itemLabel}>Business Hours:</strong>
                                <span>Mon - Fri, 9:00 AM - 6:00 PM EST</span>
                            </div>
                            <div style={styles.contactItem}>
                                <strong style={styles.itemLabel}>Address:</strong>
                                <span>CodeConnect HQ<br />123 Tech Lane, Suite 400<br />Innovation City, CA 94000</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.formSection}>
                        {status && (
                            <div style={{ ...styles.statusMessage, color: status.includes('success') ? '#4ade80' : 'var(--text-primary)' }}>
                                {status}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label} htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    style={styles.textarea}
                                ></textarea>
                            </div>
                            <button type="submit" style={styles.button}>Send Message</button>
                        </form>
                    </div>
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
        fontSize: '3rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: 'var(--text-primary)',
    },
    subtitle: {
        fontSize: '1.2rem',
        color: 'var(--text-secondary)',
        maxWidth: '600px',
        margin: '0 auto',
    },
    flexContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '3rem',
    },
    infoSection: {
        flex: '1 1 300px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '2.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    formSection: {
        flex: '2 1 400px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '2.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
    },
    heading: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
    },
    text: {
        fontSize: '1rem',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
    },
    contactDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    contactItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    },
    itemLabel: {
        color: 'var(--accent-primary)',
        fontWeight: '600',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontWeight: '500',
        color: 'var(--text-secondary)',
    },
    input: {
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    textarea: {
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        resize: 'vertical',
    },
    button: {
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: 'var(--accent-primary)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '0.5rem',
    },
    statusMessage: {
        padding: '1rem',
        marginBottom: '1.5rem',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        fontWeight: '500',
    }
};

export default ContactUs;
