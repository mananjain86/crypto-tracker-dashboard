import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-inner border-t-4 border-gradient-to-r from-blue-400 via-blue-600 to-blue-800 transition-all duration-300">
      <div className="footer-container flex flex-col md:flex-row justify-between items-center px-6 py-8 font-sans">
        <div className="footer-left mb-4 md:mb-0">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-coins" style={{ color: 'hsl(219, 88%, 57%)' }}></i> CRYPTOGAZE
          </h3>
          <p className="text-gray-700 dark:text-gray-300">Stay ahead in the crypto game.</p>
        </div>
        <div className="footer-center mb-4 md:mb-0">
          <ul className="footer-links flex gap-4">
            <li><a className="hover:text-blue-600 transition-all duration-200" href="/">Home</a></li>
            <li><a className="hover:text-blue-600 transition-all duration-200" href="#contact">Contact</a></li>
            <li><a className="hover:text-blue-600 transition-all duration-200" href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-right">
          <p className="text-gray-700 dark:text-gray-300">Socials:</p>
          <div className="social-icons flex gap-3 mt-2">
            <a className="hover:scale-110 hover:text-blue-600 transition-all duration-200" href="https://github.com/mananjain86" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-github"></i></a>
            <a className="hover:scale-110 hover:text-blue-600 transition-all duration-200" href="#" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-discord"></i></a>
            <a className="hover:scale-110 hover:text-blue-600 transition-all duration-200" href="#" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin"></i></a>
            <a className="hover:scale-110 hover:text-blue-600 transition-all duration-200" href="#" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom text-center py-4 bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-md">
        <p className="text-gray-700 dark:text-gray-300">© 2025 CryptoGaze. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 