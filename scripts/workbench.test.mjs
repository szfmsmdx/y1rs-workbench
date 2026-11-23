import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { preview } from "./preview.mjs";
import { summarizeBuild } from "../site/catalog.js";

const url = (server) => `http://127.0.0.1:${server.address().port}/`;
const center = async (locator) => {
  const {x,y,width,height} = await locator.boundingBox();
  return [x+width/2,y+height/2];
};
const text = (page, selector) => page.locator(selector).textContent();
const choose = (page, id) => page.locator(`#parts-index [data-part="${id}"]`).click();
const save = (page) => page.locator("#details [data-add]").click();
async function waitForPhoto(page) {
  await page.locator("#side-view.photo-ready").waitFor({state:"visible", timeout:25000});
}
let server, browser;
before(async () => {
  server = preview(0);
  await once(server,"listening");
  const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  browser = await chromium.launch(executablePath ? {executablePath} : {});
});
after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve,reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("桌面：按系统拆件，套件不重复计费，预算随规格更新", async () => {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  page.on("pageerror",(error)=>errors.push(error.message));
  await page.goto(url(server),{waitUntil:"domcontentloaded"});
  await waitForPhoto(page);
  assert.equal(await text(page,"#paint-code"),"YSWC");
  assert.equal(await text(page,"#part-title"),"Colnago Y1Rs");
  assert.equal(await text(page,"#budget-amount"),"还未计价");
  assert.equal(await text(page,"#shopping-total"),"还未计价");
  assert.equal(await page.locator("#shopping .shopping-row").count(),5);
  assert.match(await text(page,'[data-purchase="wheels"]'),/前后 1 对.*¥19,130.*待选 · 未计入/s);
  assert.equal(await page.locator(".view-controls, #angle-photo, a[href*='customizer/y1rs']").count(),0);
  assert.deepEqual(await page.locator(".swatch").evaluateAll(items=>items.map(item=>item.dataset.paint)),
    ["YSWC","YSBC","SDM5","YSWW","YSBO","YSYL","YUBC"]);
  assert.equal(await page.locator(".swatch").first().evaluate(el=>getComputedStyle(el).borderRadius),"50%");

  for (const [id,label] of [["cockpit","车把"],["fork","前叉"],["chain","链条"],["front-wheel","前轮"],["rear-wheel","后轮"],["frontder","前拨"],["rearder","后拨"],["cassette","飞轮"],["rotors","碟片"],["bb","中轴"],["power","功率计"]]) {
    await page.mouse.move(...await center(page.locator(`[data-marker="${id}"] .marker-outer`)));
    const card = page.locator("#preview");
    await card.waitFor({state:"visible"});
    assert.match(await card.textContent(),new RegExp(label));
    const active = page.locator(".part-highlight.active");
    assert.equal(await active.getAttribute("data-highlight"),id);
    assert.equal(await active.evaluate(el=>getComputedStyle(el).strokeWidth),"1.25px");
  }
  const fork = page.locator('[data-zone="fork"]');
  await page.mouse.click(...await center(page.locator('[data-marker="fork"] .marker-outer')));
  assert.equal(await text(page,"#part-title"),"Y1Rs 原厂前叉");
  assert.equal(await fork.evaluate(el=>getComputedStyle(el).outlineStyle),"none");
  assert.equal(await fork.locator(".zone-focus").evaluate(el=>getComputedStyle(el).opacity),"0");
  if (process.env.CAPTURE_WORKBENCH) await page.screenshot({path:"artifacts/shopping-hover-click.png"});
  await page.mouse.move(1,1);
  assert.equal(await page.locator(".part-highlight.active, .part-highlight.pinned").count(),0);

  if (process.env.CAPTURE_WORKBENCH) await page.screenshot({path:"artifacts/budget-desktop.png",fullPage:true});
  await fork.focus();
  await page.keyboard.press("Enter");
  assert.equal(await text(page,"#part-title"),"Y1Rs 原厂前叉");
  assert.match(await text(page,".price"),/随车架组提供/);
  await page.getByRole("button",{name:"查看车架组"}).click();
  await save(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥57,030");
  assert.match(await text(page,'[data-purchase="frame"]'),/¥57,030.*已计入/s);

  await choose(page,"chain");
  assert.match(await text(page,".price"),/随套件提供/);
  assert.equal(await page.locator("#details [data-add]").count(),0);
  await page.getByRole("button",{name:"查看变速套件"}).click();
  assert.match(await text(page,".price"),/约 ¥17,600/);
  await save(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥74,630");
  assert.equal(await page.locator('[data-part="chain"] .saved-mark').isVisible(),true);
  assert.equal(await page.locator('[data-part="power"] .saved-mark').isVisible(),false);

  await choose(page,"wheels");
  await page.selectOption("#option","XDR");
  await save(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥93,760");
  await choose(page,"bb"); await save(page);
  await choose(page,"saddle"); await save(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥96,210");
  await page.getByRole("link",{name:"查看购置清单"}).click();
  assert.equal(new URL(page.url()).hash,"#shopping");
  assert.match(await text(page,"#shopping-total"),/96,210/);
  assert.match(await text(page,'[data-purchase="groupset"]'),/含手变、前后拨.*链条/s);
  assert.match(await text(page,"#shopping .budget-warnings"),/Post Mount.*XDR/s);
  if (process.env.CAPTURE_WORKBENCH) await page.screenshot({path:"artifacts/shopping-list.png"});
  await page.getByRole("button",{name:/^我的配置 /}).click();
  assert.match(await text(page,".dialog-total"),/96,210/);
  assert.equal(await page.locator(".build-list li").count(),5);
  assert.match(await text(page,".build-list"),/19,130/);
  assert.match(await text(page,"#build-dialog .budget-warnings"),/Post Mount.*XDR/s);
  assert.match(await text(page,"#build-dialog .budget-note"),/未计外胎/);
  if (process.env.CAPTURE_WORKBENCH) await page.screenshot({path:"artifacts/budget-dialog.png"});
  await page.locator('.build-list [data-jump="groupset"]').click();
  assert.equal(await page.locator("#build-dialog").isHidden(),true);
  await page.selectOption("#option","power");
  await save(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥94,740");
  assert.equal(await page.locator('[data-part="power"] .saved-mark').isVisible(),true);
  await choose(page,"crank");
  assert.equal(await text(page,"#part-title"),"Shimano FC-R9200-P");

  const beforeOutline = await page.locator('[data-highlight="front-wheel"]').getAttribute("d");
  await page.getByRole("button",{name:"白蓝 YSWW"}).click();
  await waitForPhoto(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥90,100");
  assert.notEqual(await page.locator('[data-highlight="front-wheel"]').getAttribute("d"),beforeOutline);
  await page.reload({waitUntil:"domcontentloaded"});
  await waitForPhoto(page);
  assert.equal(await text(page,"#budget-amount"),"约 ¥90,100");
  await page.locator('#shopping [data-remove="wheels"]').click();
  assert.equal(await text(page,"#shopping-total"),"约 ¥70,970");
  assert.match(await text(page,'[data-purchase="wheels"]'),/待选 · 未计入/);
  await page.getByRole("button",{name:/^我的配置 /}).click();
  assert.equal(await text(page,"#budget-amount"),"约 ¥70,970");
  assert.equal(await page.getByRole("button",{name:"选轮组"}).isVisible(),true);
  await page.getByRole("button",{name:"选轮组"}).click();
  assert.equal(await page.locator("#build-dialog").isHidden(),true);
  assert.equal(await text(page,"#part-title"),"ENVE SES 4.5");
  assert.deepEqual(errors,[]);
  await page.close();
});

test("整车图与色样从本站加载，整车图按需请求", async () => {
  const page = await browser.newPage();
  const home = new URL(url(server));
  const imageRequests = [];
  page.on("request",request=>{
    if (request.resourceType() === "image") imageRequests.push(new URL(request.url()));
  });
  await page.goto(home.href,{waitUntil:"load"});
  await waitForPhoto(page);
  assert.deepEqual(imageRequests.filter(image=>image.pathname.includes("/media/bike-")).map(image=>image.pathname),
    ["/media/bike-yswc.jpg"]);
  assert.deepEqual(await page.locator(".swatch img").evaluateAll(images=>images.map(img=>img.naturalWidth)),
    Array(6).fill(80));
  for (const id of ["YSBC","SDM5","YSWW","YSBO","YSYL","YUBC"]) {
    await page.locator(`[data-paint="${id}"]`).click();
    await waitForPhoto(page);
    assert.equal(await page.locator("#bike-photo").evaluate(img=>img.currentSrc),
      new URL(`media/bike-${id.toLowerCase()}.jpg`,home).href);
  }
  assert.ok(imageRequests.every(image=>image.origin === home.origin));
  await page.close();
});

test("环法黄与裸碳：换图、轮廓、人民币车架报价和保存", async () => {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  let releaseMask;
  const maskGate = new Promise(resolve=>{ releaseMask = resolve; });
  await page.route("**/yubc-mask.png", async route=>{ await maskGate; await route.continue(); });
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(url(server),{waitUntil:"domcontentloaded"});
  await waitForPhoto(page);
  await save(page);
  for (const [code,name,width,price] of [
    ["YSYL","2025 环法黄",1920,"49,940"],["YUBC","裸碳",1536,"52,390"],
  ]) {
    const swatch = page.getByRole("button",{name:`${name} ${code}`});
    await swatch.click();
    if (code === "YUBC") {
      assert.equal(await page.locator("#side-view.photo-ready").count(),0);
      releaseMask();
    }
    await waitForPhoto(page);
    assert.equal(await swatch.getAttribute("aria-pressed"),"true");
    assert.equal(await text(page,"#paint-code"),code);
    const photo = page.locator("#bike-photo");
    assert.equal(await photo.evaluate(el=>el.naturalWidth),width);
    assert.match(await photo.getAttribute("alt"),new RegExp(name));
    if (code === "YUBC") {
      const mask = await page.request.get(new URL("yubc-mask.png",url(server)).href);
      assert.equal(mask.status(),200);
      assert.match(await photo.evaluate(el=>getComputedStyle(el).maskImage),/yubc-mask\.png/);
    }
    assert.match(await text(page,"#budget-amount"),new RegExp(`¥${price}`));
    assert.match(await text(page,'[data-purchase="frame"]'),new RegExp(name));
    if (process.env.CAPTURE_WORKBENCH) await page.locator(".stage").screenshot({path:`artifacts/paint-${code}.png`});
    for (const id of ["saddle","cockpit","fork","rear-wheel","front-wheel","chain"]) {
      await page.mouse.move(...await center(page.locator(`[data-marker="${id}"] .marker-outer`)));
      await page.locator(`[data-highlight="${id}"].active`).waitFor({timeout:2500});
      if (id === "fork" && process.env.CAPTURE_WORKBENCH) {
        await page.locator(".stage").screenshot({path:`artifacts/paint-${code}-fork.png`});
      }
    }
  }
  await page.reload({waitUntil:"domcontentloaded"});
  await waitForPhoto(page);
  assert.equal(await text(page,"#paint-code"),"YUBC");
  assert.deepEqual(errors,[]);
  await page.close();
});

test("上版已选零件保留，未选套件不自动加价", async () => {
  const page = await browser.newPage();
  await page.addInitScript(()=>localStorage.setItem("velo-workshop:y1rs:v1",JSON.stringify({
    paint:"YSWC",build:{frame:"S",cockpit:"125-397",fork:"",wheels:"XDR",saddle:"140",crank:"2",chain:"",seatpost:"-15"},
  })));
  await page.goto(url(server),{waitUntil:"domcontentloaded"});
  assert.equal(await text(page,"#budget-amount"),"约 ¥78,360");
  await page.getByRole("button",{name:/^我的配置 /}).click();
  assert.equal(await page.locator(".build-list li").count(),3);
  assert.match(await text(page,".build-list"),/125 × 397 mm/);
  assert.match(await text(page,".pending"),/变速套件.*中轴/s);
  assert.match(await page.locator("#build-dialog .budget-note").first().textContent(),/已保留上版选过的子件/);
  await page.close();
});

test("预算模型只把可采购项汇总，并提醒座管差价和塔基冲突", () => {
  const build = new Map([["frame","M"],["cockpit","115-377"],["groupset","standard"],["chain",""],["crank","2"],["seatpost","0"],["bb",""],["wheels","N3W"],["saddle","140"]]);
  const budget = summarizeBuild(build,"YSWC");
  assert.equal(budget.total,96210);
  assert.deepEqual(budget.selected.map(row=>row.id),["frame","groupset","bb","wheels","saddle"]);
  assert.equal(budget.notes.length,3);
  assert.deepEqual(budget.missing,[]);
});

test("一键默认补齐采购项，不覆盖已选规格或涂装", async () => {
  const page = await browser.newPage({viewport:{width:1440,height:960}});
  await page.addInitScript(()=>{
    const key = "velo-workshop:y1rs:v1";
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      paint:"YSWW",build:{frame:"S",cockpit:"125-397",groupset:"power"},
    }));
  });
  await page.goto(url(server),{waitUntil:"domcontentloaded"});
  const fill = page.getByRole("button",{name:"一键默认"});
  assert.equal(await page.getByText("勾号表示已计入预算或随套件提供").count(),0);
  assert.equal(await fill.isEnabled(),true);
  if (process.env.CAPTURE_WORKBENCH) {
    await fill.scrollIntoViewIfNeeded();
    await page.screenshot({path:"artifacts/fill-defaults.png"});
  }
  await fill.click();
  assert.equal(await fill.isDisabled(),true);
  assert.equal(await text(page,"#shopping-total"),"约 ¥90,100");
  assert.match(await text(page,'[data-purchase="frame"]'),/白蓝 · S.*125 × 397 mm/s);
  assert.match(await text(page,'[data-purchase="groupset"]'),/功率版/);
  assert.match(await text(page,'[data-purchase="wheels"]'),/HG.*已计入/s);
  assert.equal(await page.locator("#shopping .shopping-status.is-added").count(),5);
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await fill.isDisabled(),true);
  assert.equal(await text(page,"#shopping-total"),"约 ¥90,100");
  await page.locator('#shopping [data-remove="bb"]').click();
  assert.equal(await fill.isEnabled(),true);
  await page.close();
});

test("手机：触摸链条，预算与分组不横向溢出", async () => {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await page.goto(url(server),{waitUntil:"domcontentloaded"});
  await waitForPhoto(page);
  if (process.env.CAPTURE_WORKBENCH) await page.screenshot({path:"artifacts/budget-mobile.png",fullPage:true});
  await page.touchscreen.tap(...await center(page.locator('[data-marker="chain"] .marker-outer')));
  assert.equal(await text(page,"#part-title"),"Shimano CN-M9100");
  assert.equal(await page.locator("#preview").isHidden(),true);
  assert.equal(await page.locator(".part-highlight.active").count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
  await page.locator('#shopping [data-jump="bb"]').click();
  assert.equal(await text(page,"#part-title"),"Shimano BB-R9100");
  await save(page);
  assert.equal(await text(page,"#shopping-total"),"约 ¥250");
  await page.close();
});
