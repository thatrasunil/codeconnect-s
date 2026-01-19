import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaTwitter, FaGithub, FaDiscord, FaLinkedin, FaHeart } from 'react-icons/fa';
import Logo from '../logo.svg';

const Footer = () => {
    const location = useLocation();

    // Hide Footer in Editor and other full-screen routes
    if (location.pathname.startsWith('/room/') || location.pathname.startsWith('/solve/')) {
        return null;
    }

    return (
        <footer className="global-footer">
            <div className="footer-gradient-line" />

            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-brand">
                    <div className="logo-container">
                        <img src={Logo} alt="CodeConnect Logo" />
                        <span>CodeConnect</span>
                    </div>
                    <p>
                        Empowering developers to build, collaborate, and ship faster. <br />
                        Join the future of coding today.
                    </p>
                    <div className="social-icons">
                        {[
                            { icon: FaTwitter, link: '#', color: '#1DA1F2' },
                            { icon: FaGithub, link: '#', color: '#ffffff' },
                            { icon: FaDiscord, link: '#', color: '#5865F2' },
                            { icon: FaLinkedin, link: '#', color: '#0A66C2' }
                        ].map((social, index) => (
                            <a key={index} href={social.link} className="social-link" style={{ '--hover-color': social.color }}>
                                <social.icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="footer-links-grid">
                    <div className="footer-section">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Integrations</a></li>
                            <li><a href="#">Pricing</a></li>
                            <li><a href="#">Changelog</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                            <li><a href="#">Community</a></li>
                            <li><a href="#">Blog</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                            <li><a href="#">Security</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} CodeConnect. Made with <FaHeart className="heart-icon" /> for devs.</p>
            </div>

            <style>{`
                .global-footer {
                    background: var(--bg-primary);
                    position: relative;
                    padding: 4rem 2rem 2rem;
                    border-top: 1px solid var(--border-color);
                    margin-top: auto;
                    overflow: hidden;
                }

                .footer-gradient-line {
                    position: absolute;
                    top: 0;
                    left: 20%;
                    right: 20%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
                    opacity: 0.5;
                }

                .footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4rem;
                    justify-content: space-between;
                    margin-bottom: 3rem;
                }

                .footer-brand {
                    flex: 1;
                    min-width: 280px;
                    max-width: 400px;
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .logo-container img {
                    width: 32px;
                    height: 32px;
                }

                .logo-container span {
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .footer-brand p {
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .social-icons {
                    display: flex;
                    gap: 1rem;
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid transparent;
                }

                .social-link:hover {
                    background: var(--bg-secondary);
                    color: var(--hover-color);
                    transform: translateY(-5px) scale(1.1);
                    border-color: var(--hover-color);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                .footer-links-grid {
                    display: flex;
                    gap: 4rem;
                    flex-wrap: wrap;
                }

                .footer-section h4 {
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                    position: relative;
                    display: inline-block;
                }
                
                .footer-section h4::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 20px;
                    height: 2px;
                    background: var(--accent-primary);
                    border-radius: 2px;
                }

                .footer-section ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-section li {
                    margin-bottom: 0.75rem;
                }

                .footer-section a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    transition: color 0.2s ease, transform 0.2s ease;
                    display: inline-block;
                    position: relative;
                }

                .footer-section a:hover {
                    color: var(--accent-primary);
                    transform: translateX(5px);
                }

                .footer-bottom {
                    text-align: center;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                .heart-icon {
                    color: var(--error);
                    animation: heartbeat 1.5s infinite;
                    vertical-align: middle;
                    margin: 0 4px;
                }

                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.1); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.1); }
                    70% { transform: scale(1); }
                }

                @media (max-width: 768px) {
                    .footer-content {
                        flex-direction: column;
                        gap: 2rem;
                    }
                    
                    .footer-links-grid {
                        gap: 2rem;
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
