
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Github, 
  Twitter, 
  Linkedin,
  Send,
  User,
  AtSign,
  Edit,
  CheckCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';

const Contact = () => {
  const [messageSent, setMessageSent] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending a message
    setTimeout(() => {
      setMessageSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto p-6">
          <div className="container pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
              <p className="text-muted-foreground mt-2">
                Get in touch with our team for support, feedback, or inquiries.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassMorphicCard>
                  {!messageSent ? (
                    <>
                      <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
                      
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              Name
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                placeholder="Your name"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                              Email
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AtSign className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                placeholder="Your email"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Subject
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-md border border-border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                            placeholder="Message subject"
                          />
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Message
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3">
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <textarea
                              required
                              rows={6}
                              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                              placeholder="Your message"
                            ></textarea>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <button 
                            type="submit"
                            className="inline-flex items-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 text-center"
                    >
                      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">Message Sent</h2>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll get back to you shortly.
                      </p>
                      <button
                        onClick={() => setMessageSent(false)}
                        className="inline-flex items-center py-2 px-4 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  )}
                </GlassMorphicCard>
              </div>
              
              <div>
                <GlassMorphicCard className="mb-6">
                  <h3 className="font-medium mb-6">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Email</h4>
                        <a href="mailto:support@example.com" className="text-sm text-primary hover:text-primary/80 transition-colors">
                          support@example.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Live Chat</h4>
                        <p className="text-sm text-muted-foreground">
                          Available weekdays 9AM-5PM EST
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassMorphicCard>
                
                <GlassMorphicCard>
                  <h3 className="font-medium mb-6">Connect With Us</h3>
                  
                  <div className="space-y-4">
                    <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-[#333]/10 flex items-center justify-center flex-shrink-0">
                        <Github className="h-4 w-4 text-[#333]" />
                      </div>
                      <span>GitHub</span>
                    </a>
                    
                    <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center flex-shrink-0">
                        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                      </div>
                      <span>Twitter</span>
                    </a>
                    
                    <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                      </div>
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </GlassMorphicCard>
              </div>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Contact;
