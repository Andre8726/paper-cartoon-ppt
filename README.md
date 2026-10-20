# paper-cartoon-ppt

读取论文 PDF，参考个人图库的视觉风格，独立设计研究路线或机制卡通图，生成对象级可编辑的 PowerPoint。

## 使用

将整个仓库作为名为 `paper-cartoon-ppt` 的技能目录放入 Codex 的技能路径，例如 `~/.codex/skills/paper-cartoon-ppt/`。也可以在对话中指定本地 `SKILL.md` 的绝对路径。

1. 将论文 PDF 放入 `ref_papers/`。
2. 将喜欢的论文示意图放入 `ref/`，作为配色、描边、字体层级等风格参考。
3. 调用技能，例如：

```text
使用 $paper-cartoon-ppt，读取 ref_papers 中的论文，参考 ref 的视觉风格，
原创绘制一页研究路线卡通图，输出可编辑 PPTX、PNG 和内容依据说明。
```

只有一个 PDF 时默认使用它；多个 PDF 时需指定目标。参考目录为空也可绘制，但不会声称匹配未提供的参考。

## 工作方式

模型先阅读正文、方法、图注和关键页面，建立带页码的内容证据映射，再根据科学关系独立构图。脚本负责生成、分组、验证及渲染；它不是无需模型解读、能够理解任意 PDF 的独立转换器。

优先以原生形状、自由曲线、箭头和文本框绘制。禁止以一整张图片或 SVG 嵌入 PPT 冒充对象级可编辑结果。实验发现、作者假说与背景简化需要区分。

参考图只用于通用视觉属性，不描摹轮廓、不复制独特构图、不替换文字后复用原图。交付前核对科学依据并进行参考与成图的视觉检查。

## 代码

| 文件 | 用途 |
| --- | --- |
| `scripts/prepare_inputs.py` | 全页 PDF 文本抽取、参考文件清单与哈希、指定页面渲染 |
| `scripts/diagram-kit.mjs` | 通用原生形状、自由曲线、箭头和文本组件 |
| `scripts/group_native.py` | 对指定原生对象进行 OOXML 分组 |
| `scripts/finalize.mjs` | 调用已安装 presentations 技能的 PPTX 校验工具 |
| `scripts/export_powerpoint.ps1` | Windows PowerPoint 后台只读打开并导出 PNG |
| `scripts/run_diagram.ps1` | 接收本次构图脚本的通用构建入口 |

技能源代码保持通用，不包含具体论文或学科的构图案例。每次调用后，根据当前论文的证据和参考图生成独立绘图脚本，保存在本次输出的 `build/` 中。对象分组规则、字体、画布尺寸和页数均由本次任务配置。

## 依赖与重建

- Node.js 与 `@oai/artifact-tool`，由适配的 Codex presentations 运行环境提供。
- Python 与 `pypdf`；OOXML 分组仅依赖 Python 标准库。
- PDF 页面预览可使用 `pdftoppm`。
- PPTX 校验需要已安装的 presentations 技能及其配套运行时。
- 本机 PowerPoint PNG 导出需要 Windows、已安装的 PowerPoint 和可用的 COM 会话；其他环境需使用可用的真实 PPTX 渲染器。

运行时路径通过参数传入，不写死用户名，也不自动安装依赖：

```powershell
.\scripts\run_diagram.ps1 `
  -DrawingScript '本次输出\build\draw.mjs' `
  -RuntimeNode '路径\node.exe' `
  -RuntimeNodeModules '路径\node_modules' `
  -RuntimePython '路径\python.exe' `
  -PresentationsSkill '路径\presentations技能目录'
```

默认生成一个新的输出目录并拒绝覆盖已有最终 PPTX。`-SkipPowerPoint` 可仅完成 PPTX 构建和校验；该模式不代表完成视觉核验。

## 输出与本地输入

输出包括 `figure.pptx`、`figure.png`、`drawing-notes.md` 及实际生成源代码。默认保存至 `paper-cartoon-output/`。

论文、参考图、抽取文本、渲染页、本地构建产物及验证记录默认忽略，不上传 GitHub。本次参考集的风格记录仅写入本次输出，不作为技能的固定风格。构图脚本接口见 [通用构建协议](references/build-contract.md)，技能要求见 [SKILL.md](SKILL.md)。
