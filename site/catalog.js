const manual = "https://a.storyblok.com/f/263970/x/6a6351c8bd/y1rs_mounting-support-manual_en-v5.pdf";
const kitRetail = "https://shifta.jp/colnago/product/y1rs/";
const cockpitSpec = "https://a.storyblok.com/f/263970/x/d1b052dc76/colnago_ccy1_tech.pdf";
const shimano = "https://productinfo.shimano.com/pdfs/product/archive/2024-2025_Line-up_chart_v028_en.pdf";
const standardKit = "https://r2-bike.com/SHIMANO-Dura-Ace-Di2-R9270-Complete-Group-2x12-Crank-Length-165-mm-52-36T-SPECIAL-OFFER";
const powerKit = "https://r2-bike.com/SHIMANO-Dura-Ace-Di2-R9270-Powermeter-Complete-Group-2x12-Crank-Lenght-165-mm-50-34T-SPECIAL-OFFER";
const fxBasis = {
  date: "2026-11-23",
  source: "https://www.chinamoney.com.cn/chinese/bkccpr/index.html?tab=2",
  // Chinese Foreign Exchange Trade System: convert the 100 JPY quote to 1 JPY.
  cnyPerUnit: {USD: 6.7120, EUR: 7.3496, JPY: 4.2152 / 100},
};
const number = new Intl.NumberFormat("zh-CN");
const yuan = (amount) => `¥${number.format(amount)}`;
const toCny = ({currency,amount}) => Math.round(amount * fxBasis.cnyPerUnit[currency] / 10) * 10;
const formatQuote = (quote) => `约 ${yuan(toCny(quote))}`;

const japanPrice = (amount,source = kitRetail) => ({
  currency:"JPY",amount,source,note:"日本车架组含税参考价",
});
function paint(id,name,frameQuote = japanPrice(1243000), {hasSwatch = true,mask} = {}) {
  const code = id.toLowerCase();
  return {
    id,name,frameQuote,mask,
    photo:`./media/bike-${code}.jpg`,
    swatch:hasSwatch ? `./media/swatch-${code}.png` : null,
  };
}
const paints = [
  paint("YSWC","白彩虹",japanPrice(1353000)),
  paint("YSBC","黑彩虹",japanPrice(1353000)),
  paint("SDM5","UAE 车队版"),
  paint("YSWW","白蓝"),
  paint("YSBO","幻彩黑"),
  paint("YSYL","2025 环法黄",{
    currency:"EUR",amount:6795,note:"2025 环法黄车架组经销商参考价",
    source:"https://www.bikesportadventure.com/gb/road/65950-40601-colnago-y1rs-disc-frame-kit-tour-de-france-ltd-ysyl.html",
  },{hasSwatch:false}),
  paint("YUBC","裸碳",japanPrice(1243000,"https://shifta.jp/colnago/news-archive/detail/934/"),{mask:"./yubc-mask.png"}),
];

