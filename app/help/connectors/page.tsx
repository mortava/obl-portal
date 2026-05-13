import Link from "next/link";
import {
  Callout,
  CodeBlock,
  GuideLayout,
  Section,
  Step,
  Steps,
} from "@/components/help/GuideLayout";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "encompass", label: "Encompass / TPO Connect" },
  { id: "anthropic", label: "Anthropic (Claude)" },
  { id: "slack", label: "Slack" },
  { id: "email", label: "Email (SMTP)" },
  { id: "test", label: "Test a live connection" },
  { id: "revoke", label: "Revoke a connection" },
  { id: "vars-ref", label: "Environment variables reference" },
];

export default function ConnectorsGuide() {
  return (
    <GuideLayout
      title="How to add connectors"
      subtitle="Wire Encompass, Anthropic, Slack, and Email so your workflows can act."
      readTime="5 min read"
      toc={TOC}
    >
      <Section id="overview" title="Overview">
        <p>
          A <strong>connector</strong> is the portal’s authenticated link to an external system.
          Workflows compose steps from the catalog; each step calls an underlying connector. The
          four built-in connectors are:
        </p>
        <ul className="list-disc list-inside text-ink-700 space-y-1 ml-2">
          <li>
            <strong>Encompass / TPO Connect</strong> — required, OAuth 2.0 to ICE
          </li>
          <li>
            <strong>Anthropic (Claude)</strong> — optional, API key, powers every <code>ai.*</code> step
          </li>
          <li>
            <strong>Slack</strong> — optional, OAuth, used by <code>notify.slack</code>
          </li>
          <li>
            <strong>Email (SMTP)</strong> — optional, API key, used by <code>notify.email</code>
          </li>
        </ul>
        <p>
          All four are listed on the{" "}
          <Link href="/connections" className="text-brand-700 hover:underline">Connections</Link>{" "}
          page. Each row shows the auth kind, whether the connector is currently linked, and
          whether server-side env vars have been detected.
        </p>
        <Callout variant="info">
          Credentials never live in the browser. The portal stores them encrypted at rest (KMS-backed
          vault in production, environment variables in the current build) and the Encompass
          adapter executes every request server-side.
        </Callout>
      </Section>

      <Section id="encompass" title="Encompass / TPO Connect">
        <p>
          Encompass is the only connector that is <strong>required</strong> — every workflow either
          reads or writes against it. The portal supports both grant types: client credentials
          (recommended) and password grant (when your tenant requires a designated API user).
        </p>
        <Steps>
          <Step title="Provision a least-privilege API user in Encompass admin.">
            Do <em>not</em> reuse a personal admin login. Create a dedicated API user scoped to
            only the read/write permissions your workflows need.
          </Step>
          <Step title="Mint an EDC application.">
            From the Encompass Developer Connect admin console, create an application and capture
            the <code>client_id</code> and <code>client_secret</code>. Note the grant type your
            tenant policy requires.
          </Step>
          <Step title="Add the env vars.">
            For local dev, copy <code>.env.example</code> to <code>.env.local</code> and fill the
            <code>ENCOMPASS_*</code> values. For production, set them in{" "}
            <strong>Vercel → Project → Settings → Environment Variables</strong> and mark each as
            a Secret.
          </Step>
          <Step title="Hit “Test connection”.">
            Open <Link href="/connections" className="text-brand-700 hover:underline">Connections</Link>,
            click the <strong>Test connection</strong> button on the Encompass row, and the portal
            will exchange your credentials for an OAuth token end-to-end against{" "}
            <code>api.elliemae.com</code>. A green check means the adapter reached ICE and got a
            real token back.
          </Step>
          <Step title="Click “Connect”.">
            Once the test passes, hit Connect. This marks the connector live in the portal so
            workflows can reference it.
          </Step>
        </Steps>
        <p className="text-xs text-ink-500">
          Full walkthrough including screenshots: <code>docs/ENCOMPASS_SETUP.md</code> at the repo root.
        </p>
      </Section>

      <Section id="anthropic" title="Anthropic (Claude)">
        <p>
          Every <code>ai.review</code>, <code>ai.extract</code>, <code>ai.classify</code>, and{" "}
          <code>ai.summarize</code> step calls Anthropic. The default model is{" "}
          <code>claude-opus-4-7</code>; you can override per step in the inspector or globally on
          the Settings page.
        </p>
        <Steps>
          <Step title="Create an API key at console.anthropic.com.">
            Use a key tied to your team workspace, not a personal account. Scope it to read +
            messages if your plan supports scopes.
          </Step>
          <Step title="Add the env var.">
            <CodeBlock>{`ANTHROPIC_API_KEY=sk-ant-...`}</CodeBlock>
            Local: <code>.env.local</code>. Production: Vercel env vars (marked Secret).
          </Step>
          <Step title="Click “Connect” on the Anthropic row.">
            The portal records the connection — there is no live test for Anthropic from the UI;
            instead, run a workflow that includes an <code>ai.*</code> step.
          </Step>
        </Steps>
        <Callout variant="info" title="Tenant-specific keys">
          The platform can fall back to a shared platform-wide Anthropic key when a tenant has not
          configured their own. Operators control that fallback on the{" "}
          <Link href="/platform/settings" className="text-brand-700 hover:underline">
            Platform → Settings
          </Link>{" "}
          page.
        </Callout>
      </Section>

      <Section id="slack" title="Slack">
        <p>
          Slack is used by <code>notify.slack</code> steps — typically to alert the ops channel or
          ping a specific reviewer. Auth is OAuth 2.0.
        </p>
        <Steps>
          <Step title="Click “Connect” on the Slack row.">
            The portal redirects you to Slack to authorize the workspace. After approval, Slack
            sends you back to <code>/connections</code> with a green chip.
          </Step>
          <Step title="Pick a default channel (optional).">
            From <Link href="/settings" className="text-brand-700 hover:underline">Settings</Link>{" "}
            you can set a default channel that workflows fall back to when a step does not specify
            one.
          </Step>
        </Steps>
      </Section>

      <Section id="email" title="Email (SMTP)">
        <p>
          Email is used by <code>notify.email</code> steps and by the human-approval system to send
          assignee notifications. Auth is an API key against an SMTP-compatible provider (Postmark,
          SendGrid, Resend, etc.).
        </p>
        <Steps>
          <Step title="Pick your provider and mint an API key.">
            Most workflows use Resend or Postmark for transactional mail. Use a dedicated key per
            environment (one for sandbox, one for production).
          </Step>
          <Step title="Add the env vars.">
            <CodeBlock>{`EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM=workflows@your-domain.com`}</CodeBlock>
          </Step>
          <Step title="Click “Connect”.">
            The portal will send a one-time verification email to <code>EMAIL_FROM</code> to confirm
            deliverability.
          </Step>
        </Steps>
      </Section>

      <Section id="test" title="Test a live connection">
        <p>
          Only Encompass has an in-UI test button right now — and it’s a serious test, not a
          stub. The portal forwards through the same server-side adapter every workflow uses,
          exchanges your real credentials for an OAuth token against{" "}
          <code>api.elliemae.com</code>, and shows you the response:
        </p>
        <ul className="list-disc list-inside text-ink-700 space-y-1 ml-2">
          <li><strong>HTTP 200</strong> + token expiry — connection works</li>
          <li><strong>HTTP 401</strong> with <code>invalid_client</code> — credentials are wrong</li>
          <li><strong>HTTP 405</strong> — never happens on a token request; if you see it on a write call, the no-deletion guardrail caught a DELETE</li>
        </ul>
        <Callout variant="success" title="Production endpoint is already proven">
          The same adapter logic is live at{" "}
          <code>https://vxoqwyntwsszipabhiuv.supabase.co/functions/v1/encompass-test</code> and has
          been verified end-to-end against ICE. See <code>DEPLOY_STATUS.md</code> for the trace.
        </Callout>
      </Section>

      <Section id="revoke" title="Revoke a connection">
        <Steps>
          <Step title="Open the Connections page.">
            <Link href="/connections" className="text-brand-700 hover:underline">/connections</Link>
          </Step>
          <Step title="Click “Disconnect” on any green row.">
            The portal clears the stored credentials immediately.
          </Step>
          <Step title="What happens to in-flight work.">
            Running workflows that depend on the revoked connector fail-clean on their next step.
            Any in-flight human approvals are released back to their assignees, not lost.
          </Step>
        </Steps>
      </Section>

      <Section id="vars-ref" title="Environment variables reference">
        <p>
          Use <code>.env.local</code> for local dev (gitignored) and Vercel env vars for production.
          Mark every secret as a Secret in Vercel.
        </p>
        <CodeBlock>{`# ── Supabase Auth (required for the portal itself) ──
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# ── Encompass / EDC (required for workflows) ──
ENCOMPASS_ENV=sandbox                       # "sandbox" or "production"
ENCOMPASS_GRANT_TYPE=client_credentials     # or "password"
ENCOMPASS_CLIENT_ID=
ENCOMPASS_CLIENT_SECRET=

# Required only for the password grant:
ENCOMPASS_INSTANCE_ID=
ENCOMPASS_API_USER=
ENCOMPASS_API_PASSWORD=

# Optional overrides:
ENCOMPASS_SCOPE=
ENCOMPASS_API_BASE_URL=
ENCOMPASS_OAUTH_BASE_URL=

# ── Anthropic ──
ANTHROPIC_API_KEY=

# ── Email (optional) ──
EMAIL_PROVIDER=
EMAIL_API_KEY=
EMAIL_FROM=`}</CodeBlock>
        <p>
          The Connections page reads <code>/api/connections/encompass/status</code> on load to tell
          you whether <code>ENCOMPASS_*</code> env vars are present server-side — handy for debugging
          a fresh Vercel deploy without copying secrets around.
        </p>
      </Section>
    </GuideLayout>
  );
}
