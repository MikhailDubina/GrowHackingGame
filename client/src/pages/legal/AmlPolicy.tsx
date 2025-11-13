import { ArrowLeft, Shield, AlertTriangle, FileText, Eye } from "lucide-react";
import { useLocation } from "wouter";

export default function AmlPolicy() {
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
          <Shield className="w-10 h-10 text-purple-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Anti-Money Laundering Policy
          </h1>
        </div>
        <p className="text-muted-foreground mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 mb-8">
            <p className="font-semibold text-purple-300">
              GrowHackingGame is committed to preventing money laundering and any activity that facilitates money laundering or the funding of terrorist or criminal activities. We comply with all applicable laws and regulations, including the Bank Secrecy Act (BSA), USA PATRIOT Act, and Financial Action Task Force (FATF) recommendations.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            1. Purpose and Scope
          </h2>
          <p>
            This Anti-Money Laundering (AML) Policy establishes the framework for preventing, detecting, and reporting suspicious activities that may involve money laundering or terrorist financing. This policy applies to all users, employees, contractors, and third-party service providers associated with GrowHackingGame.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            2. Customer Due Diligence (CDD)
          </h2>
          <p>
            We implement robust Customer Due Diligence procedures to verify the identity of our users:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>
              <strong className="text-foreground">Identity Verification:</strong> We collect and verify personal information including full name, date of birth, residential address, and government-issued identification documents (passport, driver's license, or national ID card).
            </li>
            <li>
              <strong className="text-foreground">Enhanced Due Diligence (EDD):</strong> For high-risk customers or transactions exceeding certain thresholds, we conduct enhanced verification procedures, including source of funds verification and additional documentation requirements.
            </li>
            <li>
              <strong className="text-foreground">Ongoing Monitoring:</strong> We continuously monitor customer accounts and transactions to identify unusual patterns or suspicious activities.
            </li>
            <li>
              <strong className="text-foreground">Politically Exposed Persons (PEPs):</strong> We conduct enhanced due diligence on individuals who hold or have held prominent public positions.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">3. Transaction Monitoring</h2>
          <p>
            We employ automated and manual systems to monitor transactions for suspicious activity, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Unusually large deposits or withdrawals relative to normal account activity</li>
            <li>Multiple transactions structured to avoid reporting thresholds (structuring/smurfing)</li>
            <li>Transactions with no apparent economic or lawful purpose</li>
            <li>Rapid movement of funds through accounts without gaming activity</li>
            <li>Transactions involving high-risk jurisdictions identified by FATF</li>
            <li>Frequent deposits followed immediately by withdrawal requests</li>
            <li>Use of multiple payment methods or accounts by a single user</li>
            <li>Transactions inconsistent with the customer's profile or stated occupation</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            4. Suspicious Activity Reporting
          </h2>
          <p>
            When suspicious activity is identified, we will:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Document the suspicious activity in detail, including dates, amounts, and patterns</li>
            <li>Report to the appropriate regulatory authorities (e.g., FinCEN in the United States) within required timeframes (typically 30 days)</li>
            <li>Maintain strict confidentiality of reports and not disclose to the subject of the report ("tipping off" prohibition)</li>
            <li>Preserve all relevant records and documentation for at least five years</li>
            <li>Continue monitoring the account for additional suspicious activity</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">5. Record Keeping</h2>
          <p>
            We maintain comprehensive records of all transactions and customer identification information for a minimum of five (5) years from the date of the transaction or account closure, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Customer identification documents and verification records</li>
            <li>Transaction records, account statements, and payment histories</li>
            <li>Correspondence and communications with customers</li>
            <li>Internal and external reports related to AML compliance</li>
            <li>Risk assessment documentation</li>
            <li>Training records for employees</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">6. Risk Assessment</h2>
          <p>
            We conduct regular risk assessments (at least annually) to identify and evaluate money laundering and terrorist financing risks associated with:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Customer types and profiles (high-value players, frequent depositors)</li>
            <li>Geographic locations (high-risk jurisdictions)</li>
            <li>Products and services offered (coin purchases, withdrawals)</li>
            <li>Delivery channels and transaction methods (credit cards, cryptocurrencies, e-wallets)</li>
            <li>New technologies and gaming features</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">7. Training and Awareness</h2>
          <p>
            All employees receive comprehensive AML training upon hiring and annually thereafter to ensure they understand their obligations and can identify suspicious activities. Training covers:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>AML laws and regulations (BSA, PATRIOT Act, FATF recommendations)</li>
            <li>Red flags and indicators of money laundering and terrorist financing</li>
            <li>Internal reporting procedures and escalation protocols</li>
            <li>Consequences of non-compliance (civil and criminal penalties)</li>
            <li>Case studies and real-world examples</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">8. Prohibited Activities</h2>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 my-4">
            <p className="font-semibold text-red-300 mb-3">The following activities are strictly prohibited on our platform:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Using the platform to launder proceeds from illegal activities</li>
              <li>Structuring transactions to avoid reporting requirements</li>
              <li>Using accounts to facilitate third-party money laundering</li>
              <li>Providing false or misleading information during the verification process</li>
              <li>Creating multiple accounts to circumvent transaction limits</li>
              <li>Engaging in collusive or fraudulent gaming activities</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">9. Sanctions Screening</h2>
          <p>
            We screen all customers against international sanctions lists before account creation and on an ongoing basis, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>OFAC (Office of Foreign Assets Control) Specially Designated Nationals (SDN) list</li>
            <li>UN Security Council Consolidated Sanctions List</li>
            <li>EU Consolidated Financial Sanctions List</li>
            <li>HM Treasury Financial Sanctions List (UK)</li>
            <li>Other relevant national and international sanctions lists</li>
          </ul>
          <p className="mt-3">
            Accounts matching sanctions lists will be immediately blocked and reported to authorities.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">10. Independent Testing and Audit</h2>
          <p>
            We conduct independent testing of our AML program at least annually to assess its effectiveness and identify areas for improvement. Testing is performed by qualified internal or external auditors.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">11. Compliance Officer</h2>
          <p>
            We have designated a qualified Compliance Officer responsible for overseeing the implementation and effectiveness of this AML Policy. The Compliance Officer's responsibilities include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Monitoring compliance with AML laws and regulations</li>
            <li>Reviewing and investigating suspicious activity reports</li>
            <li>Coordinating AML training programs</li>
            <li>Serving as the primary point of contact with regulatory authorities</li>
            <li>Updating the AML program as needed</li>
          </ul>
          <p className="mt-3 font-semibold">
            The Compliance Officer can be contacted at: compliance@growhackinggame.com
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">12. Consequences of Violations</h2>
          <p>
            Violations of this AML Policy may result in:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Immediate account suspension or termination</li>
            <li>Forfeiture of funds associated with suspicious activity</li>
            <li>Reporting to law enforcement and regulatory authorities</li>
            <li>Civil and criminal penalties under applicable laws</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">13. Policy Review</h2>
          <p>
            This AML Policy is reviewed and updated at least annually, or more frequently as required by changes in laws, regulations, risk assessments, or business operations.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">14. Contact Information</h2>
          <p>
            For questions or concerns regarding this AML Policy, or to report suspicious activity, please contact us at:
          </p>
          <p className="font-semibold mt-3">
            Email: compliance@growhackinggame.com<br />
            AML Hotline: [Phone Number]<br />
            Address: [Company Address]
          </p>
        </div>
      </div>
    </div>
  );
}
