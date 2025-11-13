import { ArrowLeft, Heart, Shield, Clock, AlertCircle, Phone, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function ResponsibleGaming() {
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
          <Heart className="w-10 h-10 text-rose-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
            Responsible Gaming
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-6 mb-8">
            <p className="font-semibold text-rose-300">
              At GrowHackingGame, we are committed to promoting responsible gaming and providing a safe, enjoyable entertainment experience. We believe that gaming should be fun, and we provide tools and resources to help you maintain control over your gaming activities.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-400" />
            1. Our Commitment
          </h2>
          <p>
            We are dedicated to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Preventing underage gaming through robust age verification</li>
            <li>Providing tools to help players manage their gaming behavior</li>
            <li>Educating players about responsible gaming practices</li>
            <li>Identifying and assisting players who may be at risk</li>
            <li>Partnering with problem gambling support organizations</li>
            <li>Training our staff to recognize and respond to problem gaming indicators</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            2. Warning Signs of Problem Gaming
          </h2>
          <p>
            Gaming becomes a problem when it interferes with your daily life. Warning signs include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Spending more time or money on gaming than you can afford</li>
            <li>Chasing losses by continuing to play to win back money</li>
            <li>Neglecting work, family, or social responsibilities</li>
            <li>Borrowing money or selling possessions to fund gaming</li>
            <li>Feeling anxious, irritable, or restless when not gaming</li>
            <li>Lying to friends or family about your gaming activities</li>
            <li>Gaming to escape problems or negative emotions</li>
            <li>Experiencing financial difficulties due to gaming</li>
            <li>Feeling guilty or ashamed about your gaming behavior</li>
            <li>Unsuccessful attempts to cut down or stop gaming</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-400" />
            3. Self-Help Tools
          </h2>
          <p>
            We provide several tools to help you maintain control over your gaming:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.1 Deposit Limits</h3>
          <p>
            Set daily, weekly, or monthly limits on how much you can deposit into your account. Once set, limits take effect immediately and can only be increased after a 24-hour cooling-off period.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Daily Limit:</strong> Maximum amount you can deposit in 24 hours</li>
            <li><strong className="text-foreground">Weekly Limit:</strong> Maximum amount you can deposit in 7 days</li>
            <li><strong className="text-foreground">Monthly Limit:</strong> Maximum amount you can deposit in 30 days</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.2 Loss Limits</h3>
          <p>
            Set limits on how much you can lose (net losses) over a specific period. This helps prevent chasing losses and ensures you don't spend more than you can afford.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.3 Session Time Limits</h3>
          <p>
            Set a maximum duration for your gaming sessions. You will receive notifications when you approach your limit, and your session will automatically end when the time expires.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.4 Reality Checks</h3>
          <p>
            Receive periodic pop-up reminders showing how long you've been playing and your current balance. This helps you stay aware of time and spending.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.5 Take a Break</h3>
          <p>
            Temporarily suspend your account for a period of 24 hours, 7 days, or 30 days. During this time, you will not be able to log in or play games.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.6 Self-Exclusion</h3>
          <p>
            Permanently or temporarily exclude yourself from our platform for a minimum of 6 months. See our <button onClick={() => setLocation("/legal/self-exclusion")} className="text-rose-400 hover:text-rose-300 underline">Self-Exclusion Policy</button> for more details.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. How to Set Limits</h2>
          <p>
            To set any of the above limits:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-3">
            <li>Log in to your account</li>
            <li>Navigate to Account Settings → Responsible Gaming</li>
            <li>Select the type of limit you want to set</li>
            <li>Enter the desired amount or duration</li>
            <li>Confirm your selection</li>
          </ol>
          <p className="mt-3">
            Limits take effect immediately. Requests to increase limits are subject to a 24-hour cooling-off period. Requests to decrease limits take effect immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Tips for Responsible Gaming</h2>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 my-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Set a budget:</strong> Only gamble with money you can afford to lose</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Set time limits:</strong> Decide in advance how long you will play</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Take regular breaks:</strong> Step away from gaming periodically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Don't chase losses:</strong> Accept losses as part of the entertainment cost</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Balance with other activities:</strong> Gaming should be one of many leisure activities</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Never gamble under influence:</strong> Avoid gaming when intoxicated or emotionally distressed</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 font-bold text-lg">✓</span>
                <span><strong className="text-foreground">Keep it fun:</strong> If gaming stops being enjoyable, take a break</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Underage Gaming Prevention</h2>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 my-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-300 mb-2">18+ Only - Strictly Enforced</p>
                <p className="text-foreground/90 mb-3">
                  Our platform is strictly for users aged 18 years or older. We employ robust age verification measures and will immediately suspend any account found to belong to a minor.
                </p>
                <p className="text-foreground/90">
                  Parents and guardians: Please ensure that minors do not have access to your account or payment methods. Consider using parental control software to restrict access to gaming sites.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-rose-400" />
            7. Support Organizations
          </h2>
          <p>
            If you or someone you know needs help with problem gambling, the following organizations provide free, confidential support:
          </p>

          <div className="grid gap-4 mt-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">National Council on Problem Gambling (USA)</h3>
              <p className="text-sm text-muted-foreground mb-2">24/7 Confidential Helpline</p>
              <p className="font-mono text-rose-400">1-800-522-4700</p>
              <p className="text-sm mt-2">Website: <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline">www.ncpgambling.org</a></p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Gamblers Anonymous</h3>
              <p className="text-sm text-muted-foreground mb-2">International peer support network</p>
              <p className="text-sm mt-2">Website: <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline">www.gamblersanonymous.org</a></p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">GamCare (UK)</h3>
              <p className="text-sm text-muted-foreground mb-2">Free information, advice and support</p>
              <p className="font-mono text-rose-400">0808 8020 133</p>
              <p className="text-sm mt-2">Website: <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline">www.gamcare.org.uk</a></p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">BeGambleAware (UK)</h3>
              <p className="text-sm text-muted-foreground mb-2">Independent charity providing support</p>
              <p className="text-sm mt-2">Website: <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300 underline">www.begambleaware.org</a></p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. How We Can Help</h2>
          <p>
            If you're concerned about your gaming behavior, our support team is here to help:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Contact us to discuss responsible gaming tools and limits</li>
            <li>Request information about self-exclusion options</li>
            <li>Get referrals to professional support organizations</li>
            <li>Receive guidance on setting appropriate limits</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Staff Training</h2>
          <p>
            All our staff members receive comprehensive training on:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Recognizing signs of problem gaming</li>
            <li>Responsible gaming policies and procedures</li>
            <li>How to assist players seeking help</li>
            <li>Referral to appropriate support organizations</li>
            <li>Handling sensitive situations with empathy and professionalism</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Marketing and Advertising</h2>
          <p>
            We are committed to responsible marketing practices:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>We do not target minors in our advertising</li>
            <li>We do not portray gaming as a way to solve financial problems</li>
            <li>We include responsible gaming messages in our communications</li>
            <li>We do not send marketing materials to self-excluded players</li>
            <li>Players can opt out of marketing communications at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-rose-400" />
            11. Contact Us
          </h2>
          <p>
            For questions about responsible gaming or to request assistance, please contact us at:
          </p>
          <p className="font-semibold mt-3">
            Email: responsiblegaming@growhackinggame.com<br />
            Support: support@growhackinggame.com<br />
            Phone: [Support Number]
          </p>

          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-6 mt-8">
            <p className="font-semibold text-rose-300 text-center">
              Remember: Gaming should be entertaining, not a way to make money. Play responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
