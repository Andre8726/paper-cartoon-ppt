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
| `scripts/diagram-kit.mjs` | 原生可编辑形状、层状结构、自旋等绘图组件 |
| `scripts/draw_mn3sn.mjs` | Mn₃Sn 磁振子力矩论文的专用构图示例 |
| `scripts/group_native.py` | 对指定原生对象进行 OOXML 分组 |
| `scripts/finalize.mjs` | 调用已安装 presentations 技能的 PPTX 校验工具 |
| `scripts/export_powerpoint.ps1` | Windows PowerPoint 后台只读打开并导出 PNG |
| `scripts/run_mn3sn.ps1` | 示例论文的完整重建入口 |

示例论文 DOI：`10.1021/acs.nanolett.6c03042`。本仓库不附论文全文或第三方参考截图。更换论文需要重新建立证据映射并编写对应构图，不能只替换示例标题。

## 依赖与重建

- Node.js 与 `@oai/artifact-tool`，由适配的 Codex presentations 运行环境提供。
- Python 与 `pypdf`；OOXML 分组仅依赖 Python 标准库。
- PDF 页面预览可使用 `pdftoppm`。
- PPTX 校验需要已安装的 presentations 技能及其配套运行时。
- 本机 PowerPoint PNG 导出需要 Windows、已安装的 PowerPoint 和可用的 COM 会话；其他环境需使用可用的真实 PPTX 渲染器。

运行时路径通过参数传入，不写死用户名，也不自动安装依赖：

```powershell
.\scripts\run_mn3sn.ps1 `
  -RuntimeNode '路径\node.exe' `
  -RuntimeNodeModules '路径\node_modules' `
  -RuntimePython '路径\python.exe' `
  -PresentationsSkill '路径\presentations技能目录'
```

默认生成一个新的输出目录并拒绝覆盖已有最终 PPTX。`-SkipPowerPoint` 可仅完成 PPTX 构建和校验；该模式不代表完成视觉核验。

## 输出与本地输入

输出包括 `figure.pptx`、`figure.png`、`drawing-notes.md` 及实际生成源代码。默认保存至 `paper-cartoon-output/`。

论文、参考图、抽取文本、渲染页、本地构建产物及验证记录默认忽略，不上传 GitHub。`references/style-guide.md` 只记录本地示例参考的通用视觉特征，不包含原图。技能要求见 [SKILL.md](SKILL.md)。
