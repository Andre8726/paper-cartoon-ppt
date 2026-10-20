/** Paper-specific example. Evidence: supplied PDF pp. 1-6; not raw-data plots.
 * Runtime: Node + @oai/artifact-tool. Set ARTIFACT_TOOL_DIR if not importable.
 * Usage: node draw_mn3sn.mjs [output-directory]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {diagramKit} from './diagram-kit.mjs';
process.on('uncaughtException',e=>{console.error(e.stack?.split('\n').filter(l=>!l.includes('artifact_tool.mjs:2979')).slice(0,9).join('\n')||e.message);process.exit(1)});
const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(process.argv[2]||path.join(here,'../paper-cartoon-output/mn3sn-magnon'));
const runtime=process.env.ARTIFACT_TOOL_DIR;
const {Presentation,PresentationFile}=await import(runtime?pathToFileURL(path.join(runtime,'dist/artifact_tool.mjs')).href:'@oai/artifact-tool');
await fs.mkdir(path.join(out,'build'),{recursive:true});
const p=Presentation.create({slideSize:{width:1600,height:1000}});
const s=p.slides.add();s.background.fill='#FFFFFF';
const k=diagramKit(s),{text,line,arrow,ellipse,poly,panel,spins,slab}=k;
const shape=(name,...args)=>k.shape('rect',name,...args);
const C={ink:'#233858',muted:'#637184',lav:'#E8E1F1',peach:'#F7E2D7',blue:'#E1EBF4',green:'#E2EEE5',purple:'#A18BBF',teal:'#6FA5A0',red:'#B95767'};
text('heading','磁振子力矩驱动 Mn₃Sn 拓扑反铁磁态高效翻转',44,22,1510,53,38,C.ink,true);
text('subtitle','研究路线：异质结构构筑  →  电学证据  →  自旋动力学解释  →  无外场写入',47,81,1450,30,22,C.muted);

// An original three-stage upper flow plus two linked lower branches.
panel('fabrication','01  构筑磁振子传输异质结构',42,139,470,362,C.lav);
panel('transport','02  写入与反常霍尔读出',552,139,470,362,C.peach);
panel('evidence','03  验证效率与传输窗口',1062,139,496,362,C.blue);
arrow('flow-1',518,317,545,317,C.ink,2.5,10);
arrow('flow-2',1028,317,1055,317,C.ink,2.5,10);

// Stack: correct deposition order, cap, and dimensions; not drawn to scale.
slab('stack-substrate',72,360,191,27,'#D6DCE5','Si / SiO₂');
slab('stack-Mn3Sn',72,325,191,30,'#E9D0B9','Mn₃Sn  10 nm');
slab('stack-NiO',72,271,191,48,'#D9E9E5','NiO  25 nm');
slab('stack-W',72,238,191,27,'#C8C0E0','W  5 nm');
slab('stack-Ta',72,215,191,17,'#E0E4EA','',8);
text('cap-label','Ta 2 nm',298,204,170,27,18);
line('cap-leader',267,220,288,220,C.muted,1);
text('fab-steps','磁控溅射',299,249,170,29,23,C.ink,true);
text('anneal','Mn₃Sn 退火',299,290,180,27,20);
text('anneal-condition','450 °C · 1 h',299,321,180,27,20,C.muted);
text('control','对照：Mn₃Sn / W',72,410,390,30,23,C.ink,true);
text('fab-note','沉积后制备 10 μm 宽霍尔条',72,452,400,27,20,C.muted);

// Working principle, top-down angular momentum transfer, native wave.
shape('device-W',581,222,163,36,'#C8C0E0',C.ink,1.2);
shape('device-NiO',581,264,163,66,'#D9E9E5',C.ink,1.2);
shape('device-Mn3Sn',581,336,163,46,'#E9D0B9',C.ink,1.2);
text('W-label','W',591,226,40,25,20,C.ink,true);
text('NiO-label','NiO',591,282,48,25,20,C.ink,true);
text('Mn-label','Mn₃Sn',591,345,75,25,20,C.ink,true);
arrow('charge-current',652,237,727,237,C.red,3,9);
text('Jc','Jc',691,196,50,26,19,C.red,true);
arrow('spin-current',701,253,701,280,C.purple,3,9);
const wave=Array.from({length:35},(_,i)=>[700+10*Math.sin(i/34*5*Math.PI),283+i/34*37]);
poly('magnon-wave',wave,'none',C.teal,2.8,false);
arrow('magnon-torque',701,318,701,351,C.teal,3,9);
text('write-chain','电荷流 → 自旋流',770,225,225,29,21,C.ink,true);
text('conversion','自旋霍尔效应',770,263,225,26,19,C.muted);
text('magnon-text','NiO 磁振子传输',770,302,225,29,21,C.ink,true);
text('torque-text','力矩驱动八极矩翻转',770,344,230,29,20);
spins('state-A',638,426,22);spins('state-B',749,426,22,true);
arrow('state-switch',677,426,714,426,C.ink,2,8);
text('readout','两磁态 → 反常霍尔\n电阻读出',796,407,203,58,18,C.muted);

// Reported values, no invented sampled curves.
text('jc-label','临界电流密度 Jc',1087,204,430,29,23,C.ink,true);
text('jc-unit','Hₓ = −1000 Oe；单位 MA/cm²',1087,238,430,26,18,C.muted);
text('control-name','无 NiO',1087,280,105,27,20);
shape('control-bar',1204,283,227,20,'#C6BDD8','none',0);
text('control-jc','12.6',1443,276,80,29,21,C.ink,true);
text('nio-name','有 NiO',1087,321,105,27,20);
shape('nio-bar',1204,324,151.33,20,C.teal,'none',0);
text('nio-jc','8.4',1367,317,73,29,21,C.ink,true);
text('reduction','降低约 1/3',1087,366,430,30,24,C.red,true);
line('evidence-rule',1087,410,1530,410,'#CAD2DF',1);
text('thickness','NiO 厚度扫描：10–30 nm',1087,424,430,28,21);
text('optimal','25 nm：Jc 最低，翻转比例最高',1087,459,440,26,20,C.muted);

// Lower branches are scientific illustrations, not copied reference panels.
panel('simulation','04  自旋动力学：为何更易翻转？',42,554,735,345,C.green);
panel('wedge','05  楔形 NiO：走向无外场写入',819,554,739,345,C.lav);
arrow('branch-sim',787,503,787,528,C.ink,2,8);
line('branch-left',787,528,407,528,C.ink,1.6);
arrow('branch-left-down',407,528,407,548,C.ink,1.8,8);
line('branch-right',787,528,1185,528,C.ink,1.6);
arrow('branch-right-down',1185,528,1185,548,C.ink,1.8,8);

text('sim-label','LLGS 模型 / 多晶磁构型',65,613,650,28,23,C.ink,true);
spins('sim-hard',152,708,37);
text('hard-caption','难翻转子构型',77,764,157,28,19,C.muted,false,'center');
arrow('sigma-fixed',103,655,161,655,C.purple,3,9);
text('sigma-zero','θσ = 0°',178,641,140,28,20,C.muted);
arrow('polarizer-model',252,710,326,710,C.teal,2.5,10,true);
spins('sim-easy',405,708,37,true);
arrow('sigma-tilt',355,663,407,632,C.purple,3,9);
text('sigma-rotated','θσ = −30°',432,630,160,28,20,C.muted);
text('easy-caption','部分子构型可翻转',315,764,200,28,19,C.muted,false,'center');
text('sim-hypothesis','NiO 调整传输自旋极化',510,683,242,28,20,C.ink,true);
text('sim-hypothesis2','有利于难翻转构型重取向',510,720,242,29,18,C.muted);
text('sim-legend','虚线：作者提出、模拟支持的机制解释',66,825,665,28,19,C.teal);

// Wedge cross section: y horizontal, z vertical; thickness varies along y.
poly('wedge-W',[[847,682],[1077,641],[1077,669],[847,710]],'#C8C0E0',C.ink,1.3);
poly('wedge-NiO',[[847,716],[1077,675],[1077,755],[847,755]],'#D9E9E5',C.ink,1.5);
shape('wedge-Mn3Sn',847,761,230,28,'#E9D0B9',C.ink,1.3);
text('wedge-label-W','W',856,681,45,25,18,C.ink,true);
text('wedge-label-NiO','NiO',973,716,70,28,19,C.ink,true);
text('wedge-label-Mn','Mn₃Sn',896,760,120,29,19,C.ink,true);
arrow('flux-thin',910,706,910,750,C.teal,4.5,10);
arrow('flux-middle',960,697,960,750,C.teal,3.2,9);
arrow('flux-thick',1050,680,1050,750,C.teal,1.9,7);
arrow('axis-y',855,807,1063,807,C.ink,1.4,7);
text('axis-y-label','y：厚度递增方向',866,814,225,26,17,C.muted);
text('gradient','厚度梯度 → 传输梯度',1115,618,410,30,22,C.ink,true);
text('symmetry','作者解释：破坏镜面对称性',1115,659,410,28,20,C.muted);
text('effective-field','产生面外有效场分量',1115,696,410,28,20,C.muted);
text('field-free','实测：Hₓ = 0 确定性翻转',1115,749,410,32,24,C.red,true);
text('robust','翻转手性与比例对 ±1000 Oe',1115,797,410,26,19);
text('robust2','面内场保持稳健',1115,826,410,26,19,C.muted);

line('footer-rule',43,928,1556,928,'#C9D1DC',1);
text('footer','论文：Liu et al. · Nano Letters · DOI: 10.1021/acs.nanolett.6c03042',44,940,1160,26,18,C.muted);
text('schematic-note','示意图，非按比例；未重绘原始测量曲线',1040,941,518,26,17,C.muted,false,'right');
s.speakerNotes.text='来源：用户提供 acs.nanolett.6c03042.pdf。器件与尺寸：PDF第2页 Fig.2a；工艺：第5页 Experimental Section。Jc=12.6/8.4 MA/cm²，Hx=-1000 Oe：第3页正文（摘要精确值8.45×10^6 A/cm²，图中采用正文一致的四舍五入值）。厚度窗口：第3-4页 Fig.3；LLGS与极化机制：第4页 Fig.4、第5-6页。楔形NiO无场翻转、磁场稳健性：第5页 Fig.5。NiO极化和楔形有效场为作者解释，非独立直接测量。参考图仅用于配色与描边特征，未嵌入任何参考素材。';
await (await PresentationFile.exportPptx(p)).save(path.join(out,'build/candidate.pptx'));
for(const file of ['draw_mn3sn.mjs','diagram-kit.mjs'])await fs.copyFile(path.join(here,file),path.join(out,'build',file));
console.log(path.join(out,'build/candidate.pptx'));
