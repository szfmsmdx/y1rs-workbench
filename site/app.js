import { alignHotspots, drawHotspots, photoLayout, zones } from "./bike.js";
import { categories, defaultOption, formatQuote, fxBasis, kits, paints, parts, purchaseQuote, summarizeBuild, yuan } from "./catalog.js";

const $ = (query) => document.querySelector(query);
const diagram = $("#diagram");
const details = $("#details");
const preview = $("#preview");
const palette = $("#palette");
const sideView = $("#side-view");
const sidePhoto = $("#bike-photo");
const sideMask = new Image();
const mediaStatus = $("#media-status");
const index = $("#parts-index");
const fillDefaults = $("#fill-defaults");
const shoppingBody = $("#shopping-body");
const dialog = $("#build-dialog");
const buildBody = $("#build-body");
const storageKey = "velo-workshop:y1rs:v1";
const partIds = Object.keys(parts);

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const paint = paints.find(({id}) => id === saved?.paint) ?? paints[0];
    const build = new Map(partIds.flatMap((id) => {
      const value = saved?.build?.[id];
      const options = parts[id].options;
      return options ? (options.some((item) => item.id === value) ? [[id,value]] : []) : (value === "" ? [[id,""]] : []);
    }));
    return {paint, build};
  } catch {
    return {paint:paints[0], build:new Map()};
  }
}

const {paint, build} = restore();
const state = {paint, build, draft:new Map(build), part:"frame", hover:null};

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({paint:state.paint.id, build:Object.fromEntries(state.build)}));
  } catch {
    $("#announcement").textContent = "当前浏览器无法在页面关闭后保留配置。";
  }
}

function renderPaint() {
  const {id,name,photo,mask} = state.paint;
  $("#paint-code").textContent = id;
  palette.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.paint === id));
  });
  alignHotspots(sideView.querySelector("svg"), id);
  Object.assign(sidePhoto.style, {...photoLayout(id), maskImage:mask ? `url("${mask}")` : ""});
  if (mask && sideMask.getAttribute("src") !== mask) sideMask.src = mask;
  if (sidePhoto.getAttribute("src") !== photo) sidePhoto.src = photo;
  sidePhoto.alt = `Colnago Y1Rs ${name} · 侧视`;
  syncMedia();
}

function swatch(paint) {
  return `<button type="button" class="swatch" data-paint="${paint.id}" aria-label="${paint.name} ${paint.id}" title="${paint.name} · ${paint.id}" aria-pressed="false">
    ${paint.swatch ? `<img src="${paint.swatch}" alt="" width="28" height="28" draggable="false">` : '<span class="swatch-yellow" aria-hidden="true"></span>'}
  </button>`;
}

function syncMedia() {
  const media = state.paint.mask ? [sidePhoto,sideMask] : [sidePhoto];
  const ready = media.every(image => image.complete && image.naturalWidth > 0 && image.currentSrc === image.src);
  sideView.classList.toggle("photo-ready", ready);
  mediaStatus.hidden = ready;
  if (!ready) mediaStatus.textContent = media.some(image => image.complete && !image.naturalWidth)
    ? "暂时无法加载车辆照片" : "正在加载车辆照片…";
}

function viewPart(id) {
  const part = parts[id];
  const value = state.draft.get(id) ?? defaultOption(part);
  const selection = part.options?.find((item) => item.id === value);
  const kitId = state.build.get("groupset") ?? "standard";
  const kit = kits[kitId];
  const quote = part.parent ? null : purchaseQuote(id,value,state.paint.id);
  const specs = id === "crank"
    ? [["齿数",kit.teeth],["曲柄长度","165 mm"],["轴心技术","HOLLOWTECH II"]]
    : selection?.specs.length ? selection.specs : part.specs;
  const coveredPrice = id === "power" && kitId !== "power" ? "仅功率版包含"
    : id === "seatpost" && value === "0" ? "替换规格 · 差价待询"
    : part.parent === "frame" ? "随车架组提供" : "随套件提供";
  return {
    ...part, value, selection, specs, quote,
    name: id === "crank" ? `Shimano ${kit.crank}` : part.name,
    price: quote ? formatQuote(quote) : coveredPrice,
    priceNote: id === "frame" ? quote.note : part.priceNote,
    priceSource: id === "frame" ? quote.source : id === "groupset" ? kits[value].source : part.priceSource,
  };
}

const link = (url, label) => `<a href="${url}" target="_blank" rel="noopener">${label}</a>`;
const status = (value) => { $("#announcement").textContent = value; };