const frameComponent = {parent:"frame", source:manual};
const drivetrainComponent = {parent:"groupset", source:shimano};
const option = (id, label, specs = []) => ({id, label, specs});
const euro = (amount) => ({currency:"EUR", amount});
const kits = {
  standard:{label:"标准版 · 52/36T", crank:"FC-R9200", teeth:"52/36T", quote:euro(2395), source:standardKit},
  power:{label:"功率版 · 50/34T", crank:"FC-R9200-P", teeth:"50/34T", quote:euro(2195), source:powerKit},
};
const brakeNote = "前叉为 Post Mount 160 mm，套件前夹器为 Flat Mount；先让车店确认专用转接。套件两张碟片都是 160 mm，后轮要配 160 mm 转接座，或改用 140 mm 碟片。";
const seatSpec = (width, weight) => [["宽度",width],["重量",weight],["碳轨截面","7 × 9 mm"]];
const parts = {
  cockpit: {
    ...frameComponent, label:"车把", section:"COCKPIT", name:"Colnago CC.Y1", description:"原厂车架组已含一体把。可在这里记下想要的把宽和把立长度。",
    options:[95,105,115,125,135].flatMap(length => [377,397].map(width =>
      option(`${length}-${width}`, `${length} × ${width} mm`, [
        ["把立长度", `${length} mm`], ["手变位 / 下把宽", `${width} / ${width === 377 ? 400 : 420} mm`], ["Reach / Drop","79 / 130 mm"],
      ])
    )),
    defaultOption:"115-377", optionLabel:"把立长度 × 手变位宽",
    source:cockpitSpec,
  },
  frame: {
    label:"车架组", section:"FRAME", name:"Colnago Y1Rs", description:"含车架、原厂前叉、CC.Y1 一体把、标准座管和桶轴。",
    specs:[["轮径","700C"],["五通壳","BSA 68 mm（中轴另配）"],["后拨吊耳","UDH"]],
    options:["XS","S","M","L","XL"].map(size=>option(size,size,[])), defaultOption:"M", optionLabel:"车架尺寸",
    source:manual,
  },
  fork: {
    label:"前叉", section:"FORK", name:"Y1Rs 原厂前叉", description:"与 Y1Rs 车架配套，随所选车架涂装变化。",
    specs:[["前桶轴","12 × 100 mm"],["卡钳安装","Post Mount"],["前碟片","160 mm"]],
    ...frameComponent,
  },
  wheels: {
    label:"轮组", section:"WHEELSET", name:"ENVE SES 4.5", description:"选入的是前轮＋后轮一对。搭配本页 Shimano 套件，选 Shimano 公路 HG 塔基。",
    specs:[["前 / 后框高","50 / 56 mm"],["内宽","25 mm · 无钩"],["制动接口","Center Lock"]],
    options:[option("HG","HG",[]),option("XDR","XDR",[]),option("N3W","N3W",[])], optionLabel:"后轮塔基",
    quote:{currency:"USD", amount:1282.50+1567.50}, priceNote:"ENVE 美国站前后轮合计，不含外胎", source:"https://enve.com/products/ses-4-5",
  },
  groupset: {
    label:"变速套件", section:"DI2 GROUPSET", name:"Shimano Dura-Ace Di2", description:"R9270 碟刹套件。含手变、前后拨、牙盘、飞轮、链条、夹器、碟片及 Di2 电池线材；中轴另外选。",
    options:Object.entries(kits).map(([id,kit])=>option(id,kit.label,[["曲柄 / 牙盘",`${kit.crank} · 165 mm`],["飞轮","12 速 · 11–34T"],["随附碟片","RT-CL900 · 160 mm × 2"]])),
    optionLabel:"套件版本", priceNote:"R2BIKE 德国含税报价；两款为不同促销 SKU",
    source:shimano, warning:brakeNote,
  },
  chain: {
    ...drivetrainComponent, label:"链条", section:"CHAIN", name:"Shimano CN-M9100", description:"两款推荐套件都含链条和快扣，新装不用再买。磨损后才作为耗材更换。",
    specs:[["速别","12 速"],["链条技术","HG+"],["快扣","随链条提供"]],
  },
  crank: {
    ...drivetrainComponent, label:"牙盘", section:"CRANKSET", name:"Shimano FC-R9200", description:"牙盘随套件版本变化。功率版用 FC-R9200-P 替代普通牙盘，不叠加。",
    // Keep the previous release's saved gearing preferences readable.
    options:["50/34T","52/36T","54/40T"].map((teeth,i)=>option(String(i),teeth)), defaultOption:"1",
  },
  power: {
    ...drivetrainComponent, label:"功率计", section:"POWER METER", name:"Shimano FC-R9200-P", description:"功率计集成在曲柄里。选功率版套件时包含；侧视照片仅标示所在位置。",
    specs:[["产品形态","双边曲柄功率计"],["推荐套件","165 mm · 50/34T"]],
  },
  bb: {
    label:"五通 / 中轴", section:"BOTTOM BRACKET", name:"Shimano BB-R9100", description:"五通是车架上的壳体，中轴是装进去的部件。照片标的是位置；这两款套件都不含中轴。",
    specs:[["车架壳体","BSA 螺纹 · 68 mm"],["曲柄轴径","24 mm"]],
    quote:euro(34.5), priceNote:"R2BIKE 德国含税参考价",
    priceSource:"https://r2-bike.com/SHIMANO-Dura-Ace-Bottom-Bracket-BB-R9100-BSA", source:manual,
  },
  frontder: {
    ...drivetrainComponent, label:"前拨", section:"FRONT DERAILLEUR", name:"Shimano FD-R9250", description:"负责双盘之间的切换，已计入两款 Di2 套件。",
    specs:[["规格","Di2 · 2×12"],["接口","直装式"]],
  },
  rearder: {
    ...drivetrainComponent, label:"后拨", section:"REAR DERAILLEUR", name:"Shimano RD-R9250", description:"负责飞轮变速，也是这套 Di2 的充电和无线连接入口。",
    specs:[["速别","12 速"],["随套件飞轮","11–34T"]],
  },
  cassette: {
    ...drivetrainComponent, label:"飞轮", section:"CASSETTE", name:"Shimano CS-R9200", description:"随套件提供的 12 速飞轮。本页 ENVE 轮组需选 Shimano 公路 HG 塔基，不选 XDR 或 N3W。",
    specs:[["齿数","11–34T"],["塔基","Shimano 公路 HG"]],
  },
  di2: {
    ...drivetrainComponent, label:"电池与线材", section:"DI2 WIRING", name:"Shimano BT-DN300", description:"内置电池、两根 E-Tube 线和充电线随套件提供，藏在车架内。",
    specs:[["内走线","EW-SD300-I"],["充电线","EW-EC300"]],
  },
  shifters: {
    ...drivetrainComponent, label:"手变", section:"SHIFT LEVERS", name:"Shimano ST-R9270", description:"左右油压刹车手变随套件提供，和 CC.Y1 一体把是两件不同的零件。",
    specs:[["数量","左右各一"],["操作","Di2 变速 · 油压制动"]],
  },
  calipers: {
    ...drivetrainComponent, label:"刹车夹器", section:"BRAKE CALIPERS", name:"Shimano BR-R9270", description:"套件含前后夹器；Y1Rs 的前叉接口不能按普通 Flat Mount 前叉直接处理。",
    specs:[["套件夹器","Flat Mount"],["前叉接口","Post Mount · 160 mm"]], warning:brakeNote,
  },
  rotors: {
    ...drivetrainComponent, label:"碟片", section:"BRAKE ROTORS", name:"Shimano RT-CL900", description:"套件含两张 160 mm 碟片，照片标的是前碟位置。",
    specs:[["数量","160 mm × 2"],["锁定接口","Center Lock"],["Y1Rs 后端","140 mm；160 mm 需要转接座"]], warning:brakeNote,
  },
  seatpost: {
    label:"座管", section:"SEATPOST", name:"Y1Rs 专用座管", description:"与 Y1Rs 的座管夹和车架配套；替代后飘规格需单独确认报价。",
    options:[option("-15","−15 mm",[["后飘","−15 mm"],["规格","车架组标准座管"]]),option("0","0 mm",[["后飘","0 mm"],["规格","替换规格，差价待询"]])], optionLabel:"座管后飘",
    ...frameComponent,
  },
  saddle: {
    label:"坐垫", section:"SADDLE", name:"Fizik Vento Argo R1", description:"Adaptive 3D 打印短鼻坐垫，配碳纤维座轨。",
    options:[option("140","140 mm",seatSpec("140 mm","190 g")),option("150","150 mm",seatSpec("150 mm","196 g"))], optionLabel:"坐垫宽度",
    quote:euro(299), priceNote:"Fizik 欧洲官网参考价", source:"https://www.fizik.com/en-eu/products/saddles-vento-argo-r1-adaptive-black-vargor1aa0",
  },
};

