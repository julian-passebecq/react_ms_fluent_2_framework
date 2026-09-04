import { ChallengeWorkbench, type usePracticeWorkspace } from '@datapass/learning';
import { useLocale } from '@datapass/ui';
import { Button } from '@fluentui/react-components';
import { practiceItemById, practiceItems } from '../../../../content/practice';
import { figureForPracticeId } from '../../../../content/visuals';
export default function ChallengePage({ id, workspace, onBack }: { id: string; workspace: ReturnType<typeof usePracticeWorkspace>; onBack: () => void }) {
  const { locale } = useLocale();
  const item = practiceItemById(id);
  if (!item) return <><h1>Practice item not found</h1><Button onClick={onBack}>Back to practice</Button></>;
  const index = practiceItems.findIndex(candidate => candidate.id === id);
  const navigate = (offset: number) => { const next = practiceItems[index + offset]; if (next) window.location.hash = `challenge/${next.id}`; };
  return <><div className="sandbox-actions"><Button onClick={onBack}>Back to practice</Button><Button disabled={index === 0} onClick={() => navigate(-1)}>Previous item</Button><Button disabled={index === practiceItems.length - 1} onClick={() => navigate(1)}>Next item</Button></div><ChallengeWorkbench key={id} challenge={item} figure={figureForPracticeId(id)} locale={locale} reducedMotion={window.matchMedia('(prefers-reduced-motion: reduce)').matches} progress={workspace.state.progress} onProgressChange={workspace.updateProgress} notes={workspace.state.notes[id]} onNotesChange={notes => workspace.setNote(id, notes)} /></>;
}