function renderDetails() {
  const part = viewPart(state.part);
  const alreadySelected = state.build.get(state.part) === part.value;
  const action = alreadySelected ? "✓ 已加入预算" : state.build.has(state.part) ? "更新此项" : "加入预算";
  details.innerHTML = `
    <div class="panel-head"><span>零件详情</span><span class="mono">${part.section}</span></div>
    <div class="panel-content">
      <p class="part-label">${part.label}</p>
      <h2 id="part-title" tabindex="-1">${part.name}</h2>
      <p class="description">${part.description}</p>
      ${part.optionLabel ? `<div class="option-field">
        <label for="option">${part.optionLabel}</label>
        <select id="option">${part.options.map((item) => `<option value="${item.id}"${item.id === part.value ? " selected" : ""}>${item.label}</option>`).join("")}</select>
      </div>` : ""}
      <dl class="specs">${part.specs.map(([key,value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join("")}</dl>
      <div class="price"><strong>${part.price}</strong>${part.priceNote ? `<small>${part.priceNote}</small>` : ""}
        ${part.quote ? `<small>按 ${link(fxBasis.source,fxBasis.date + " 汇率")}折合人民币，未计跨境税运</small>` : ""}
      </div>
      ${part.warning ? `<p class="fit-note">${part.warning}</p>` : ""}
      ${part.parent
        ? `<button class="choose secondary" type="button" data-jump="${part.parent}">查看${parts[part.parent].label}</button>`
        : `<button class="choose" type="button" data-add aria-disabled="${alreadySelected}">${action}</button>`}
      <p class="panel-source">${link(part.source,"规格来源")}${part.priceSource ? link(part.priceSource,"价格来源") : ""}</p>
    </div>`;
}

function renderIndex() {
  index.querySelectorAll("button").forEach((button) => {
    const id = button.dataset.part;
    button.setAttribute("aria-pressed", String(state.part === id));
    const parent = parts[id].parent;
    const covered = parent && state.build.has(parent) &&
      (id !== "power" || state.build.get("groupset") === "power") &&
      (id !== "seatpost" || state.build.get("seatpost") !== "0");
    const mark = button.querySelector(".saved-mark");
    mark.hidden = !(covered || (!parent && state.build.has(id)));
    mark.setAttribute("aria-label",covered ? "已随套件计入" : "已加入预算");
  });
}

function renderBudget() {
  const budget = summarizeBuild(state.build,state.paint.id);
  const {selected,missing,total,rows} = budget;
  const subtotal = selected.length ? `约 ${yuan(total)}` : "还未计价";
  $("#build-count").textContent = selected.length;
  $("#budget-amount").textContent = subtotal;
  $("#budget-counts").textContent = `已选 ${selected.length} 项采购 · ${missing.length ? `还差 ${missing.length} 项主要配件` : "主要配件已选齐"}`;
  $("#shopping-total").textContent = subtotal;
  $("#shopping-count").textContent = missing.length ? `已选 ${selected.length} / ${rows.length} 项 · 未选项不计入小计` : `已选齐 ${rows.length} 项主要配件`;
  fillDefaults.disabled = missing.length === 0;
  fillDefaults.title = missing.length ? "用默认配置补齐未选项，保留已选配置" : "主要配件已选齐";
  renderShopping(budget);
}

function drawHighlight() {
  for (const zone of zones) {
    const active = zone.id === state.hover;
    for (const kind of ["highlight","marker"]) {
      const node = diagram.querySelector(`[data-${kind}="${zone.id}"]`);
      node.classList.toggle("active", active);
    }
  }
}

function openPart(id, reveal = false, keepHover = false) {
  if (!keepHover) hidePreview();
  state.part = id;
  renderDetails();
  renderIndex();
  status(`当前部件：${parts[id].label}`);
  const top = details.getBoundingClientRect().top;
  if (reveal && (top < 0 || top > window.innerHeight * .8)) {
    details.scrollIntoView({block:"start"});
  }
}

function showPreview(zone) {
  if (state.hover === zone.id && !preview.hidden) return;
  const part = viewPart(zone.part);
  const hint = part.selection?.label ?? (zone.id === "frontder" && state.paint.id === "YUBC"
    ? "安装位置 · 图中为单盘" : part.specs[0][1]);
  const title = zone.id === "front-wheel" ? "前轮 · 轮组" : zone.id === "rear-wheel" ? "后轮 · 轮组" : part.label;
  state.hover = zone.id;
  drawHighlight();
  preview.innerHTML = `<span class="preview-category">${title}</span><strong class="preview-name">${part.name}</strong><span class="preview-meta">${hint} · ${part.price}</span>`;
  preview.hidden = false;
  const anchor = diagram.querySelector(`[data-marker="${zone.id}"] .marker-outer`).getBoundingClientRect();
  const outline = diagram.querySelector(`[data-highlight="${zone.id}"]`).getBoundingClientRect();
  const bounds = diagram.getBoundingClientRect();
  const {offsetWidth:width,offsetHeight:height} = preview;
  const gap = 12;
  const right = outline.right - bounds.left + gap;
  const left = outline.left - bounds.left - width - gap;
  const above = outline.top - bounds.top - height - gap;
  const below = outline.bottom - bounds.top + gap;
  const side = right + width <= bounds.width ? right : left >= 0 ? left : null;
  const x = side ?? anchor.left + (anchor.width-width) / 2 - bounds.left;
  const y = side !== null
    ? anchor.top + (anchor.height-height) / 2 - bounds.top
    : above >= 0 ? above : below;
  const clamp = (value,limit) => Math.max(0,Math.min(value,limit));
  preview.style.left = `${clamp(x,bounds.width-width)}px`;
  preview.style.top = `${clamp(y,bounds.height-height)}px`;
}

