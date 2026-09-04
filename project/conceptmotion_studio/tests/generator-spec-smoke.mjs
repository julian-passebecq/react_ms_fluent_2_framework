import { generatorExamples } from '../src/data/generatorExamples.js';
import { validateGeneratorSpec } from '../src/lib/generatorSpecs.js';

for (const spec of generatorExamples) validateGeneratorSpec(spec);

const invalidCloud = structuredClone(generatorExamples[0]);
invalidCloud.edges.push({ from: 'missing', to: 'powerbi' });
let rejected = false;
try { validateGeneratorSpec(invalidCloud); } catch { rejected = true; }
if (!rejected) throw new Error('cloud spec validation should reject unknown edge endpoints');

const invalidModel = structuredClone(generatorExamples[1]);
invalidModel.relationships.push({ from: 'sales.MissingKey', to: 'dates.DateKey', cardinality: 'many-to-one' });
rejected = false;
try { validateGeneratorSpec(invalidModel); } catch { rejected = true; }
if (!rejected) throw new Error('data model validation should reject unknown field references');

console.log(`generator spec smoke: ${generatorExamples.length} seed contracts validated`);
