import { ArrowLeft, Ban, Clock, Shield, AlertTriangle, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function SelfExclusionPolicy() {
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
          <Ban className="w-10 h-10 text-orange-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Self-Exclusion Policy
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 mb-8">
            <p className="font-semibold text-orange-300">
              Self-exclusion is a voluntary measure that allows you to restrict your access to GrowHackingGame for a specified period. This tool is designed to help individuals who feel they need a break from gaming or who are concerned about developing problem gaming behaviors.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-400" />
            1. What is Self-Exclusion?
          </h2>
          <p>
            Self-exclusion is a commitment you make to yourself to stop gaming for a minimum period of time. When you self-exclude from GrowHackingGame:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Your account will be immediately closed and you will be logged out</li>
            <li>You will not be able to log in or access any games during the exclusion period</li>
            <li>You will not receive any marketing communications or promotional offers</li>
            <li>Any pending withdrawals will be processed (subject to verification)</li>
            <li>You will not be able to open new accounts during the exclusion period</li>
            <li>We will take reasonable steps to prevent you from circumventing the exclusion</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-400" />
            2. Self-Exclusion Periods
          </h2>
          <p>
            You can choose to self-exclude for the following periods:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">6 months</strong> (minimum period)</li>
            <li><strong className="text-foreground">1 year</strong></li>
            <li><strong className="text-foreground">2 years</strong></li>
            <li><strong className="text-foreground">5 years</strong></li>
            <li><strong className="text-foreground">Permanent</strong> (indefinite exclusion)</li>
          </ul>
          <p className="mt-3">
            The minimum self-exclusion period is 6 months. Once set, the exclusion period cannot be shortened or reversed until it expires.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. How to Self-Exclude</h2>
          <p>
            To request self-exclusion, you can:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Option 1: Through Your Account</h3>
          <ol className="list-decimal pl-6 space-y-2 mt-3">
            <li>Log in to your account</li>
            <li>Navigate to Account Settings → Responsible Gaming</li>
            <li>Select "Self-Exclusion"</li>
            <li>Choose your exclusion period</li>
            <li>Confirm your decision (this action is irreversible)</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">Option 2: Contact Support</h3>
          <p>
            Email us at: <span className="font-semibold text-orange-400">selfexclusion@growhackinggame.com</span>
          </p>
          <p className="mt-2">
            Include in your email:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Your full name</li>
            <li>Your username</li>
            <li>Your registered email address</li>
            <li>Desired exclusion period</li>
            <li>Confirmation that you understand the terms of self-exclusion</li>
          </ul>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 my-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-300 mb-2">Important: This Decision is Final</p>
                <p className="text-foreground/90">
                  Once you confirm self-exclusion, the decision cannot be reversed until the exclusion period expires. Please consider this carefully before proceeding.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. What Happens to Your Account?</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">4.1 Account Balance</h3>
          <p>
            If you have funds in your account at the time of self-exclusion:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>You can request a withdrawal of your remaining balance before self-excluding</li>
            <li>If you self-exclude immediately, your balance will be held securely</li>
            <li>You can request withdrawal of your balance by contacting support</li>
            <li>Withdrawals are subject to standard verification procedures</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">4.2 Bonuses and Promotions</h3>
          <p>
            Upon self-exclusion:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>All active bonuses will be forfeited</li>
            <li>Promotional offers will be cancelled</li>
            <li>You will not receive marketing communications during the exclusion period</li>
            <li>Loyalty points and division status will be frozen</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">4.3 Personal Data</h3>
          <p>
            Your personal data will be retained in accordance with our Privacy Policy and legal obligations. This ensures we can:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Prevent you from opening new accounts during the exclusion period</li>
            <li>Maintain records for regulatory compliance</li>
            <li>Process any outstanding financial transactions</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. During the Exclusion Period</h2>
          <p>
            While your self-exclusion is active:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>You will not be able to log in to your account</li>
            <li>You cannot open new accounts (attempts will be blocked)</li>
            <li>You will not receive any marketing materials or promotional offers</li>
            <li>You cannot participate in any games or tournaments</li>
            <li>The exclusion period cannot be shortened or cancelled</li>
            <li>You are encouraged to seek support from problem gambling organizations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Reopening Your Account</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">6.1 After the Exclusion Period Expires</h3>
          <p>
            When your self-exclusion period ends:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Your account will NOT automatically reopen</li>
            <li>You must contact us to request account reactivation</li>
            <li>We will implement a 24-hour cooling-off period before reactivation</li>
            <li>You may be required to confirm your identity and complete a brief questionnaire</li>
            <li>We may offer information about responsible gaming tools and support resources</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">6.2 Permanent Self-Exclusion</h3>
          <p>
            If you chose permanent self-exclusion:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Your account will remain closed indefinitely</li>
            <li>You can request to reopen your account after a minimum of 5 years</li>
            <li>Reopening requires a formal review process and approval</li>
            <li>We reserve the right to refuse reactivation if we believe it's in your best interest</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Attempts to Circumvent Self-Exclusion</h2>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 my-4">
            <p className="font-semibold text-yellow-300 mb-3">
              We take self-exclusion seriously and employ various measures to prevent circumvention:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Monitoring for duplicate accounts using name, address, email, and payment details</li>
              <li>Blocking attempts to register with similar information</li>
              <li>Screening new registrations against self-excluded users database</li>
            </ul>
            <p className="mt-3 text-foreground/90">
              If you attempt to open a new account during your exclusion period, the account will be immediately closed and any funds may be forfeited.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Multi-Operator Self-Exclusion</h2>
          <p>
            Self-exclusion from GrowHackingGame only applies to our platform. If you wish to self-exclude from multiple gaming operators, we recommend:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Contacting each operator individually to request self-exclusion</li>
            <li>Using national self-exclusion schemes where available (e.g., GAMSTOP in the UK)</li>
            <li>Installing gambling blocking software on your devices</li>
            <li>Seeking support from problem gambling organizations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Alternative Options</h2>
          <p>
            If you're not ready for self-exclusion, consider these alternatives:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Take a Break:</strong> Temporarily suspend your account for 24 hours, 7 days, or 30 days</li>
            <li><strong className="text-foreground">Set Deposit Limits:</strong> Control how much you can deposit</li>
            <li><strong className="text-foreground">Set Loss Limits:</strong> Limit your net losses over a period</li>
            <li><strong className="text-foreground">Set Session Time Limits:</strong> Control how long you play</li>
            <li><strong className="text-foreground">Enable Reality Checks:</strong> Receive periodic reminders while playing</li>
          </ul>
          <p className="mt-3">
            See our <button onClick={() => setLocation("/legal/responsible-gaming")} className="text-orange-400 hover:text-orange-300 underline">Responsible Gaming Policy</button> for more information on these tools.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Support and Resources</h2>
          <p>
            If you're considering self-exclusion due to problem gambling, we encourage you to seek professional help:
          </p>

          <div className="grid gap-4 mt-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">National Council on Problem Gambling (USA)</h3>
              <p className="font-mono text-orange-400">1-800-522-4700</p>
              <p className="text-sm mt-2">Website: <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">www.ncpgambling.org</a></p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Gamblers Anonymous</h3>
              <p className="text-sm mt-2">Website: <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">www.gamblersanonymous.org</a></p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">GamCare (UK)</h3>
              <p className="font-mono text-orange-400">0808 8020 133</p>
              <p className="text-sm mt-2">Website: <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">www.gamcare.org.uk</a></p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">11. Our Commitment</h2>
          <p>
            We are committed to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Honoring all self-exclusion requests promptly and effectively</li>
            <li>Implementing robust systems to prevent circumvention</li>
            <li>Providing support and resources to self-excluded users</li>
            <li>Maintaining confidentiality of self-exclusion requests</li>
            <li>Continuously improving our responsible gaming measures</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-orange-400" />
            12. Contact Us
          </h2>
          <p>
            For self-exclusion requests or questions about this policy, please contact us at:
          </p>
          <p className="font-semibold mt-3">
            Email: selfexclusion@growhackinggame.com<br />
            Responsible Gaming: responsiblegaming@growhackinggame.com<br />
            Support: support@growhackinggame.com
          </p>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 mt-8">
            <p className="font-semibold text-orange-300 text-center">
              Taking a break is a sign of strength. We're here to support you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
