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
  { id: "create", label: "Create a workflow" },
  { id: "wizard", label: "The 6-step builder" },
  { id: "publish", label: "Publish & activate" },
  { id: "monitor", label: "Monitor runs" },
  { id: "edit", label: "Edit a live workflow" },
  { id: "pause-delete", label: "Pause or delete" },
  { id: "templates", label: "Start from a template" },
  { id: "yaml", label: "The YAML view" },
  { id: "guardrails", label: "Guardrails to know" },
];

export default function ManageWorkflowsGuide() {
  return (
    <GuideLayout
      title="How to manage workflows"
      subtitle="Create, edit, publish, pause, and monitor AI workflows from start to finish."
      readTime="6 min read"
      toc={TOC}
    >
      <Section id="overview" title="Overview">
        <p>
          A <strong>workflow</strong> is a typed, server-side automation that listens for a trigger
          (a webhook from Encompass, a milestone, a scheduled cron, etc.), runs a series of steps,
          and writes results back to the systems you connect. Each step in a workflow is one
          adapter call (read from Encompass, ask Claude, send Slack, wait for human approval, etc.).
        </p>
        <p>
          The user panel gives you four entry points for managing workflows:
        </p>
        <ul className="list-disc list-inside text-ink-700 space-y-1 ml-2">
          <li>
            <Link href="/" className="text-brand-700 hover:underline">Workflows</Link>{" "}
            — the dashboard listing every workflow in your tenant
          </li>
          <li>
            <Link href="/new" className="text-brand-700 hover:underline">New workflow</Link>{" "}
            — the 6-step wizard
          </li>
          <li>
            <Link href="/templates" className="text-brand-700 hover:underline">Templates</Link>{" "}
            — proven mortgage workflows you can clone
          </li>
          <li>
            <Link href="/runs" className="text-brand-700 hover:underline">Runs</Link>{" "}
            — every execution across every workflow, with replay
          </li>
        </ul>
      </Section>

      <Section id="create" title="Create a workflow">
        <Steps>
          <Step title="Open the dashboard.">
            From any page, click <strong>Workflows</strong> in the sidebar.
          </Step>
          <Step title="Click “New workflow”.">
            The button is in the top-right of the dashboard. It opens the 6-step builder.
          </Step>
          <Step title="Pick a starting point.">
            On the <strong>Goal</strong> step you can either describe what you want in plain English
            (the AI assistant scaffolds the rest) or jump straight to a template.
          </Step>
        </Steps>
      </Section>

      <Section id="wizard" title="The 6-step builder">
        <p>The builder is a stepper you can move through in order or jump between freely.</p>
        <Steps>
          <Step title="Goal — say what the workflow should do.">
            A short natural-language description. Used to draft an initial flow.
          </Step>
          <Step title="Trigger — pick what kicks it off.">
            Choose from <code>encompass.webhook</code>, <code>encompass.field_change</code>,{" "}
            <code>encompass.milestone</code>, <code>encompass.document</code>,{" "}
            <code>schedule</code> (cron + timezone), or <code>manual</code> (operator-fired).
          </Step>
          <Step title="Flow — drop in steps.">
            Use the canvas to add steps from the catalog (ICE reads/writes, AI extract/review,
            human approval, notify, branch/wait, data transforms). Click a step to open the
            inspector and fill its inputs. Inputs accept Mustache-style placeholders like{" "}
            <code>{"{{ trigger.loanId }}"}</code> or <code>{"{{ steps.ai_triage.output }}"}</code>.
          </Step>
          <Step title="Connect — choose which integrations to use.">
            The wizard surfaces only the connections your selected steps require. Anything not
            yet connected shows a deep link to the{" "}
            <Link href="/connections" className="text-brand-700 hover:underline">Connections</Link>{" "}
            page so you don’t lose context.
          </Step>
          <Step title="Review — sanity-check the plan.">
            A read-only summary of the trigger, every step, every input value, and which connections
            will be used. The portal preflight runs the no-deletion guardrail here — any deletion
            step would fail before you could even publish.
          </Step>
          <Step title="Publish — go live or save as draft.">
            Publishing marks the workflow <strong>live</strong> and the runtime starts listening for
            its trigger. Saving as draft keeps it editable without firing.
          </Step>
        </Steps>
        <Callout variant="info" title="You can leave at any time">
          The builder autosaves between steps. Closing the tab keeps your draft so you can come back
          later from the dashboard.
        </Callout>
      </Section>

      <Section id="publish" title="Publish & activate">
        <p>
          Workflows have four states: <code>draft</code>, <code>live</code>, <code>paused</code>,
          and <code>error</code>. The chip next to the workflow name on the dashboard always shows
          the current state.
        </p>
        <Steps>
          <Step title="Open the workflow detail.">
            Click any card on the dashboard, or open it from the Templates page.
          </Step>
          <Step title="Hit “Activate” in the top-right.">
            This is the same button as <strong>Pause</strong> — it toggles between the two states.
            Activating a draft promotes it to <code>live</code>.
          </Step>
          <Step title="Wait for the first run.">
            For webhook and field-change triggers, the runtime registers the listener within a few
            seconds. Cron triggers fire on their next scheduled tick.
          </Step>
        </Steps>
      </Section>

      <Section id="monitor" title="Monitor runs">
        <p>Every execution lands on the <Link href="/runs" className="text-brand-700 hover:underline">Runs</Link> page. Filters at the top let you focus on a status (succeeded, failed, running, awaiting human).</p>
        <Steps>
          <Step title="Click a run to drill in.">
            The detail page shows a step-by-step timeline with per-step duration, the inputs the
            step received, and the failure reason if it failed.
          </Step>
          <Step title="Approve or reject anything that is awaiting human.">
            The portal surfaces an inline approve/reject card on every paused run.
          </Step>
          <Step title="Replay failed runs after a fix.">
            The Replay button retries from the failed step using the latest workflow version. It
            does <em>not</em> re-fire the trigger.
          </Step>
        </Steps>
        <Callout variant="success" title="Production trace is live">
          The Encompass adapter answers requests in production right now — including a real OAuth
          probe and the no-deletion guardrail at the HTTP layer. The full trace lives in{" "}
          <code>DEPLOY_STATUS.md</code> at the repo root.
        </Callout>
      </Section>

      <Section id="edit" title="Edit a live workflow">
        <p>
          Edits to a live workflow create a new version. The previous version keeps serving any
          in-flight runs to completion; new triggers fire against the new version.
        </p>
        <Steps>
          <Step title="Open the workflow detail page.">
            Find it on the dashboard and click the card.
          </Step>
          <Step title="Switch to the “Visual flow” tab.">
            Click a step to edit its inputs in the inspector, or drag a new step in from the
            palette.
          </Step>
          <Step title="Save by re-publishing.">
            The portal will diff your change against the previous version and confirm before
            cutting over.
          </Step>
        </Steps>
        <Callout variant="warning" title="In-flight runs are not migrated">
          A run started under v3 finishes under v3 even if you publish v4 mid-run. Use the Runs
          page to filter by version when comparing behavior.
        </Callout>
      </Section>

      <Section id="pause-delete" title="Pause or delete a workflow">
        <Steps>
          <Step title="Pause — stop new triggers.">
            From the detail page, click <strong>Pause</strong>. The runtime stops accepting new
            trigger fires immediately. In-flight runs keep going.
          </Step>
          <Step title="Delete — remove the workflow entirely.">
            The trash icon next to Pause. The portal will ask for confirmation. Deletion removes
            the workflow definition and stops listening, but historical runs and their step
            outputs remain queryable from the Runs page.
          </Step>
        </Steps>
      </Section>

      <Section id="templates" title="Start from a template">
        <p>
          The <Link href="/templates" className="text-brand-700 hover:underline">Templates</Link>{" "}
          page lists proven mortgage workflows: TPO submission triage, condition extraction, the
          service-order SLA babysitter, and more. Clicking a template opens the wizard pre-filled
          with that template’s trigger and steps.
        </p>
      </Section>

      <Section id="yaml" title="The YAML view">
        <p>
          Every workflow has a canonical YAML definition. The <strong>YAML</strong> tab on the
          workflow detail page shows it live. The shape mirrors{" "}
          <code>workflows/schema/workflow.schema.json</code> in the repo.
        </p>
        <CodeBlock>{`name: TPO submission triage
status: live
env: production
trigger:
  source: encompass.field_change
  field: Loan.SubmittedToLender
  op: equals
  value: true
steps:
  - id: pull_loan
    use: edc.loan.get
    with:
      loanId: {{ trigger.loanId }}
      fields: loanAmount, channel, milestones, documents
  - id: ai_triage
    use: ai.review
    with:
      model: claude-opus-4-7
      input: {{ steps.pull_loan.output }}`}</CodeBlock>
        <p>
          YAML is read-only in the portal — editing happens in the Visual flow tab. For
          version-controlled, repo-managed workflows, copy the YAML out and commit it under{" "}
          <code>workflows/</code>.
        </p>
      </Section>

      <Section id="guardrails" title="Guardrails to know">
        <ul className="list-disc list-inside text-ink-700 space-y-1.5 ml-2">
          <li>
            <strong>No-deletion policy.</strong> Deletes against any ICE host are blocked at four
            layers (catalog filter, portal preflight, runtime HTTP adapter, AI tool whitelist). You
            cannot publish a workflow that contains a delete step.
          </li>
          <li>
            <strong>Sandbox by default.</strong> New workflows default to the sandbox environment.
            Switching to production triggers an explicit confirmation step.
          </li>
          <li>
            <strong>Human approval is encouraged on writes.</strong> The wizard surfaces a hint
            whenever a workflow writes to Encompass without a preceding human approval step.
          </li>
          <li>
            <strong>Audit log is always on.</strong> Every publish, pause, delete, and policy block
            is recorded in the platform audit log — see{" "}
            <Link href="/platform/audit" className="text-brand-700 hover:underline">Platform → Audit log</Link>.
          </li>
        </ul>
      </Section>
    </GuideLayout>
  );
}
