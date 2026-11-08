# 楚河棋室

中文网页象棋，支持同屏双人和人机对弈。红方先行，可以查看合法落点、中文棋谱、悔棋或重新开局。

## 人机对弈

玩家执红。黑方使用 Pikafish 神经网络引擎，不启用棋力削弱。每步搜索 15 秒，按设备逻辑核心数启用最多 8 个线程，置换表为 64 MiB。首次走子会下载约 51 MB 的网络权重。需要支持 WebAssembly SIMD、线程和跨源隔离的现代浏览器。

本应用按页面「对弈规则」处理三次重复、单方长将和无吃子回合，不作竞赛规程中全部长捉例外的裁定。

## 本地运行

需要 Node.js 22 或更新版本。运行 `node --test` 检查规则，运行 `node scripts/build.mjs` 构建，再运行 `node scripts/serve.mjs`。访问终端显示的地址。
Vercel 从仓库根目录读取 `vercel.json`，构建静态站点并发送多线程引擎所需的响应头。

## 引擎来源与许可

构建脚本从固定发布版本下载并按 SHA-256 验证引擎和网络，访问游戏时从本站同源加载。引擎与浏览器工作线程使用 GPL-3.0-or-later，模型受单独的 NNUE 许可证约束，商业使用需要权利人许可。

- [浏览器移植 v0.1.0、构建脚本与对应源代码补丁](https://github.com/brianhliou/pikafish-wasm/tree/v0.1.0)
- [对应的 Pikafish 源码](https://github.com/official-pikafish/Pikafish/tree/6a59ee2f7b105bff64d9efc2692591107787e2b1)
- [引擎许可证](public/engine/LICENSE) 和 [模型许可证](public/engine/NNUE-License.md)
