import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaTwitter, FaGithub, FaDiscord, FaLinkedin } from 'react-icons/fa';
import Logo from '../logo.svg';

const Footer = () => {
    const location = useLocation();

    // Hide Footer in Editor and other full-screen routes
    if (location.pathname.startsWith('/room/') || location.pathname.startsWith('/solve/')) {
        return null;
    }

    return (
        <footer className="global-footer" style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '6rem 2rem 2rem',
            background: 'linear-gradient(to bottom, #0b1120, #020617)',
            position: 'relative',
            zIndex: 1,
            marginTop: 'auto' // Push to bottom if content is short
        }}>
            {/* Top Gradient Line */}
            <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '80%', height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '5rem' }}>

                {/* Brand Column */}
                <div style={{ maxWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <img src={Logo} alt="CodeConnect Logo" style={{ width: '40px', height: '40px' }} />
                        <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>CodeConnect</span>
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
                        The most advanced real-time collaboration platform for developers. Code, debug, and ship together instantly.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {[
                            { icon: FaTwitter, link: '#' },
                            { icon: FaGithub, link: '#' },
                            { icon: FaDiscord, link: '#' },
                            { icon: FaLinkedin, link: '#' }
                        ].map((social, index) => (
                            <a key={index} href={social.link} className="social-link" style={{
                                width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.3s ease'
                            }}>
                                <social.icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links Columns */}
                <div>
                    <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1.5rem' }}>Product</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Features', 'Integrations', 'Pricing', 'Changelog', 'Docs'].map(item => (
                            <li key={item}><a href="#" className="footer-link">{item}</a></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1.5rem' }}>Company</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['About Us', 'Careers', 'Blog', 'Contact', 'Partners'].map(item => (
                            <li key={item}><a href="#" className="footer-link">{item}</a></li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div>
                    <h4 style={{ color: 'white', fontWeight: '700', marginBottom: '1.5rem' }}>Stay Updated</h4>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        Subscribe to our newsletter for the latest updates and developer tips.
                    </p>
                    <div style={{ position: 'relative' }}>
                        <input type="email" placeholder="Enter your email" style={{
                            width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none'
                        }} />
                        <button style={{
                            position: 'absolute', right: '5px', top: '5px', bottom: '5px', padding: '0 1rem', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600'
                        }}>
                            Join
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.9rem'
            }}>
                <div>© 2026 CodeConnect Inc. All rights reserved.</div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Service</a>
                    <a href="#" className="footer-link">Cookie Policy</a>
                </div>
            </div>

            <style>{`
          .footer-link {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.2s ease;
          }
          .footer-link:hover {
            color: #3b82f6;
          }
          .social-link:hover {
            background: #3b82f6 !important;
            color: white !important;
            transform: translateY(-3px);
            color: white !important;
          }
        `}</style>
        </footer>
    );
};

export default Footer;
