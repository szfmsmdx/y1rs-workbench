// All contours use the native coordinates of their source photograph.
const ellipse = (x,y,rx,ry) => `M${x-rx} ${y}a${rx} ${ry} 0 1 1 ${2*rx} 0 ${rx} ${ry} 0 1 1-${2*rx} 0Z`;
const zone = (part,id,path,x,y,fill = true,detail = "") => ({part,id,path,x,y,fill,detail});
// Width of the source followed by the crop's x, y and width. The crop height uses the stage aspect ratio.
const nativePhoto = {YSYL:[1920,-48,320,2016],YUBC:[1536,244,168,1052]};
function photoCrop(id) {
  const [sourceWidth,x,y,width] = nativePhoto[id] ?? [1840,0,100,1840];
  return {sourceWidth,x,y,width,height:width*1150/1840,scale:width/1840};
}
function photoLayout(id) {
  const {sourceWidth,x,y,width,height} = photoCrop(id);
  return {width:`${100*sourceWidth/width}%`,left:`${-100*x/width}%`,top:`${-100*y/height}%`};
}
const zones = [
  zone("wheels","rear-wheel",null,201,1107,false),
  zone("wheels","front-wheel",null,1651,1092,false),
  zone("frame","frame","M376 842 Q382 827 409 800 L678 493 Q703 463 697 435 L668 366 L711 366 Q721 387 756 381 L1176 339 Q1210 349 1247 358 L1285 478 L1250 488 L1245 511 Q1208 547 1181 570 L916 877 L892 850 Q865 817 820 817 L791 813 L764 758 Q747 701 729 657 L689 586 Q676 566 654 567 L419 824 Q412 837 422 842 L723 877 L711 922 L400 879 Q375 875 372 865 Q371 854 376 842Z M705 528 Q728 564 744 601 L806 769 Q814 800 828 810 L884 835 L1177 485 Q1207 455 1190 423 L1178 400 Q1159 382 1101 380 L1031 376 Q1022 374 1008 377 L817 394 Q792 395 762 428 L713 491 Q690 513 705 528Z",1077,673),
  zone("seatpost","seatpost","M595 218 Q627 226 649 220 Q662 227 663 250 Q662 272 679 307 L711 366 L668 366 L613 254Z",653,295),
  zone("rotors","rotors",ellipse(1425,839,78,78),1488,881,false,"detail"),
  zone("fork","fork","M1242 488 Q1247 480 1270 476 L1290 470 Q1290 464 1287 456 L1314 453 Q1321 484 1338 528 C1369 608 1408 701 1446 783 L1477 850 Q1485 865 1465 865 L1429 865 Q1416 867 1409 852 C1385 799 1359 744 1335 682 L1285 567 Q1265 522 1242 488Z",1358,640),
  zone("crank","crank","M911 866 Q930 892 929 914 L1005 936 Q1019 939 1020 952 Q1025 974 1008 976 L912 960 Q905 989 881 1009 Q847 1036 803 1028 Q757 1020 735 981 Q710 944 724 898 Q738 849 781 833 Q857 806 911 866Z",914,950),
  zone("chain","chain","M471 827 Q600 823 747 816 M751 815 Q803 801 850 814 C898 826 927 874 934 909 M928 978 C918 1007 882 1036 846 1039 Q807 1045 698 1043 L429 1040",579,1041,false),
  zone("saddle","saddle","M490 163 Q498 157 532 162 Q612 173 664 170 Q722 166 754 175 Q770 179 773 184 Q775 192 765 195 L708 199 Q699 214 667 220 L612 224 Q570 219 547 207 Q518 190 490 163Z",563,182),
  zone("cockpit","cockpit","M1175 338 Q1225 329 1286 292 Q1312 276 1340 276 Q1358 274 1372 278 Q1442 275 1469 273 Q1482 271 1499 248 Q1510 233 1524 241 Q1544 251 1535 263 Q1524 278 1516 296 Q1519 316 1508 321 L1468 333 Q1447 333 1442 345 C1432 398 1385 433 1335 446 Q1303 452 1254 453 Q1244 453 1247 428 Q1248 417 1258 419 L1308 417 Q1380 410 1401 376 Q1418 354 1409 337 Q1403 324 1384 323 Q1366 321 1350 308 L1338 304 Q1323 303 1306 315 Q1245 350 1207 361Z",1384,302),
  zone("cassette","cassette","M338 838 Q338 813 360 794 Q387 772 424 771 L454 782 Q466 790 457 805 L430 810 L395 832 Q380 844 377 860 L365 871 Q345 861 338 838Z",382,801,true,"detail"),
  zone("frontder","frontder","M745 789 L744 765 Q750 752 773 751 L790 754 L796 786 L784 808 L758 814 L744 805Z",768,776,true,"detail"),
  zone("rearder","rearder","M331 906 Q347 891 381 899 Q412 904 442 919 L448 943 L425 968 L416 994 L423 1018 Q416 1032 396 1036 L389 1023 L399 995 L411 958 L384 952 Q345 950 330 932Z",363,921,true,"detail"),
  zone("bb","bb",ellipse(804,920,22,21),804,920,true,"position"),
  zone("power","power","M849 913 Q868 917 887 924 L884 952 L845 944Z",866,932,true,"position"),
  zone("shifters","shifters","M1429 277 L1483 271 L1500 243 Q1510 232 1526 242 Q1542 252 1536 263 L1519 294 L1516 328 L1513 361 L1502 405 L1512 420 Q1507 427 1497 414 L1483 387 Q1478 363 1487 348 L1503 332 L1506 309 L1494 314 L1445 331 L1433 320Z",1512,279,true,"detail"),
  zone("calipers","calipers","M1334 789 Q1329 777 1341 767 L1356 768 L1367 753 L1379 765 L1392 788 L1373 805 L1356 814 L1343 806Z",1360,789,true,"detail"),
];

