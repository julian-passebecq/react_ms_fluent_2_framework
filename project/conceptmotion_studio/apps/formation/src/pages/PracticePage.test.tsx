import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { createEmptyProgressState } from '@datapass/progress';
import { LocaleProvider } from '@datapass/ui';
import { describe, expect, it, vi } from 'vitest';
vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
vi.mock('@datapass/learning', () => ({
  ProgressSummary: () => null,
  AssessmentRunner: ({ assessment, attemptId, onSubmit }: { assessment: { id: string }; attemptId: string; onSubmit: (value: unknown) => void }) => {
    const [submitted, setSubmitted] = useState(false);
    return <><button disabled={submitted} onClick={() => { setSubmitted(true); onSubmit({ attempt: { id: attemptId, assessmentId: assessment.id, status: 'submitted', answers: {} } }); }}>Submit assessment</button>{submitted && <p>Submitted review remains available</p>}</>;
  },
}));
vi.mock('../data/contentCatalog', () => ({ lessons: [], questions: [], sqlFilterFigure: {}, sqlPracticeAssessment: { id: 'assessment.dubreu.sql-practice' } }));
import { PracticePage } from './PracticePage';
describe('Formation practice review continuity', () => {
  it('retains submitted review after persistence updates and starts another attempt only explicitly', async () => {
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    function Harness() {
      const [progress, updateProgress] = useState(createEmptyProgressState());
      return <LocaleProvider><FluentProvider theme={webLightTheme}><PracticePage progress={progress} updateProgress={updateProgress} onBack={() => {}} onProgress={() => {}} /></FluentProvider></LocaleProvider>;
    }
    try {
      await act(() => root.render(<Harness />));
      const button = (text: string) => [...host.querySelectorAll('button')].find(candidate => candidate.textContent === text)!;
      await act(() => button('Submit assessment').click());
      expect(host.textContent).toContain('Submitted review remains available');
      expect(button('Submit assessment').disabled).toBe(true);
      await act(() => button('Start another attempt').click());
      expect(host.textContent).not.toContain('Submitted review remains available');
      expect(button('Submit assessment').disabled).toBe(false);
    } finally { await act(() => root.unmount()); host.remove(); }
  });
});
