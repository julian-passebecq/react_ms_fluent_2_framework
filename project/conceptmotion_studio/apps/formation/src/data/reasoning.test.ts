import { describe, expect, it } from 'vitest';
import { validateAssessmentSpec, validateQuestionSpec } from '@datapass/content';
import { visualById } from '../../../../content/visuals';
import { reasoningModules } from './reasoning';
import { courses } from './contentCatalog';

describe('Formation reasoning capstones', () => {
  it('adds course-first modules without replacing any V2 lesson IDs', () => {
    const ids=courses.flatMap(course=>course.modules.flatMap(module=>module.lessons.map(lesson=>lesson.id)));
    expect(ids).toEqual(expect.arrayContaining(['lesson.dubreu.python-lists','lesson.dubreu.sql-where','lesson.dubreu.sql-window','lesson.dubreu.pyspark-partitions','lesson.formation.think-sql','lesson.formation.think-python-de']));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('reuses real production visuals and connected prediction assessments', () => {
    for(const module of reasoningModules) {
      expect(module.sections).toHaveLength(6);
      for(const section of module.sections) if(section.visualId) expect(visualById(section.visualId)).toBeDefined();
      expect(module.lesson.figureIds).toEqual(module.sections.flatMap(section=>section.visualId?[section.visualId]:[]));
      expect(validateAssessmentSpec(module.assessment).valid).toBe(true);
      for(const question of module.questions) expect(validateQuestionSpec(question).valid).toBe(true);
      expect(module.assessment.questionIds).toEqual(module.questions.map(question=>question.id));
    }
  });
});
