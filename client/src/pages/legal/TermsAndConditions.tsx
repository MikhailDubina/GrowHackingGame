import { ArrowLeft, FileText, Scale, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsAndConditions() {
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

        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-10 h-10 text-green-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Terms and Conditions
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
            <p className="font-semibold text-green-300">
              By accessing or using GrowHackingGame ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-400" />
            1. Acceptance of Terms
          </h2>
          <p>
            These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and GrowHackingGame ("we", "us", or "our"). By creating an account, accessing, or using our gaming platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy, AML Policy, KYC Policy, and Responsible Gaming Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. Eligibility</h2>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 my-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-300 mb-2">Age and Jurisdiction Requirements</p>
                <p className="text-foreground/90">
                  You must be at least 18 years of age (or the legal age of majority in your jurisdiction, whichever is greater) to use our Service. By using the Service, you represent and warrant that you meet this age requirement. You also confirm that online gaming is legal in your jurisdiction and that you are not located in a restricted territory.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Account Registration</h2>
          <p>
            To access certain features of the Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security and confidentiality of your account credentials</li>
            <li>Notify us immediately of any unauthorized access or security breach</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Create only one account per person (multiple accounts are prohibited)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. User Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Engage in fraudulent, abusive, or deceptive practices</li>
            <li>Create multiple accounts or use accounts belonging to others</li>
            <li>Use bots, scripts, or automated tools to play games or manipulate outcomes</li>
            <li>Exploit bugs, glitches, or vulnerabilities in the platform</li>
            <li>Collude with other users to gain unfair advantages</li>
            <li>Harass, threaten, or abuse other users or our staff</li>
            <li>Attempt to reverse engineer, decompile, or hack the Service</li>
            <li>Use VPNs or proxy servers to circumvent geographic restrictions</li>
            <li>Engage in money laundering or other financial crimes</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Game Rules and Fairness</h2>
          <p>
            All games on our platform are governed by specific rules and use certified Random Number Generators (RNG) to ensure fairness. We are committed to providing a fair gaming environment:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Match Three Slot Game:</strong> RTP (Return to Player) of approximately 95.66%</li>
            <li><strong className="text-foreground">Treasure Hunt:</strong> RTP of approximately 94.9%</li>
            <li>Game outcomes are determined by RNG and cannot be predicted or manipulated</li>
            <li>We reserve the right to void games or winnings if irregularities are detected</li>
            <li>Detailed game rules are available within each game interface</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Deposits and Purchases</h2>
          <p>
            Users can purchase virtual coins using real money through our payment processor, Stripe:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>All transactions are processed securely through Stripe</li>
            <li>We accept major credit cards, debit cards, and other payment methods</li>
            <li>Deposit limits may apply based on your verification status</li>
            <li>You are responsible for any fees charged by your payment provider</li>
            <li>Virtual coins have no cash value and cannot be exchanged for real money</li>
            <li>All sales are final; refunds are provided only at our discretion</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Withdrawals</h2>
          <p>
            Withdrawal of winnings is subject to the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>You must complete KYC verification before withdrawing funds</li>
            <li>Withdrawals are processed to the same payment method used for deposits</li>
            <li>Minimum withdrawal amount: $20 (or equivalent)</li>
            <li>Processing time: 3-5 business days for standard withdrawals</li>
            <li>We reserve the right to request additional documentation before processing withdrawals</li>
            <li>Withdrawal requests may be declined if fraud or abuse is suspected</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Bonuses and Promotions</h2>
          <p>
            We may offer bonuses, promotional codes, and special offers from time to time:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>All bonuses are subject to specific terms and conditions</li>
            <li>Wagering requirements may apply before bonus funds can be withdrawn</li>
            <li>We reserve the right to modify or cancel promotions at any time</li>
            <li>Abuse of bonuses or promotional offers may result in account termination</li>
            <li>Only one bonus per user, household, or IP address unless otherwise stated</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Intellectual Property</h2>
          <p>
            All content on the Service, including but not limited to text, graphics, logos, icons, images, audio clips, software, and game designs, is the property of GrowHackingGame or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Copy, reproduce, distribute, or create derivative works from our content</li>
            <li>Use our trademarks, logos, or branding without written permission</li>
            <li>Frame or mirror any part of the Service without authorization</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>The Service is provided "as is" without warranties of any kind</li>
            <li>We are not liable for any indirect, incidental, or consequential damages</li>
            <li>Our total liability shall not exceed the amount you paid to us in the past 12 months</li>
            <li>We are not responsible for losses due to technical failures, internet outages, or third-party actions</li>
            <li>You assume all risks associated with using the Service</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless GrowHackingGame, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Any fraudulent or illegal activity associated with your account</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">12. Account Suspension and Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Violation of these Terms or any of our policies</li>
            <li>Fraudulent or suspicious activity</li>
            <li>Failure to complete KYC verification</li>
            <li>Abuse of bonuses or promotional offers</li>
            <li>Chargebacks or payment disputes</li>
            <li>Inactivity for an extended period</li>
          </ul>
          <p className="mt-3">
            Upon termination, you forfeit any remaining balance, bonuses, or winnings unless otherwise required by law.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">13. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or your use of the Service shall be resolved through:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Informal Resolution:</strong> Contact our support team at support@growhackinggame.com</li>
            <li><strong className="text-foreground">Mediation:</strong> If informal resolution fails, disputes may be submitted to mediation</li>
            <li><strong className="text-foreground">Arbitration:</strong> Binding arbitration in accordance with [Arbitration Rules]</li>
            <li><strong className="text-foreground">Class Action Waiver:</strong> You agree to resolve disputes individually, not as part of a class action</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">14. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms shall be brought exclusively in the courts of [Jurisdiction].
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">15. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through a prominent notice on the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">16. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">17. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy and other referenced policies, constitute the entire agreement between you and GrowHackingGame regarding the use of the Service and supersede all prior agreements and understandings.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">18. Contact Information</h2>
          <p>
            For questions or concerns regarding these Terms and Conditions, please contact us at:
          </p>
          <p className="font-semibold mt-3">
            Email: legal@growhackinggame.com<br />
            Support: support@growhackinggame.com<br />
            Address: [Company Address]
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mt-8">
            <p className="text-sm text-blue-300">
              By clicking "I Agree" or by accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
