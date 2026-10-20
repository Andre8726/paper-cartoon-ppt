/** Finalize an already built native diagram using the installed presentations validator. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [out,skillDir,python]=process.argv.slice(2);
if(!out||!skillDir||!python)throw Error('Usage: node finalize.mjs <output-dir> <presentations-skill-dir> <runtime-python>');
const {finalizePresentation}=await import(pathToFileURL(path.join(skillDir,'container_tools/artifact_tool_utils.mjs')).href);
const privateDir=path.join(path.dirname(out),'.validation',path.basename(out));
await fs.mkdir(privateDir,{recursive:true});
await finalizePresentation({workspaceDir:path.dirname(out),candidatePath:path.join(out,'build/grouped.pptx'),
  finalPath:path.join(out,'figure.pptx'),pythonExecutable:python,
  explicitTotalSlideCount:1,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
  integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu','15240000,9525000','--validate-heading-fit'],
  fontPolicy:{basis:'design',families:['Microsoft YaHei']},
  verifyArtifactToolImport:true,receiptPath:path.join(privateDir,'receipt.json')});
console.log('Final PPTX: '+path.join(out,'figure.pptx'));