function hidePreview() {
  if (!state.hover) return;
  state.hover = null;
  preview.hidden = true;
  drawHighlight();
}

function purchaseDetails(key,value) {
  const part = parts[key];
  const variant = part.options?.find((item) => item.id === value)?.label;
  const cockpit = state.build.get("cockpit") ?? defaultOption(parts.cockpit);
  const included = key === "frame"
    ? `含前叉、CC.Y1 ${parts.cockpit.options.find(o=>o.id === cockpit).label}、标准座管、桶轴`
    : key === "groupset" ? `含手变、前后拨、${value === "power" ? "功率牙盘" : "普通牙盘"}、飞轮、链条、夹器、碟片、电池线材` : "";
  return {part,variant,included};
}

function budgetNotes({notes,legacy}) {
  const priorCrank = parts.crank.options.find(o=>o.id === state.build.get("crank"));
  const conflictingCrank = state.build.has("groupset") && priorCrank && priorCrank.label !== kits[state.build.get("groupset")].teeth;
  return `
    ${legacy.length ? `<p class="budget-note">已保留上版选过的子件；请选对应的${legacy.map(key=>parts[key].label).join("和")}，子件不会单独计价。</p>` : ""}
    ${conflictingCrank ? `<p class="budget-note">此前保存的牙盘偏好为 ${priorCrank.label}；本次预算以当前套件的 ${kits[state.build.get("groupset")].teeth} 为准。</p>` : ""}
    ${notes.length ? `<div class="budget-warnings"><h3>下单前确认</h3><ul>${notes.map(note=>`<li>${note}</li>`).join("")}</ul></div>` : ""}
    <p class="budget-note">本页先核算主要配件。未计外胎、脚踏、把带、转接件、工时和跨境税运。按 ${link(fxBasis.source,fxBasis.date + " 汇率")}折算。</p>`;
}

function renderBuild() {
  const {name,id} = state.paint;
  const budget = summarizeBuild(state.build,id);
  const {selected,missing,total} = budget;
  const lines = selected.map(({id:key,value,amount}) => {
    const {part,variant,included} = purchaseDetails(key,value);
    return `<li><div><button type="button" class="budget-line-title" data-jump="${key}" title="修改${part.label}">${part.label} · ${part.name}</button>${variant ? `<small>${variant}</small>` : ""}${included ? `<small>${included}</small>` : ""}</div>
      <div class="budget-row-action"><b>${yuan(amount)}</b><button type="button" class="remove" data-remove="${key}" aria-label="移除${part.label}">移除</button></div></li>`;
  });
  const pending = missing.map(key=>`<button class="pending-button" type="button" data-jump="${key}">选${parts[key].label}</button>`).join("");
  buildBody.innerHTML = `
    <div class="dialog-total"><div><p class="build-paint">已选小计 · 人民币</p><strong>${selected.length ? `约 ${yuan(total)}` : "还未计价"}</strong></div><span>${name} <span class="mono">${id}</span></span></div>
    ${lines.length ? `<ul class="build-list">${lines.join("")}</ul>` : `<p class="build-empty">先把要买的车架组、变速套件或其他主要配件加入预算。</p>`}
    ${missing.length ? `<div class="pending"><h3>还没选 · 未计入</h3><div>${pending}</div></div>` : ""}
    ${budgetNotes(budget)}`;
}