// Measured at the outer tyre edge using unobscured arcs on both sides of each wheel.
const wheels = {
  YSWC:[[406.9,843.6,358.4,354.2],[1428.6,842.4,361.9,357.1]],
  YSBC:[[406,844.3,354.4,351.6],[1429.6,845,356.5,353.3]],
  SDM5:[[406,844.7,357,355.8],[1430.1,843.6,360.1,358.2]],
  YSWW:[[405.5,846.3,357.7,356.6],[1430.2,846.7,358.6,355.9]],
  YSBO:[[405.9,841.2,357.6,354.6],[1433.5,841.1,359.3,355]],
  YSYL:[[398,1138,391,393],[1528,1149,385,397]],
  YUBC:[[478,605,204,200],[1059,602,206,202]],
};

const saddleBlack = "M496 179 Q497 174 507 175 Q578 187 633 181 Q725 178 743 187 Q751 191 748 201 Q746 204 735 204 L693 205 Q685 218 668 222 L594 227 Q560 223 538 214 Q513 210 496 179Z";
const chainBlack = "M472 813 L747 820 M751 819 Q805 802 853 817 C890 827 922 856 929 903 M924 969 C907 998 879 1024 834 1029 L552 1049 L449 1054";
const edits = {
  YSBC:{
    saddle:{path:saddleBlack,y:197},
    chain:{path:chainBlack,y:1048},
    cockpit:{dx:-8,dy:1},
    fork:{dx:0,dy:-2},
  },
  SDM5:{
    saddle:{path:"M491 167 Q493 161 507 164 Q588 177 637 176 Q716 173 746 182 Q764 187 769 194 L761 200 L705 202 Q697 212 682 218 L612 222 Q576 222 549 212 Q519 193 491 167Z",y:183},
    chain:{path:"M471 828 L747 814 M751 813 Q802 799 853 812 C900 824 936 869 939 909 M933 977 C910 1020 872 1040 829 1041 Q682 1048 403 1048",y:1047},
    cockpit:{dx:9,dy:-4},
  },
  YSWW:{
    chain:{path:"M476 827 Q588 829 748 816 M751 815 Q799 801 849 814 C894 825 927 870 935 906 M930 972 Q904 1027 853 1034 Q763 1041 657 1037 L420 1028",y:1034},
    cockpit:{dx:8,dy:-4},
  },
  YSBO:{
    saddle:{path:"M475 136 Q474 131 489 132 Q557 143 618 145 Q685 145 724 154 Q742 158 741 167 L732 177 Q721 180 700 171 L680 168 Q672 180 651 185 L600 192 Q573 187 550 193 Q520 184 475 136Z",x:547,y:158},
    seatpost:{path:"M579 185 Q612 190 640 190 Q648 195 656 222 L714 363 L678 366 Q641 282 597 225Z",y:287},
    chain:{path:"M476 825 L746 816 M749 814 Q797 801 851 813 C901 826 937 869 937 906 M929 968 C910 1011 881 1034 831 1034 L413 1032",y:1034},
    fork:{dx:8,dy:-3},
    cockpit:{dx:7,dy:-4},
  },
  YSYL:{
    "rear-wheel":{x:149,y:1420},
    "front-wheel":{x:1794,y:1415},
    saddle:{x:589,y:420,path:"M502 374 Q529 379 575 394 Q605 405 658 404 Q720 401 763 411 Q792 417 801 430 Q804 436 791 437 L740 437 Q729 454 704 456 L611 457 L593 461 L576 442 L565 439 Q552 442 502 374Z"},
    seatpost:{x:684,y:543,path:"M620 451 L682 457 Q692 466 690 482 Q699 527 729 592 L745 612 L675 612 L666 595 L680 594Z"},
    frame:{x:1094,y:976,path:"M359 1148 Q361 1125 387 1099 L707 731 Q730 707 720 685 L690 614 L746 614 Q750 636 790 632 L1246 594 L1317 623 L1365 744 L1321 758 L1317 783 Q1302 800 1256 824 L973 1182 Q961 1151 929 1129 L842 1100 Q803 986 755 883 Q737 831 695 832 Q677 834 658 857 L416 1119 Q395 1137 427 1146 L726 1181 L718 1228 L394 1173 Q364 1167 359 1148Z M722 791 Q753 845 780 905 Q811 969 845 1094 L922 1126 L1247 750 Q1279 732 1274 701 Q1266 669 1251 657 Q1217 645 1123 629 L868 649 Q823 650 795 683 L734 758 Q716 775 722 791Z"},
    fork:{x:1445,y:940,path:"M1318 781 L1320 755 L1364 743 L1352 704 L1375 706 Q1396 730 1408 770 L1466 928 L1572 1163 Q1577 1173 1563 1171 L1526 1170 Q1507 1170 1502 1155 L1400 954 Q1363 862 1318 781Z"},
    cockpit:{x:1456,y:547,path:"M1246 595 Q1292 572 1360 541 Q1382 526 1411 525 L1464 518 L1532 527 L1554 563 L1534 577 Q1525 587 1521 608 Q1486 692 1401 709 L1364 710 L1361 678 Q1464 666 1485 603 Q1493 579 1484 566 Q1474 547 1449 550 L1440 588 Q1403 594 1343 581 Q1343 600 1352 608 L1280 627Z"},
    shifters:{x:1587,y:525,path:"M1505 520 Q1553 520 1566 512 L1584 488 Q1595 477 1611 484 L1631 493 L1638 503 L1622 528 L1613 599 L1594 657 L1600 676 L1595 679 L1582 658 L1573 679 L1565 674 L1547 633 Q1547 606 1567 590 L1577 567 L1529 578Z"},
    rotors:{x:1585,y:1114,path:ellipse(1514,1148,91,88)},
    calipers:{x:1458,y:1090,path:"M1416 1099 Q1420 1072 1444 1057 L1464 1045 L1490 1076 L1481 1107 L1451 1117 L1432 1110Z"},
    crank:{x:907,y:1248,path:"M969 1229 L1021 1241 Q1036 1239 1045 1256 L1046 1281 Q1037 1294 1016 1292 L965 1282 Q945 1342 882 1357 Q796 1380 743 1328 Q704 1288 710 1231 Q715 1146 779 1115 Q838 1083 894 1112 Q962 1140 969 1229Z"},
    chain:{x:623,y:1350,path:"M412 1118 L798 1103 Q864 1092 912 1121 Q965 1152 973 1217 M968 1286 Q947 1355 867 1359 L413 1344"},
    cassette:{x:349,y:1098,path:"M315 1130 Q315 1104 342 1080 Q368 1057 407 1055 Q442 1059 476 1070 L499 1098 L498 1122 L448 1123 L424 1116 L394 1120 L374 1137 L354 1162 Q332 1166 315 1130Z"},
    frontder:{x:789,y:1065,path:"M763 1041 Q778 1027 808 1028 L821 1063 L820 1091 L797 1107 L776 1097 L765 1077Z"},
    rearder:{x:342,y:1213,path:"M304 1200 L320 1163 L345 1151 L384 1165 L429 1181 Q453 1206 426 1230 L412 1261 L410 1320 L418 1338 Q397 1352 359 1341 Q358 1325 378 1294 L387 1257 L407 1228 L347 1237 L313 1231Z"},
    bb:{x:837,y:1234,path:ellipse(837,1234,24,24)},
    power:{x:883,y:1231,path:"M858 1217 L910 1225 L907 1256 L855 1247Z"},
  },
  YUBC:{
    "rear-wheel":{x:349,y:754},
    "front-wheel":{x:1200,y:735},
    saddle:{x:560,y:218,path:"M515 202 Q527 199 555 207 L586 214 Q619 210 651 215 Q669 219 674 226 L669 230 L642 228 Q625 239 606 240 L564 243 Q552 237 547 227 Q526 219 515 202Z"},
    seatpost:{x:620,y:285,path:"M570 242 Q590 244 605 239 Q611 244 615 261 L648 324 L656 339 L632 338 L604 285 Q592 260 570 242Z"},
    frame:{x:847,y:475,path:"M458 608 Q459 601 469 590 L607 427 Q628 402 640 386 Q646 378 643 364 L629 333 L651 332 Q653 343 670 343 L915 316 L949 331 L973 391 L955 396 L952 411 L771 623 L754 608 L712 584 L682 523 Q664 480 646 455 L619 447 Q611 445 604 452 L476 590 Q466 603 477 604 L656 627 L652 650 L470 627 Q455 623 458 608Z M624 432 L645 438 Q663 455 679 493 L714 579 L746 593 L922 390 Q937 374 921 350 Q917 345 908 344 L864 336 L706 351 Q686 351 671 367 L627 423Z"},
    fork:{x:1021,y:502,path:"M951 415 L954 396 L974 392 L968 371 L993 372 L1004 407 L1049 504 L1089 608 Q1072 617 1049 612 L1040 605 L989 502 Q969 454 951 415Z"},
    cockpit:{x:1029,y:285,path:"M915 317 Q942 309 974 290 Q992 278 1018 274 Q1034 270 1052 275 L1077 283 Q1080 298 1065 322 Q1037 365 975 374 L963 373 L960 355 Q1004 350 1028 332 Q1051 311 1047 299 Q1040 290 1024 288 L1006 303 L994 303 L994 292 L942 332Z"},
    shifters:{x:1105,y:269,path:"M1044 274 Q1060 274 1080 265 Q1090 258 1096 248 Q1103 242 1113 251 L1121 260 Q1126 267 1120 275 L1122 302 L1118 322 L1124 343 L1122 349 Q1115 346 1110 333 L1104 310 L1102 301 L1096 321 L1096 350 L1098 359 Q1091 358 1088 343 L1089 322 L1090 286 L1067 292Z"},
    rotors:{x:1093,y:624,path:ellipse(1055,604,47,45)},
    calipers:{x:1017,y:578,path:"M1001 587 L1002 578 L1012 564 L1024 559 L1035 570 L1033 584 L1020 595 L1009 597Z"},
    crank:{x:754,y:660,path:"M770 645 L814 656 Q825 658 824 669 Q824 680 813 680 L769 674 Q757 704 730 711 Q702 714 679 700 Q653 685 651 653 Q650 620 676 601 Q703 580 733 592 Q763 603 770 645Z"},
    chain:{x:564,y:709,path:"M502 600 L697 588 Q733 584 754 606 Q766 620 772 647 M769 673 Q752 710 718 711 L448 707"},
    cassette:{x:446,y:597,path:"M433 618 L430 599 Q433 581 455 570 L480 566 L503 573 Q516 579 525 594 L522 611 L501 609 L478 594 L462 602 L453 624Z"},
    frontder:{x:686,y:552,path:ellipse(687,554,13,15),detail:"position"},
    rearder:{x:458,y:650,path:"M420 633 L440 626 L454 620 L479 629 L496 643 L490 668 L472 697 L453 709 Q432 704 433 686 Q437 673 448 666 L428 665 L422 655Z"},
    bb:{x:710,y:650,path:ellipse(710,650,15,15)},
    power:{x:746,y:653,path:"M724 643 L773 652 L770 669 L721 661Z"},
  },
};

