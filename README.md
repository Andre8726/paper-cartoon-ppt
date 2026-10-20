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

只有一个 PDF 时默认使用它；多个 PDF 时需指定目标。参考目录为空时，采用简洁的学术卡通风格。

## 工作方式

Codex 阅读论文正文、方法、图注和关键页面，梳理研究步骤与科学关系，再结合参考图的视觉风格独立构图。绘图脚本负责生成、分组、验证和渲染。

图中的主要对象采用 PowerPoint 原生形状、自由曲线、箭头和文本框，方便修改文字、颜色和图形部件。图示区分实验发现与作者提出的机制解释，并提供论文内容依据。

参考图用于配色、描边和文字层级等视觉风格，具体内容与布局根据论文重新设计。交付前核对科学依据并检查成图效果。

## 代码

| 文件 | 用途 |
| --- | --- |
| `scripts/prepare_inputs.py` | 全页 PDF 文本抽取、参考文件清单与哈希、指定页面渲染 |
| `scripts/diagram-kit.mjs` | 通用原生形状、自由曲线、箭头和文本组件 |
| `scripts/group_native.py` | 对指定原生对象进行 OOXML 分组 |
| `scripts/finalize.mjs` | 调用已安装 presentations 技能的 PPTX 校验工具 |
| `scripts/export_powerpoint.ps1` | Windows PowerPoint 后台只读打开并导出 PNG |
| `scripts/run_diagram.ps1` | 接收本次构图脚本的通用构建入口 |

支持按需设置画布尺寸、字体、页数和对象分组。生成的绘图脚本保存在输出目录的 `build/` 中，可用于后续修改和重建。

## 依赖与重建

- Node.js 与 `@oai/artifact-tool`，由适配的 Codex presentations 运行环境提供。
- Python 与 `pypdf`；OOXML 分组仅依赖 Python 标准库。
- PDF 页面预览可使用 `pdftoppm`。
- PPTX 校验需要已安装的 presentations 技能及其配套运行时。
- 本机 PowerPoint PNG 导出需要 Windows、已安装的 PowerPoint 和可用的 COM 会话；其他环境需使用可用的真实 PPTX 渲染器。

如需手动运行生成的绘图脚本，可指定运行环境：

```powershell
.\scripts\run_diagram.ps1 `
  -DrawingScript '本次输出\build\draw.mjs' `
  -RuntimeNode '路径\node.exe' `
  -RuntimeNodeModules '路径\node_modules' `
  -RuntimePython '路径\python.exe' `
  -PresentationsSkill '路径\presentations技能目录'
```

每次运行默认创建新的输出目录。添加 `-SkipPowerPoint` 可跳过 PowerPoint 预览导出，后续需使用其他渲染器检查排版。

## 输出

输出包括 `figure.pptx`、`figure.png`、`drawing-notes.md` 及实际生成源代码。默认保存至 `paper-cartoon-output/`。

详细的构建接口见 [通用构建协议](references/build-contract.md)，完整工作流程见 [SKILL.md](SKILL.md)。
