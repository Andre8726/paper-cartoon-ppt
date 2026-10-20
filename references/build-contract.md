# 通用构建协议

阅读并理解论文后，由模型在本次输出的 `build/` 编写 `draw.mjs`。源技能仅保存跨论文复用的工具；不要向技能仓库追加当前论文的文字、DOI、专用图标或固定布局。

## 构图脚本

`draw.mjs` 接受一个输出目录参数，创建该目录下的 `build/`，生成：

- `build/candidate.pptx`：真实可编辑 PPTX，绘制内容由本次论文决定。
- `build/diagram-config.json`：画布、页数、字体和分组声明。
- 重建所需的独立源代码和必要资产。使用 `diagram-kit.mjs` 时，将它放入该 build 目录并采用相对导入，避免源代码依赖某个用户的绝对路径。

可以通过 `ARTIFACT_TOOL_DIR` 动态导入该目录的 `dist/artifact_tool.mjs`；未设置时使用已安装的 `@oai/artifact-tool`。脚本必须在创建输出前验证关键输入，不能把缺少论文证据的部分补造成事实。

## 配置字段

| 字段 | 类型与约束 | 含义 |
| --- | --- | --- |
| `width`、`height` | 正数，单位为 CSS px（96 DPI） | 本次画布尺寸 |
| `slideCount` | 正整数 | 本次实际总页数；遵守用户要求 |
| `fontFamilies` | 非空字符串数组 | 实际使用并确认可用的字体 |
| `groups` | 数组，可为空 | 每项包含从 1 开始的 `slide` 和非空字符串数组 `prefixes` |

每个名称前缀对应一个要组合的科学对象，至少匹配两个顶层原生形状。以足够明确的前缀区分不同对象；将同一对象的部件连续创建，避免跨对象交错的叠放顺序。工具拒绝会改变其他对象叠放关系的分组。已经由绘图库正确分组的对象不必再次声明。

分组工具保持各部件全局坐标和原始尺寸，不预设学科、最低形状总数或分组总数。无 `groups` 时原样复制 PPTX。形状数量不是判断科学内容完整性或可编辑性的充分依据，仍须检查关键对象和标签。

## 运行

```powershell
.\scripts\run_diagram.ps1 `
  -DrawingScript '本次输出\build\draw.mjs' `
  -RuntimeNode '路径\node.exe' `
  -RuntimeNodeModules '路径\node_modules' `
  -RuntimePython '路径\python.exe' `
  -PresentationsSkill '路径\presentations技能目录' `
  -OutputDirectory '本次输出'
```

入口拒绝覆盖已有最终 `figure.pptx`，需要修订时指定新输出目录。单页 PowerPoint 导出根据画布比例计算预览尺寸；多页输出应逐页渲染检查，可先用 `-SkipPowerPoint` 构建，再使用支持多页的真实 PPTX 渲染器。该开关不代表已完成视觉核验。

该工具链依赖适配的 presentations 校验环境。其他环境可以采用其可用的 PPTX 库和渲染器，但交付范围、原生可编辑性、科学依据和视觉核验要求不变。