const categories = [
  {label:"车架与前端", items:["frame","fork","cockpit","seatpost"]},
  {label:"传动与功率", items:["groupset","frontder","rearder","crank","power","cassette","chain","bb","di2"]},
  {label:"制动", items:["shifters","calipers","rotors"]},
  {label:"轮组与坐垫", items:["wheels","saddle"]},
];
const purchaseIds = ["frame","groupset","bb","wheels","saddle"];
const defaultOption = (part) => part.defaultOption ?? part.options?.[0].id ?? "";
function purchaseQuote(id,value,paintId) {
  if (id === "frame") return paints.find(paint => paint.id === paintId).frameQuote;
  if (id === "groupset") return kits[value].quote;
  return parts[id].quote;
}
function summarizeBuild(build,paintId) {
  const rows = purchaseIds.map(id=>{
    const value = build.get(id) ?? defaultOption(parts[id]);
    return {id,value,amount:toCny(purchaseQuote(id,value,paintId)),added:build.has(id)};
  });
  const selected = rows.filter(row=>row.added);
  const missing = rows.filter(row=>!row.added).map(row=>row.id);
  const notes = [];
  if (build.has("groupset")) notes.push(brakeNote);
  if (build.has("groupset") && build.has("wheels") && build.get("wheels") !== "HG") {
    notes.push(`后轮当前选了 ${build.get("wheels")} 塔基，与所选 CS-R9200 飞轮不匹配，请改选 Shimano 公路 HG。`);
  }
  if (build.has("frame") && build.get("seatpost") === "0") notes.push("0 mm 座管为替换规格，差价待询，未计入。");
  const legacy = ["frame","groupset"].filter(parent=>!build.has(parent) &&
    Object.keys(parts).some(id=>parts[id].parent === parent && build.has(id)));
  return {rows,selected,missing,notes,legacy,total:selected.reduce((sum,row)=>sum+row.amount,0)};
}

export { categories, defaultOption, formatQuote, fxBasis, kits, paints, parts, purchaseQuote, summarizeBuild, yuan };
