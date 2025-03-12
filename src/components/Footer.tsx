
import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Linux Agents API. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
            <a 
              href="https://github.com/harshavmb/nannyai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Github className="h-4 w-4 mr-1" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
