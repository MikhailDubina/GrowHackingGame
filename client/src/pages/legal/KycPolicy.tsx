import { ArrowLeft, UserCheck, FileCheck, Shield, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function KycPolicy() {
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
          <UserCheck className="w-10 h-10 text-blue-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Know Your Customer (KYC) Policy
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
            <p className="font-semibold text-blue-300">
              Our Know Your Customer (KYC) policy is designed to prevent our services from being used for money laundering, terrorist financing, fraud, or other illegal activities. We require users to provide certain information to verify their identity and ensure compliance with applicable laws and regulations.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-400" />
            1. Purpose and Objectives
          </h2>
          <p>
            The primary objectives of our KYC policy are to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Verify the identity of all users registering on our platform</li>
            <li>Prevent identity theft, fraud, and financial crimes</li>
            <li>Comply with anti-money laundering (AML) and counter-terrorist financing (CTF) regulations</li>
            <li>Protect our platform and users from illegal activities</li>
            <li>Maintain the integrity and reputation of our gaming platform</li>
            <li>Ensure responsible gaming by verifying age and identity</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">2. KYC Requirements</h2>
          <p>
            All users must complete KYC verification before they can:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Make deposits or purchases using real money</li>
            <li>Withdraw winnings or funds from their account</li>
            <li>Access certain premium features or high-stakes games</li>
            <li>Participate in tournaments or special promotions (where applicable)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Information Required for Verification</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.1 Basic Information</h3>
          <p>
            All users must provide the following basic information:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Full legal name (as it appears on official documents)</li>
            <li>Date of birth (must be 18 years or older)</li>
            <li>Residential address (including street, city, state/province, postal code, country)</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Nationality</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.2 Identity Documents</h3>
          <p>
            Users must provide at least one government-issued photo identification document, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Passport (preferred for international users)</li>
            <li>National ID card</li>
            <li>Driver's license</li>
            <li>Residence permit (for non-citizens)</li>
          </ul>
          <p className="mt-3">
            Documents must be valid (not expired), clearly legible, and show all four corners of the document.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.3 Proof of Address</h3>
          <p>
            Users must provide a recent document (issued within the last 3 months) confirming their residential address, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Utility bill (electricity, water, gas, internet)</li>
            <li>Bank statement</li>
            <li>Government-issued document with address</li>
            <li>Tax assessment or council tax bill</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">3.4 Payment Method Verification</h3>
          <p>
            For certain payment methods, users may need to provide:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Copy of credit/debit card (showing first 6 and last 4 digits, with middle digits obscured)</li>
            <li>Screenshot of e-wallet account showing name and account details</li>
            <li>Bank account verification (for bank transfers)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">4. Enhanced Due Diligence (EDD)</h2>
          <p>
            Enhanced Due Diligence may be required for users who:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Make deposits or withdrawals exceeding $2,000 (or equivalent) in a single transaction</li>
            <li>Accumulate transactions totaling $10,000 (or equivalent) within a 30-day period</li>
            <li>Are identified as Politically Exposed Persons (PEPs) or their close associates</li>
            <li>Are from high-risk jurisdictions identified by FATF</li>
            <li>Exhibit unusual or suspicious transaction patterns</li>
          </ul>
          <p className="mt-3">
            EDD may include additional documentation such as source of funds verification, source of wealth documentation, or enhanced background checks.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            5. Verification Process
          </h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">5.1 Document Submission</h3>
          <p>
            Users can submit documents through our secure online portal. Documents should be:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Clear, high-resolution images or scans</li>
            <li>In color (not black and white)</li>
            <li>Showing all four corners and edges</li>
            <li>Unaltered and not edited</li>
            <li>In PDF, JPG, or PNG format</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">5.2 Review Timeline</h3>
          <p>
            Our compliance team reviews submitted documents within:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Standard verification:</strong> 24-48 hours</li>
            <li><strong className="text-foreground">Enhanced due diligence:</strong> 3-5 business days</li>
            <li><strong className="text-foreground">Complex cases:</strong> Up to 10 business days</li>
          </ul>
          <p className="mt-3">
            Users will be notified via email once their verification is complete or if additional information is required.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">5.3 Verification Status</h3>
          <p>
            Users can check their verification status at any time through their account dashboard. Possible statuses include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong className="text-foreground">Pending:</strong> Documents submitted and under review</li>
            <li><strong className="text-foreground">Verified:</strong> Identity confirmed, full access granted</li>
            <li><strong className="text-foreground">Additional Information Required:</strong> More documents needed</li>
            <li><strong className="text-foreground">Rejected:</strong> Documents did not meet requirements</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Age Verification</h2>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 my-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-yellow-300 mb-2">18+ Only</p>
                <p className="text-foreground/90">
                  Our platform is strictly for users aged 18 years or older. We employ robust age verification measures to prevent underage gambling. Users found to be under 18 will have their accounts immediately suspended, and any funds will be returned to the payment source.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Data Security and Privacy</h2>
          <p>
            We take the security and privacy of your personal information seriously:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>All documents are transmitted using secure, encrypted connections (SSL/TLS)</li>
            <li>Documents are stored in encrypted format on secure servers</li>
            <li>Access to personal information is restricted to authorized compliance personnel only</li>
            <li>We comply with GDPR, CCPA, and other applicable data protection regulations</li>
            <li>Documents are retained for the minimum period required by law (typically 5 years)</li>
            <li>We never share your personal information with third parties except as required by law</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Ongoing Monitoring</h2>
          <p>
            KYC is not a one-time process. We conduct ongoing monitoring of user accounts, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Periodic re-verification of high-value or high-risk accounts</li>
            <li>Monitoring for changes in user behavior or transaction patterns</li>
            <li>Updating customer information when changes are detected</li>
            <li>Screening against updated sanctions and PEP lists</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Consequences of Non-Compliance</h2>
          <p>
            Failure to complete KYC verification may result in:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Inability to make deposits or withdrawals</li>
            <li>Restriction of account features and functionality</li>
            <li>Suspension or closure of account</li>
            <li>Forfeiture of winnings or bonuses</li>
          </ul>
          <p className="mt-3">
            Providing false or fraudulent documents will result in immediate account termination and may be reported to law enforcement authorities.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Right to Refuse Service</h2>
          <p>
            We reserve the right to refuse service to any user who:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Fails to provide required KYC documentation</li>
            <li>Provides false or misleading information</li>
            <li>Is located in a restricted jurisdiction</li>
            <li>Appears on sanctions lists or is identified as high-risk</li>
            <li>Is under 18 years of age</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">11. Updates to KYC Policy</h2>
          <p>
            We may update this KYC Policy from time to time to reflect changes in legal requirements, industry standards, or our business operations. Users will be notified of material changes via email or through our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">12. Contact Information</h2>
          <p>
            For questions or assistance with the KYC verification process, please contact us at:
          </p>
          <p className="font-semibold mt-3">
            Email: kyc@growhackinggame.com<br />
            Support: support@growhackinggame.com<br />
            Compliance Team: compliance@growhackinggame.com
          </p>
        </div>
      </div>
    </div>
  );
}
