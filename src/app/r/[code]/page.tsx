import { findReferrerByCode } from "@/lib/referrals"
import { ReferralLandingForm } from "@/components/referral/referral-landing-form"

export default async function ReferralLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const referrer = await findReferrerByCode(code)

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-12">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(45,212,191,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md glass-card rounded-[16px] p-8 relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            Al<span className="text-clarity-400">o</span>hive
          </h1>
          {referrer ? (
            <p className="text-sm text-text-secondary mt-2">
              <span className="text-text-primary">{referrer.name}</span> invited you to{" "}
              <span className="text-text-primary">{referrer.business.name}</span> — share your details and you&apos;ll
              both earn loyalty points on your first visit!
            </p>
          ) : (
            <p className="text-sm text-text-secondary mt-2">This referral link is invalid or has expired.</p>
          )}
        </div>

        {referrer && <ReferralLandingForm code={code} />}
      </div>
    </div>
  )
}
