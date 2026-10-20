/** Finalize an already built native diagram using the installed presentations validator. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [out,skillDir,python,configPath]=process.argv.slice(2);
if(!out||!skillDir||!python||!configPath)throw Error('Usage: node finalize.mjs <output-dir> <presentations-skill-dir> <runtime-python> <diagram-config.json>');
const config=JSON.parse(await fs.readFile(configPath,'utf8'));
if(![config.width,config.height].every(n=>Number.isFinite(n)&&n>0)||!Number.isInteger(config.slideCount)||config.slideCount<1)
  throw Error('Config must declare positive canvas width/height in pixels and slideCount.');
if(!Array.isArray(config.fontFamilies)||!config.fontFamilies.length||config.fontFamilies.some(f=>typeof f!=='string'||!f.trim()))
  throw Error('Config must declare the actual fontFamilies.');
const {finalizePresentation}=await import(pathToFileURL(path.join(skillDir,'container_tools/artifact_tool_utils.mjs')).href);
const privateDir=path.join(path.dirname(out),'.validation',path.basename(out));
await fs.mkdir(privateDir,{recursive:true});
await finalizePresentation({workspaceDir:path.dirname(out),candidatePath:path.join(out,'build/grouped.pptx'),
  finalPath:path.join(out,'figure.pptx'),pythonExecutable:python,
  explicitTotalSlideCount:config.slideCount,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
  integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs:['--expected-slide-size-emu',`${Math.round(config.width*9525)},${Math.round(config.height*9525)}`,'--validate-heading-fit'],
  fontPolicy:{basis:'design',families:config.fontFamilies},
  verifyArtifactToolImport:true,receiptPath:path.join(privateDir,'receipt.json')});
console.log('Final PPTX: '+path.join(out,'figure.pptx'));
