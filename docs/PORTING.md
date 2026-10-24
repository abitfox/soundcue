# PORTING.md — 20_HackerEnglish → soundcue

| 原位置 | 新位置 | 改动 |
|---|---|---|
| `frontend/src/lib/sfx.ts`（模块级单例 + 全局函数） | `src/core/engine.ts`（`createSoundcue()` 工厂 + 默认实例） | 单例拆为工厂；`/sounds.json` 自动拉取改为可选 `configUrl` 选项；默认包去掉采样预设（T6/K5，依赖 mp3 资源），纯合成可即装即用；注释中文化→英文 |
| `frontend/src/lib/sfx.ts` 语义化函数（playTypeTick 等） | `src/core/index.ts` | 保留，绑定到默认实例 |
| （新增） | `src/react/index.ts` | `useSoundcue()`（手势解锁）+ `useSoundcueInstance()`（隔离实例）+ `useSoundConfig()` |
| （新增） | `test/engine.test.ts` | 槽位解析 / 节流 / 默认包完整性（纯逻辑，Node 可测） |
| `public/sounds.json` | 未搬运 | 26 行同名 JSON 可作为 `configUrl` 直接使用；默认包已内置同源 fallback |
| `public/sound-lab.html` | 未搬运 | 依赖具体页面结构；后续作为文档站试听页重建 |

关键设计保留：

- slots → presets 两级映射（运行时换包不动代码）
- throttle（ms）用于打字类高频音效
- masterGain → DynamicsCompressor 主总线（防爆音）
- 采样播放速率随机抖动（模拟真实连打）
- AudioContext 未解锁时静默 no-op
