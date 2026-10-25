<div align="center">

# SoundCue

**配置驱动的 Web Audio UI 音效引擎 —— 用 JSON 描述声音，零音频资源，运行时整站换音。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/abitfox/soundcue/actions/workflows/ci.yml/badge.svg)](./.github/workflows/ci.yml)

[English](./README.md)

</div>

---

> ▶ **在线演示：[www.hackerenglish.com](https://www.hackerenglish.com)** —— 工作站里的每个音效都由本引擎实时合成。

市面上的 UI 音效方案，要么丢给你一堆 `.mp3`，要么是游戏引擎级的重型库。SoundCue 走另一条路：**声音即数据**。这里一个振荡器脉冲、那里一段滤波噪声，高频场景加节流——全部用 JSON 描述，实时合成，通过命名槽位（`typeTick`、`keyClick`、`uiClick`……）在运行时重新映射。
<div align="center">
  <img src="docs/media/demo.png" alt="SoundCue 音效试验台" width="820" />
</div>


```tsx
import { useSoundcue, playUiClick } from "soundcue";

function App() {
  useSoundcue(); // 首次手势时自动解锁音频上下文
  return <button onClick={() => playUiClick()}>点我</button>;
}
```

## 特性

- **零音频资源** —— 默认音效包纯合成（振荡器/噪声层、频率滑音、双二阶滤波器），一个 `.mp3` 都不用带。
- **配置驱动** —— 命名槽位映射预设；运行时拉取一份 JSON 配置即可整站换音，代码零改动。也支持采样文件播放。
- **防爆音** —— 全局主总线带动态压缩器，音量调大后多音效叠加也不会炸。
- **零依赖** —— core 无运行时依赖；React 入口只是薄薄一层 peer。
- **SSR 安全** —— 所有浏览器 API 访问都有守卫；服务端一切静默降级。

## 安装

```bash
npm install soundcue
```

| 技术栈 | 导入 |
| --- | --- |
| React / Next.js | `import { useSoundcue } from "soundcue"` |
| 任意框架 / 纯 JS | `import { createSoundcue } from "soundcue/core"` |

## API

### `createSoundcue(options?) → Soundcue`

独立引擎实例。

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `config` | `SoundConfig` | 初始音效包（默认内置合成包） |
| `configUrl` | `string` | 首次使用时拉取一次的 JSON 配置；成功后覆盖 `config` |

| 方法 | 说明 |
| --- | --- |
| `unlock()` | 恢复 AudioContext —— 在用户手势里尽早调用 |
| `play(slot)` | 播放槽位绑定的预设（未解锁/非浏览器环境静默） |
| `setMasterVolume(v)` | 全局音量倍率；`<= 0` 静音 |
| `setConfig(config)` | 运行时替换槽位 + 预设 |
| `getConfig()` | 当前配置快照 |

### 默认槽位名

`typeTick` · `keyClick` · `terminalPrint` · `bootBlip` · `bootSweep` ·
`bootEngage` · `uiClick` · `panelExpand` · `taskPass` · `taskFail`

框架无关入口（`soundcue/core`）还导出语义化快捷函数：
`playTypeTick()`、`playKeyClick()`、`playUiClick()`、`playBootSweep()`……

### 配置结构

```ts
{
  masterVolume: 1,
  slots: { uiClick: "C2" },
  presets: {
    C2: {
      throttle: 0,
      layers: [
        { kind: "osc", wave: "sine", freq: 520, freqEnd: 760, dur: 0.06, gain: 0.05, attack: 0.004 },
      ],
    },
  },
}
```

层（layer）为 `kind: "osc" | "noise"` 脉冲，支持 `freq`/`freqEnd` 滑音、
可选 `filter: { type, freq, freqEnd, q }`、多连音 `at` 偏移；预设也可以指向
`sample` 采样文件（支持截取偏移、时长、增益与播放速率抖动）。完整 schema 见
[`src/core/engine.ts`](./src/core/engine.ts)。

## 来源

抽取自 HackerEnglish 项目——工作站全套音效（开机序列、机械键盘、终端、任务反馈）都由它驱动。见 [`docs/PORTING.md`](./docs/PORTING.md)。

## 许可

[MIT](./LICENSE)。
