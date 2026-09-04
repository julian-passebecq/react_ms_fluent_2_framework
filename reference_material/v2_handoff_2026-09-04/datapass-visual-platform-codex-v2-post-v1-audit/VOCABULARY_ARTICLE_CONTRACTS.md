# Vocabulary and article lesson contracts

This remains a small V2 content extension, not a separate framework.

## Contracts

```ts
interface VocabularyEntry {
  id: string;
  lemma: string;
  language: 'no' | 'en' | string;
  translation?: LocalizedText;
  partOfSpeech?: string;
  topicIds?: string[];
  definition?: LocalizedText;
  examples?: LocalizedText[];
  forms?: string[];
  difficulty?: string;
  sourceIds?: string[];
  tags?: string[];
}

interface VocabularyTopic {
  id: string;
  title: LocalizedText;
  vocabularyIds: string[];
  figureIds?: string[];
  articleLessonIds?: string[];
  assessmentIds?: string[];
}

interface ArticleLesson {
  id: string;
  title: LocalizedText;
  sourceIds: string[];
  summary: LocalizedText;
  vocabularyTopicIds?: string[];
  figureIds?: string[];
  assessmentIds?: string[];
}
```

## Use cases

- Norwegian technology vocabulary;
- energy vocabulary;
- IT/data/cloud vocabulary;
- business/statistics vocabulary;
- NRK/current-events reading lessons.

## Copyright rule

For public news/article lessons, store source metadata/link, original summary, vocabulary and short lawful excerpts rather than republishing full copyrighted articles.

## V2 priority

Implement the pure contracts and one small Storybook/fixture example if they fit naturally into the content package. Do not delay the Dubreu consumer or core V2 gates to build a full Norwegian site in this pass.
