import { useState } from 'react';
import { ProgressSummary, type usePracticeWorkspace } from '@datapass/learning';
import { ContentDetails, PageHeader } from '@datapass/ui';
import { computeProgressBreakdown } from '@datapass/progress';
import { Button, Field, Textarea } from '@fluentui/react-components';
export default function ProgressPage({ workspace }: { workspace: ReturnType<typeof usePracticeWorkspace> }) {
  const [backup, setBackup] = useState(''); const [message, setMessage] = useState('');
  const breakdown = computeProgressBreakdown(workspace.state.progress);
  return <>
    <PageHeader eyebrow="LOCAL INTERVIEW RECORD" title="Progress by domain" description="Review your reasoning across sessions. This is rehearsal feedback, not a certification." />
    <ProgressSummary state={workspace.state.progress} />
    {breakdown.domains.length ? <ul className="interview-domain-results">{breakdown.domains.map(domain => <li key={domain.id}><strong>{domain.id}</strong> {domain.correct} / {domain.answers} correct · {domain.percent}%</li>)}</ul> : <p>No submitted sessions yet.</p>}
    <ContentDetails className="interview-backup" summary="Backup & restore">
      <h2>Session backup</h2>
      <div className="interview-session-tools">
        <Button onClick={() => { setBackup(workspace.exportJson()); setMessage('Backup prepared.'); }}>Export backup</Button>
        <Button onClick={() => { try { workspace.importJson(backup); setMessage('Backup imported.'); } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); } }}>Import backup</Button>
      </div>
      <Field label="Interview workspace JSON"><Textarea rows={8} value={backup} onChange={(_, data) => setBackup(data.value)} /></Field>
      {message && <p role="status">{message}</p>}
    </ContentDetails>
  </>;
}
