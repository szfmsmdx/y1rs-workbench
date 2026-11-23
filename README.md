# Y1Rs 装车工作台

在 Colnago Y1Rs 的侧视照片上悬停查看零件，点击打开参数和可选规格；左上用圆形色样切换七款涂装（含 2025 环法黄和裸碳）。配置与涂装保存在当前浏览器，选零件不改变照片。

零件按系统浏览，分组下方的购置清单按实际采购项列出规格、数量、参考价和状态。点「一键默认」可补齐待选项，保留已选规格。待选项不计入小计；车架组和 Di2 套件分别只算一次。右上角「我的配置」仍可快速打开预算明细。

## 本地预览与检查

```powershell
npm run dev
# 打开 http://127.0.0.1:4173
npm ci
npx playwright install chromium
npm test
```

`site/` 就是静态发布目录，不需要构建、Node 服务或数据库。以 HTTP 服务打开；不要双击 `index.html`，浏览器会拦截本地 ES 模块。

## 内容与图形

- `site/catalog.js`：零件参数、规格选项和原始报价。海外参考价用注明日期的人民币汇率中间价折算，取整到十元；单只价格不当整组价格，无报价的项目保留询价状态。
- `site/bike.js`：按各侧视原图的像素坐标校准裁切和零件轮廓；显示描边与透明点击区分别定义。
- `site/media/`：整车原图和圆形色样原文件，随静态站点一起发布，不依赖外部图床。常规车图和色样来自 [Colnago 日本产品页](https://shifta.jp/colnago/product/y1rs/)及 [Colnago 产品页](https://www.colnago.com/en-us/premium-bikes/y1rs-road-bike)；环法黄来自 [Bikeroom 白底侧视实拍](https://bike-room.com/cdn/shop/files/A2U_Colnago-Y1Rs-YSYL-Shimano-Dura-Ace-Di2-ENVE-SES-4-5-ostia-Cyclencycle.jpg?v=1762949979)；裸碳来自 [Colnago 日本发布照](https://shifta.jp/colnago/news-archive/detail/934/)，仍用 `site/yubc-mask.png` 去底。
- `site/app.js`：悬停、键盘/触屏交互、选件与本地配置。

## 腾讯云发布

线上入口：[Y1Rs 装车工作台](http://43.143.110.42/y1rs/)。现有 IP 的 HTTPS 证书是自签名证书；面向需要可信 HTTPS 的访问者时，给工作台配置域名和公开受信证书。

通过已有的 `cloudbench-tencent-web` SSH 别名部署。在远端用 `mktemp -d` 创建暂存目录，把 `site/`、`scripts/nginx-y1rs.conf` 和 `scripts/publish-cvm.sh` 放在同一级，再运行 `sudo -n bash <暂存目录>/publish-cvm.sh`。脚本只发布静态文件，不启动 Node 进程。

发布目录为 `/var/www/y1rs/releases/`，`/var/www/y1rs/current` 指向当前版本。每次脚本返回此次和前一次的目录；如需回滚，把 `current` 原子切回前一个目录即可，无需重载 Nginx。首次配置的原始 CloudBench vhost 备份在 `/var/backups/y1rs/cloudbench.original`。

发布后打开 `/y1rs/` 检查车图、涂装切换和选件；同一 IP 的 CloudBench 首页仍应在 HTTP 返回 301 跳转，HTTPS 未登录时返回 401。
