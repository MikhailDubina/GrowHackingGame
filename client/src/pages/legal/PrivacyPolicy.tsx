import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Welcome to GrowHackingGame ("we", "our", "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our gaming platform (the "Service").
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">1. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Service includes:
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">1.1 Personal Data</h3>
          <p>
            Personally identifiable information, such as your username, email address, date of birth, and demographic information, that you voluntarily provide when you register with the Service. We may also collect information when you participate in promotions, contests, or surveys.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">1.2 Financial Data</h3>
          <p>
            Data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase coins or services. We store only very limited financial information. All payment processing is handled by our payment processor, Stripe, and you are encouraged to review their privacy policy at https://stripe.com/privacy.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">1.3 Gameplay Data</h3>
          <p>
            We collect data related to your game activity, including your game progress, scores, achievements, wagered amounts, wins and losses, daily challenge completion, division status, and in-game transactions.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">1.4 Device and Usage Information</h3>
          <p>
            We automatically collect certain information about your device and how you interact with our Service, including your IP address, browser type, operating system, access times, pages viewed, and the page you visited before navigating to our Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Create and manage your account</li>
            <li>Process your transactions and deliver the services you have requested</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Service</li>
            <li>Send you promotional communications, such as information about new games, features, or special offers</li>
            <li>Notify you of updates to the Service</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Generate aggregate data about Service usage</li>
            <li>Comply with legal obligations and enforce our Terms of Service</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.1 By Law or to Protect Rights</h3>
          <p>
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.2 Third-Party Service Providers</h3>
          <p>
            We may share your information with third parties that perform services for us or on our behalf, including payment processing (Stripe), data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.3 Business Transfers</h3>
          <p>
            We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Data Retention</h2>
          <p>
            We will retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>The right to access and receive a copy of your personal information</li>
            <li>The right to correct inaccurate or incomplete information</li>
            <li>The right to delete your personal information</li>
            <li>The right to restrict or object to our processing of your information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent where processing is based on consent</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, please contact us at privacy@growhackinggame.com.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies, web beacons, and other tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features of the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Children's Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className="font-semibold mt-3">
            Email: privacy@growhackinggame.com<br />
            Support: support@growhackinggame.com
          </p>
        </div>
      </div>
    </div>
  );
}