function contour(zone,paint) {
  const shape = {...zone,...edits[paint]?.[zone.id]};
  if (zone.part === "wheels") {
    const [cx,cy,rx,ry] = wheels[paint][zone.id === "rear-wheel" ? 0 : 1];
    const {scale} = photoCrop(paint);
    return {
      ...shape,
      path:ellipse(cx,cy,rx-2*scale,ry-2*scale),
      hit:ellipse(cx,cy,rx-22*scale,ry-22*scale),
    };
  }
  return {...shape,hit:shape.path};
}

function drawHotspots(parts) {
  const labels = {"front-wheel":"前轮 · 轮组","rear-wheel":"后轮 · 轮组","bb":"五通 / 中轴位置","power":"功率计安装位置"};
  return `<svg class="bike-hotspots" viewBox="0 100 1840 1150" role="group" aria-label="Colnago Y1Rs 侧视原图上的部件">
    ${zones.map(({id,detail})=>`<path class="part-highlight${detail === "position" ? " position-highlight" : ""}" data-highlight="${id}"/>`).join("")}
    ${zones.map(({id,detail})=>`<g class="part-marker${detail ? " detail-marker" : ""}" data-marker="${id}"><circle class="marker-outer" r="14"/><circle class="marker-inner" r="5"/></g>`).join("")}
    ${zones.map(({part,id,fill})=>`<g data-zone="${id}" role="button" tabindex="0" aria-label="${labels[id] || parts[part].label}" aria-controls="details"><path class="part-hit${fill ? " is-fill": ""}" fill-rule="evenodd"/><circle class="part-hit is-fill" r="22"/><circle class="zone-focus" r="24" aria-hidden="true"/></g>`).join("")}
  </svg>`;
}

function alignHotspots(svg,paint) {
  const {x:left,y:top,width,height,scale} = photoCrop(paint);
  svg.setAttribute("viewBox",`${left} ${top} ${width} ${height}`);
  svg.style.setProperty("--diagram-scale",scale);
  for (const zone of zones) {
    const {id,path,hit,x,y,detail,dx=0,dy=0} = contour(zone,paint);
    const outline = svg.querySelector(`[data-highlight="${id}"]`);
    const hitPath = svg.querySelector(`[data-zone="${id}"] path`);
    outline.classList.toggle("position-highlight",detail === "position");
    outline.setAttribute("d",path);
    hitPath.setAttribute("d",hit);
    for (const node of [outline,hitPath]) {
      node.setAttribute("transform",`translate(${dx},${dy})`);
    }
    const markers = svg.querySelectorAll(`[data-marker="${id}"] circle, [data-zone="${id}"] circle`);
    for (const node of markers) {
      node.setAttribute("cx",x+dx);
      node.setAttribute("cy",y+dy);
    }
  }
}

export { alignHotspots, drawHotspots, photoLayout, zones };
