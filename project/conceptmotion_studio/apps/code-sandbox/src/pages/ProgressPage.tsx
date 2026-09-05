import { useState } from 'react';
import { ProgressSummary, type usePracticeWorkspace } from '@datapass/learning';
import { ContentDetails, PageHeader } from '@datapass/ui';
import { Button, Field, Textarea } from '@fluentui/react-components';
import { practiceItems } from '../../../../content/practice';
export default function ProgressPage({ workspace }: { workspace: ReturnType<typeof usePracticeWorkspace> }) {
  const [backup, setBackup] = useState(''); const [message, setMessage] = useState('');
  return <>
    <PageHeader eyebrow="LOCAL PROGRESS" title="Keep your practice moving" description="Mastery is self-assessed. Drafts, flags, review choices, and notes remain in this browser." />
    <ProgressSummary state={workspace.state.progress} challengeIds={practiceItems.map(item => item.id)} />
    <ContentDetails className="sandbox-backup" summary="Backup & restore">
      <h2>JSON backup</h2><p>Import replaces this app's local workspace only after validation. Existing V2 progress is not changed.</p>
      <div className="sandbox-actions">
        <Button onClick={() => { setBackup(workspace.exportJson()); setMessage('Backup prepared. Copy or save this JSON before changing devices.'); }}>Export backup</Button>
        <Button onClick={() => { try { workspace.importJson(backup); setMessage('Backup imported.'); } catch (cause) { setMessage(cause instanceof Error ? cause.message : String(cause)); } }}>Import backup</Button>
      </div>
      <Field label="Workspace JSON"><Textarea rows={10} resize="vertical" value={backup} onChange={(_, data) => setBackup(data.value)} /></Field>
      {message && <p role="status">{message}</p>}
    </ContentDetails>
  </>;
}