function renderShopping(budget) {
  const units = {frame:"1 组",groupset:"1 套",bb:"1 只",wheels:"前后 1 对",saddle:"1 只"};
  const lines = budget.rows.map(({id,value,amount,added})=>{
    const {part,variant,included} = purchaseDetails(id,value);
    const spec = [id === "frame" ? state.paint.name : "",variant].filter(Boolean).join(" · ");
    return `<li class="shopping-row" data-purchase="${id}">
      <div class="shopping-item"><span class="shopping-label">${part.label}</span><strong>${part.name}</strong>
        ${spec ? `<small>${added ? "" : "参考 · "}${spec}</small>` : ""}
        ${included ? `<small>${included}</small>` : ""}</div>
      <span class="shopping-qty">${units[id]}</span>
      <strong class="shopping-price">${yuan(amount)}</strong>
      <div class="shopping-actions"><span class="shopping-status${added ? " is-added" : ""}">${added ? "已计入" : "待选 · 未计入"}</span>
        <button class="pending-button" data-jump="${id}" type="button" aria-label="${added ? "查看" : "选择"}${part.label}">${added ? "查看" : "选择"}</button>
        ${added ? `<button class="remove" type="button" data-remove="${id}" aria-label="移除${part.label}">移除</button>` : ""}</div>
    </li>`;
  });
  shoppingBody.innerHTML = `<div class="shopping-columns" aria-hidden="true"><span>采购项 / 规格</span><span>数量</span><span>参考价</span><span>状态 / 操作</span></div>
    <ul class="shopping-list">${lines.join("")}</ul>${budgetNotes(budget)}`;
}

sideView.insertAdjacentHTML("beforeend", drawHotspots(parts));
sidePhoto.addEventListener("load", syncMedia);
sidePhoto.addEventListener("error", syncMedia);
sideMask.addEventListener("load", syncMedia);
sideMask.addEventListener("error", syncMedia);
palette.innerHTML = paints.map(swatch).join("");
index.innerHTML = categories.map(({label,items}) => `<div class="part-group">
  <h3>${label}</h3><div class="part-group-items">
  ${items.map(key=>`<button type="button" class="index-button" data-part="${key}" aria-controls="details" aria-pressed="false">
    ${parts[key].label} <span class="saved-mark" hidden>✓</span>
  </button>`).join("")}
  </div>
</div>`).join("");
renderPaint();
renderDetails();
renderIndex();
renderBudget();

palette.addEventListener("click", (event) => {
  const id = event.target.closest("[data-paint]")?.dataset.paint;
  if (!id || id === state.paint.id) return;
  state.paint = paints.find((item) => item.id === id);
  hidePreview();
  renderPaint();
  renderDetails();
  renderBudget();
  persist();
  status(`当前涂装：${state.paint.name}`);
});

for (const zone of zones) {
  const element = diagram.querySelector(`[data-zone="${zone.id}"]`);
  element.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") showPreview(zone);
  });
  element.addEventListener("pointerleave", hidePreview);
  element.addEventListener("click", (event) => openPart(zone.part,true,event.pointerType === "mouse"));
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPart(zone.part,true);
    }
    if (event.key === "Escape") hidePreview();
  });
}
window.addEventListener("resize", hidePreview);

index.addEventListener("click", (event) => {
  const id = event.target.closest("[data-part]")?.dataset.part;
  if (id) openPart(id,true);
});

fillDefaults.addEventListener("click", () => {
  const items = summarizeBuild(state.build,state.paint.id).rows.filter(row => !row.added);
  for (const {id,value} of items) {
    state.build.set(id,value);
    state.draft.set(id,value);
  }
  persist();
  renderDetails();
  renderIndex();
  renderBudget();
  status(`已用默认配置补齐 ${items.length} 项采购`);
});

details.addEventListener("change", (event) => {
  if (event.target.id !== "option") return;
  state.draft.set(state.part, event.target.value);
  if (parts[state.part].parent) {
    state.build.set(state.part,event.target.value);
    persist();
    renderIndex();
    renderBudget();
  }
  renderDetails();
  $("#option").focus({preventScroll:true});
});
details.addEventListener("click", (event) => {
  const target = event.target.closest("[data-jump]")?.dataset.jump;
  if (target) { openPart(target); $("#part-title").focus(); return; }
  const button = event.target.closest("[data-add]");
  if (!button || button.getAttribute("aria-disabled") === "true") return;
  const part = viewPart(state.part);
  state.build.set(state.part, part.value);
  button.setAttribute("aria-disabled","true");
  button.textContent = "✓ 已加入预算";
  persist();
  renderIndex();
  renderBudget();
  status(`${part.label}已加入预算`);
});

$("#build-trigger").addEventListener("click",() => {renderBuild(); dialog.showModal();});

function changePurchase(event) {
  const host = event.currentTarget;
  const inDialog = host === buildBody;
  const target = event.target.closest("[data-jump]")?.dataset.jump;
  if (target) {
    if (inDialog) dialog.close();
    openPart(target,true);
    $("#part-title").focus({preventScroll:true});
    return;
  }
  const id = event.target.closest("[data-remove]")?.dataset.remove;
  if (!id) return;
  state.build.delete(id);
  persist();
  if (inDialog) renderBuild();
  renderDetails();
  renderIndex();
  renderBudget();
  host.querySelector(`[data-jump="${id}"]`).focus();
  status(`${parts[id].label}已移除`);
}
buildBody.addEventListener("click",changePurchase);
shoppingBody.addEventListener("click",changePurchase);
