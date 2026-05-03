import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MessageCircle, Share2, X, CheckCircle, Shield, LifeBuoy } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto text-gray-600 leading-relaxed">
          {content}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; content: React.ReactNode }>({
    isOpen: false,
    title: '',
    content: null,
  });

  const openModal = (title: string, content: React.ReactNode) => {
    setModalConfig({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const footerContent = {
    howToHire: (
      <div className="space-y-4">
        <p className="font-bold text-gray-900">1. Post a Job</p>
        <p>Tell us about your project. The more detail you provide, the better freelancers can understand your needs.</p>
        <p className="font-bold text-gray-900">2. Review Proposals</p>
        <p>Expert freelancers will apply. Review their profiles, portfolios, and ratings to find the perfect match.</p>
        <p className="font-bold text-gray-900">3. Safe Payment</p>
        <p>Use our escrow system to ensure your money is only released when you are 100% satisfied with the work.</p>
      </div>
    ),
    talentMarketplace: (
      <div className="space-y-4">
        <p>Salone Freelance hosts Sierra Leone's most diverse pool of digital talent.</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Web Development</div>
          <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Graphic Design</div>
          <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Digital Marketing</div>
          <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> Writing & Translation</div>
        </div>
      </div>
    ),
    projectPlanning: (
      <div className="space-y-4">
        <p>Successful projects start with great planning. We help you define:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Clear project scope and deliverables</li>
          <li>Realistic timelines and milestones</li>
          <li>Budgeting strategies for different project types</li>
          <li>Effective communication plans</li>
        </ul>
      </div>
    ),
    postAJob: (
      <div className="space-y-4">
        <p>Ready to find your expert? When you post a job on Salone Freelance, you get:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access to verified local talent</li>
          <li>Competitive bidding for your project</li>
          <li>Dedicated project workspace</li>
          <li>24/7 support from our team</li>
        </ul>
      </div>
    ),
    howToFindWork: (
      <div className="space-y-4">
        <p className="font-bold text-gray-900">1. Create Your Profile</p>
        <p>Showcase your skills, portfolio, and experience. A complete profile gets 5x more job offers.</p>
        <p className="font-bold text-gray-900">2. Apply for Jobs</p>
        <p>Browse through hundreds of projects and send tailored proposals to clients.</p>
        <p className="font-bold text-gray-900">3. Get Paid Securely</p>
        <p>Our milestone system ensures you get paid for the work you do, on time, every time.</p>
      </div>
    ),
    directContracts: (
      <div className="space-y-4">
        <p>Have a client outside Salone Freelance? Use our Direct Contracts feature to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Secure your payments with escrow</li>
          <li>Manage project files and communication</li>
          <li>Build your platform reputation with outside projects</li>
        </ul>
      </div>
    ),
    successStories: (
      <div className="space-y-4 italic text-center">
        <p>"Salone Freelance helped me grow my agency from 1 to 10 people in just one year. The talent here is world-class!"</p>
        <p className="not-italic font-bold text-gray-900">— Ahmed K., Tech Innovators</p>
        <p className="mt-6">"I found a consistent stream of high-paying projects that allowed me to go full-time as a designer."</p>
        <p className="not-italic font-bold text-gray-900">— Mariama S., Graphic Designer</p>
      </div>
    ),
    joinAsFreelancer: (
      <div className="space-y-4">
        <p>Why join Salone Freelance?</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Zero upfront fees to start</li>
          <li>Highest payment security in Sierra Leone</li>
          <li>Global visibility for your local skills</li>
          <li>Connect with the best businesses in the country</li>
        </ul>
      </div>
    ),
    helpCenter: (
      <div className="space-y-4">
        <p>Need help? Our support team is here for you.</p>
        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3">
          <LifeBuoy className="text-primary-600 shrink-0" size={20} />
          <div>
            <p className="font-bold text-primary-900">Live Support</p>
            <p className="text-primary-700 text-sm">Available Monday to Friday, 9am - 5pm GMT</p>
          </div>
        </div>
        <p>You can also email us at <span className="text-primary-600 font-bold">salonefreelance@gmail.com</span></p>
      </div>
    ),
    trustAndSafety: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-primary-600 font-bold mb-4">
          <Shield size={24} /> Security is our priority
        </div>
        <p>We protect our community through:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Identity verification for all members</li>
          <li>Escrow payment protection</li>
          <li>Dispute resolution services</li>
          <li>Proactive fraud monitoring</li>
        </ul>
      </div>
    ),
    communityGuidelines: (
      <div className="space-y-4">
        <p>To keep our marketplace fair and professional, we expect all members to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Be honest in profiles and proposals</li>
          <li>Communicate respectfully</li>
          <li>Honor commitments and deadlines</li>
          <li>Keep all payments on the platform</li>
        </ul>
      </div>
    ),
    contactUs: (
      <div className="space-y-6">
        <p>We'd love to hear from you!</p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              <Mail size={20} />
            </div>
            <span>salonefreelance@gmail.com</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              <Globe size={20} />
            </div>
            <span>New York Garage, Freetown</span>
          </div>
        </div>
      </div>
    ),
    privacyPolicy: (
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900">Privacy Policy for Salone Freelance</h4>
        <p>We collect and process your personal data only as necessary to provide our services. This includes your contact information, profile data, and payment details.</p>
        <p>We do not sell your personal data to third parties. We use industry-standard security measures to protect your information.</p>
      </div>
    ),
    termsOfService: (
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900">Terms of Service Agreement</h4>
        <p>By using Salone Freelance, you agree to abide by our marketplace rules. This includes completing work as promised and maintaining platform integrity.</p>
        <p>All intellectual property created during a project belongs to the client upon full payment, unless otherwise agreed.</p>
      </div>
    ),
    cookiePolicy: (
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900">Cookie Usage</h4>
        <p>We use cookies to enhance your experience, remember your preferences, and analyze our traffic.</p>
        <p>By continuing to use our site, you consent to our use of cookies as described in our Privacy Policy.</p>
      </div>
    ),
    mobileApp: (
      <div className="space-y-6">
        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
          <h4 className="font-bold text-primary-900 mb-2">How to Install the App</h4>
          <div className="space-y-4 text-sm text-primary-800">
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center shrink-0 font-bold">1</span>
              <p><span className="font-bold">Download the App:</span> Click download and wait for APK to finish downloading.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center shrink-0 font-bold">2</span>
              <p><span className="font-bold">Open the File:</span> Go to Downloads folder or tap the downloaded file.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center shrink-0 font-bold">3</span>
              <p><span className="font-bold">Allow Installation:</span> Enable "Allow installation from this browser" or "Install unknown apps" in settings.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center shrink-0 font-bold">4</span>
              <p><span className="font-bold">Install the App:</span> Tap Install and wait for installation.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center shrink-0 font-bold">5</span>
              <p><span className="font-bold">Launch:</span> Open Salone Freelance and log in.</p>
            </div>
          </div>
        </div>
        <a 
          href="https://drive.google.com/uc?export=download&id=1knoOPoRcjfuCvftCH_sw-TlGlfq6jJcs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full text-center bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
        >
          📥 Download APK Now
        </a>
      </div>
    ),
  };

  return (
    <>
      <Modal 
        isOpen={modalConfig.isOpen} 
        onClose={closeModal} 
        title={modalConfig.title} 
        content={modalConfig.content} 
      />
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center mb-6">
                <img src="/SF-logo.png" alt="Salone Freelance Logo" className="h-8 w-auto mr-3" />
                <span className="text-xl font-bold">Salone Freelance</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Connecting Sierra Leone's best talent with global opportunities. Build your dream team or find your next big project.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Globe size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><MessageCircle size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Share2 size={20} /></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">For Clients</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><button onClick={() => openModal('How to Hire', footerContent.howToHire)} className="hover:text-white transition-colors">How to Hire</button></li>
                <li><button onClick={() => openModal('Talent Marketplace', footerContent.talentMarketplace)} className="hover:text-white transition-colors">Talent Marketplace</button></li>
                <li><button onClick={() => openModal('Project Planning', footerContent.projectPlanning)} className="hover:text-white transition-colors">Project Planning</button></li>
                <li><button onClick={() => openModal('Post a Job', footerContent.postAJob)} className="hover:text-white transition-colors">Post a Job</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">For Talent</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><button onClick={() => openModal('How to Find Work', footerContent.howToFindWork)} className="hover:text-white transition-colors">How to Find Work</button></li>
                <li><button onClick={() => openModal('Direct Contracts', footerContent.directContracts)} className="hover:text-white transition-colors">Direct Contracts</button></li>
                <li><button onClick={() => openModal('Success Stories', footerContent.successStories)} className="hover:text-white transition-colors">Success Stories</button></li>
                <li><button onClick={() => openModal('Join as Freelancer', footerContent.joinAsFreelancer)} className="hover:text-white transition-colors">Join as Freelancer</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Mobile App</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="https://drive.google.com/uc?export=download&id=1knoOPoRcjfuCvftCH_sw-TlGlfq6jJcs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Download App</a></li>
                <li><button onClick={() => openModal('How to Install the App', footerContent.mobileApp)} className="hover:text-white transition-colors">Install Instructions</button></li>
                <li><button onClick={() => openModal('Help Center', footerContent.helpCenter)} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => openModal('Trust & Safety', footerContent.trustAndSafety)} className="hover:text-white transition-colors">Trust & Safety</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 Salone Freelance. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button onClick={() => openModal('Privacy Policy', footerContent.privacyPolicy)} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => openModal('Terms of Service', footerContent.termsOfService)} className="hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => openModal('Cookie Policy', footerContent.cookiePolicy)} className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
