/* Faultless French: the loading screen.
   What the learner sees from the tap on the icon until the first screen is ready. One calm moment: the mark, the name,
   and, only if loading takes long enough to notice, a quiet progress sign that tells the truth.

   API (a global, SPLASH):
     SPLASH.show()                  put it up (it puts itself up as soon as this file runs; calling again is harmless)
     SPLASH.progress(f, label)      f: 0..1 of the work the app can measure, or null when it cannot say how far it is;
                                    label: optional plain words ("Getting ready to hear you · 12 of 45 MB").
                                    The bar never goes back: a lower f than before is ignored.
     SPLASH.done()                  the first screen is drawn underneath: hand over (returns a promise, resolved when gone)
   Nothing here makes a request. Motion is transform and opacity only; prefers-reduced-motion removes all of it. */
(function () {
  'use strict';
  var MARK = "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs>\n  <radialGradient id=\"spg\" cx=\"22%\" cy=\"16%\" r=\"105%\"><stop offset=\"0\" stop-color=\"#1FA457\"/><stop offset=\".55\" stop-color=\"#16934A\"/><stop offset=\"1\" stop-color=\"#0D6A34\"/></radialGradient>\n  <linearGradient id=\"spf\" x1=\"0\" y1=\"0\" x2=\".35\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFFEFB\"/><stop offset=\"1\" stop-color=\"#FBF6EC\"/></linearGradient>\n  <filter id=\"spb\" x=\"-30%\" y=\"-30%\" width=\"160%\" height=\"160%\"><feGaussianBlur stdDeviation=\"2.6\"/></filter></defs><clipPath id=\"spc\"><rect width=\"100\" height=\"100\" rx=\"22.5\"/></clipPath><g clip-path=\"url(#spc)\"><rect width=\"100\" height=\"100\" fill=\"url(#spg)\"/><g transform=\"translate(50 50) scale(1) translate(-50 -50)\"><g transform=\"rotate(-6 50 50)\">\n    <rect x=\"24.8\" y=\"23.8\" width=\"54\" height=\"62\" rx=\"9\" fill=\"#073A1D\" opacity=\".45\" filter=\"url(#spb)\"/>\n    <rect x=\"23\" y=\"21.3\" width=\"54\" height=\"62\" rx=\"9\" fill=\"#C4B79F\"/>\n    <rect x=\"23\" y=\"19\" width=\"54\" height=\"62\" rx=\"9\" fill=\"url(#spf)\"/>\n    <rect x=\"23.55\" y=\"19.55\" width=\"52.9\" height=\"60.9\" rx=\"8.45\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.1\"/>\n    <g fill=\"#1B2433\"><path d=\"M1049.404296875 -617.600830078125Q1049.404296875 -539.199951171875 1002.8536987304688 -496.44940185546875Q956.3031005859375 -453.6988525390625 871.1021728515625 -453.6988525390625H299.9046630859375V-573.00048828125H599.6959228515625Q665.8961181640625 -573.00048828125 665.8961181640625 -637.3009033203125Q665.8961181640625 -721.800048828125 629.0471801757812 -762.198974609375Q592.1982421875 -802.597900390625 543.5003662109375 -802.597900390625Q503.402099609375 -802.597900390625 469.85333251953125 -779.2987060546875Q436.3045654296875 -755.99951171875 416.65521240234375 -708.0507202148438Q397.005859375 -660.1019287109375 397.005859375 -583.3031005859375Q397.005859375 -410.5037841796875 478.9052734375 -325.7044677734375Q560.8046875 -240.9051513671875 695.60400390625 -240.9051513671875Q763.602294921875 -240.9051513671875 824.40185546875 -265.25408935546875Q885.201416015625 -289.60302734375 930.7020263671875 -330.402099609375Q957.002685546875 -353.40234375 971.5029296875 -361.25238037109375Q986.003173828125 -369.1024169921875 1000.5032958984375 -367.3023681640625Q1018.803466796875 -366.40234375 1032.7037353515625 -352.95220947265625Q1046.60400390625 -339.5020751953125 1046.60400390625 -307.9014892578125Q1046.004150390625 -220.801025390625 988.703857421875 -144.3006591796875Q931.403564453125 -67.80029296875 828.1029052734375 -20.25006103515625Q724.80224609375 27.3001708984375 583.001220703125 27.3001708984375Q423.800537109375 27.3001708984375 304.199951171875 -34.54986572265625Q184.599365234375 -96.39990234375 119.04901123046875 -207.45001220703125Q53.4986572265625 -318.5001220703125 53.4986572265625 -464.600341796875Q53.4986572265625 -615.000732421875 116.74884033203125 -732.6009521484375Q179.9990234375 -850.201171875 301.399658203125 -918.30126953125Q422.80029296875 -986.4013671875 597.401611328125 -986.4013671875Q738.9027099609375 -986.4013671875 839.4533081054688 -936.1511840820312Q940.00390625 -885.9010009765625 994.7041015625 -802.0008544921875Q1049.404296875 -718.1007080078125 1049.404296875 -617.600830078125Z\" transform=\"translate(32.367999999999995 73.488) scale(0.032)\"/></g>\n    <g fill=\"#16934A\"><path d=\"M48.939 39.411 L60.059 27.985 A3.85 3.85 0 1 0 53.873 23.546 L46.609 37.739 A1.45 1.45 0 0 0 48.939 39.411Z\"/></g>\n  </g></g></g></svg>";
  var WORD = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 -1470 15954 1510\" aria-hidden=\"true\" focusable=\"false\"><defs><path id=\"sp-g114\" d=\"M423 -527Q423 -673 464 -772Q505 -870 575 -920Q644 -970 729 -970Q820 -970 873 -914Q925 -857 925 -754Q925 -665 889 -622Q853 -579 792 -579Q731 -579 699 -609Q667 -639 667 -691L668 -727Q668 -758 652 -773Q636 -787 609 -787Q573 -787 540 -759Q508 -731 487 -676Q466 -621 466 -539ZM450 -888 466 -673V-218Q466 -181 480 -160Q494 -139 523 -134L601 -125Q630 -120 644 -104Q658 -87 658 -61Q658 -32 640 -16Q622 0 587 0H147Q114 0 95 -16Q76 -32 76 -61Q76 -84 88 -99Q100 -113 121 -124L151 -134Q170 -143 180 -161Q191 -179 191 -219V-675Q191 -710 180 -725Q169 -741 150 -747L105 -751Q85 -759 73 -772Q61 -786 61 -806Q61 -830 77 -846Q92 -862 122 -873L292 -935Q325 -947 349 -956Q373 -965 391 -965Q417 -965 432 -948Q447 -931 450 -888Z\"/><path id=\"sp-g110\" d=\"M472 -895V-218Q472 -175 482 -156Q491 -138 511 -128L540 -117Q578 -98 578 -61Q578 0 515 0H146Q114 0 95 -16Q76 -32 76 -61Q76 -84 89 -99Q101 -114 121 -124L151 -134Q170 -143 180 -161Q191 -179 191 -218V-675Q191 -711 180 -726Q169 -740 150 -746L105 -750Q85 -760 73 -773Q61 -785 61 -806Q61 -829 76 -845Q91 -862 122 -873L292 -935Q329 -949 356 -957Q383 -965 408 -965Q438 -965 455 -945Q472 -926 472 -895ZM441 -646 382 -714 430 -759Q548 -869 641 -920Q735 -970 818 -970Q941 -970 1010 -892Q1080 -814 1094 -680L1146 -218Q1151 -179 1159 -161Q1167 -144 1184 -134L1214 -124Q1235 -113 1247 -98Q1259 -84 1259 -61Q1259 -32 1241 -16Q1223 0 1189 0H818Q754 0 754 -61Q754 -98 793 -117L822 -128Q841 -138 853 -156Q865 -175 860 -219L817 -608Q806 -692 773 -732Q739 -771 674 -771Q632 -771 583 -751Q535 -731 479 -682Z\"/><path id=\"sp-g116\" d=\"M115 -818 77 -825Q57 -834 45 -850Q33 -865 33 -888Q33 -913 52 -930Q71 -947 101 -947H145Q170 -947 189 -961Q207 -974 227 -1007L288 -1126Q306 -1156 332 -1175Q358 -1194 382 -1194Q412 -1194 432 -1175Q452 -1156 452 -1120V-307Q452 -246 479 -212Q506 -179 556 -179Q584 -179 606 -189Q627 -199 643 -212Q660 -225 674 -234Q687 -244 701 -243Q718 -243 729 -228Q739 -214 737 -190Q735 -136 696 -87Q658 -39 593 -9Q529 21 452 21Q319 21 245 -46Q171 -112 171 -246V-736Q171 -774 156 -791Q142 -809 115 -818ZM338 -804 338 -947H673Q704 -947 722 -933Q740 -919 740 -892Q740 -854 706 -829Q672 -804 597 -804Z\"/><path id=\"sp-g99\" d=\"M979 -689Q979 -630 939 -590Q899 -551 833 -551Q768 -551 734 -586Q700 -622 700 -681V-710Q700 -762 659 -795Q618 -828 547 -828Q484 -828 434 -795Q384 -761 355 -697Q326 -633 326 -544Q326 -428 368 -348Q410 -268 483 -227Q556 -185 647 -185Q739 -185 799 -220Q859 -254 898 -307Q916 -324 927 -331Q939 -339 951 -338Q969 -338 979 -325Q989 -313 989 -287Q987 -206 933 -134Q879 -63 784 -19Q689 25 564 25Q419 25 308 -35Q197 -96 134 -204Q71 -312 71 -453Q71 -601 134 -717Q198 -834 313 -902Q428 -970 584 -970Q707 -970 795 -931Q884 -892 931 -828Q979 -765 979 -689Z\"/><path id=\"sp-g70\" d=\"M854 -1400Q893 -1400 920 -1411Q948 -1422 972 -1433Q996 -1444 1023 -1444Q1068 -1444 1090 -1420Q1113 -1395 1128 -1343L1199 -1085Q1208 -1053 1190 -1030Q1172 -1008 1141 -1002Q1115 -999 1091 -1010Q1067 -1020 1051 -1058Q1013 -1146 979 -1187Q945 -1227 904 -1239Q863 -1251 806 -1251H563V-249Q563 -209 580 -190Q598 -170 629 -162L701 -143Q729 -133 742 -115Q756 -98 756 -70Q756 -38 736 -19Q715 0 673 0H177Q135 0 114 -19Q94 -38 94 -70Q94 -123 149 -148L189 -162Q218 -171 236 -190Q253 -209 253 -248V-1152Q253 -1191 236 -1210Q218 -1229 189 -1238L149 -1252Q94 -1277 94 -1330Q94 -1362 114 -1381Q135 -1400 177 -1400ZM423 -721H772Q835 -721 855 -743Q875 -766 885 -817Q892 -844 908 -859Q923 -873 945 -875Q1001 -877 1016 -816L1081 -555Q1091 -517 1080 -494Q1068 -472 1040 -462Q1015 -454 993 -465Q971 -475 955 -500Q935 -532 917 -551Q900 -569 875 -576Q849 -583 804 -583H423Z\"/><path id=\"sp-g108\" d=\"M471 -1416V-218Q471 -179 482 -161Q493 -143 511 -134L541 -124Q561 -114 573 -99Q585 -84 585 -61Q585 -32 567 -16Q549 0 516 0H146Q115 0 96 -16Q76 -32 76 -61Q76 -84 88 -99Q100 -114 122 -124L151 -134Q170 -143 180 -161Q191 -179 191 -218V-1196Q191 -1233 180 -1247Q169 -1262 150 -1267L104 -1272Q85 -1281 73 -1294Q62 -1307 62 -1329Q62 -1351 76 -1368Q91 -1385 122 -1395L292 -1457Q329 -1471 355 -1479Q382 -1487 408 -1487Q438 -1487 455 -1467Q471 -1448 471 -1416Z\"/><path id=\"sp-g97\" d=\"M691 -134V-166L667 -184V-720Q667 -785 630 -821Q593 -856 528 -856Q471 -856 439 -834Q408 -811 408 -776V-710Q408 -651 368 -619Q328 -586 254 -586Q191 -586 158 -616Q126 -646 126 -697Q126 -763 181 -825Q236 -887 343 -927Q451 -968 607 -968Q777 -968 861 -893Q945 -817 945 -691V-199Q945 -178 955 -166Q966 -154 987 -154Q1001 -154 1009 -157Q1018 -161 1024 -167Q1030 -172 1036 -176Q1042 -180 1051 -180Q1071 -180 1082 -166Q1093 -153 1093 -131Q1093 -93 1068 -57Q1044 -22 999 2Q954 26 893 26Q806 26 748 -18Q691 -61 691 -134ZM82 -212Q82 -339 199 -419Q315 -498 511 -498Q572 -498 625 -490Q679 -481 716 -466L689 -373Q656 -387 619 -395Q583 -403 542 -403Q463 -403 416 -366Q370 -329 370 -265Q370 -200 409 -167Q448 -134 508 -134Q566 -134 618 -160Q670 -187 705 -232L731 -145Q673 -63 577 -19Q481 26 373 26Q244 26 163 -39Q82 -104 82 -212Z\"/><path id=\"sp-g101\" d=\"M997 -607Q997 -540 957 -504Q918 -468 844 -468H243V-567H650Q714 -567 714 -626Q714 -721 664 -775Q614 -828 539 -828Q478 -828 429 -795Q380 -762 353 -699Q325 -636 325 -545Q325 -364 414 -271Q503 -178 646 -178Q735 -178 802 -215Q868 -252 906 -305Q924 -325 935 -332Q947 -339 960 -338Q976 -338 987 -326Q997 -314 997 -290Q995 -208 941 -136Q888 -64 792 -19Q697 25 568 25Q417 25 305 -36Q192 -98 131 -207Q70 -317 70 -460Q70 -606 131 -721Q192 -836 306 -903Q419 -970 578 -970Q706 -970 799 -922Q892 -874 944 -791Q997 -709 997 -607Z\"/><path id=\"sp-g115\" d=\"M515 -99Q578 -99 613 -129Q647 -160 647 -204Q647 -238 628 -263Q609 -288 573 -304Q538 -320 493 -333Q361 -362 271 -406Q182 -449 136 -513Q90 -577 90 -662Q90 -799 185 -884Q281 -970 474 -970Q534 -970 578 -958Q623 -947 653 -935Q683 -924 703 -924Q721 -924 732 -935Q744 -947 757 -959Q769 -972 789 -972Q814 -972 834 -956Q855 -940 868 -901L914 -768Q933 -717 923 -683Q913 -648 882 -638Q853 -629 819 -640Q785 -652 763 -682Q730 -735 688 -773Q647 -810 596 -831Q545 -852 485 -852Q408 -852 373 -817Q338 -782 338 -730Q338 -693 360 -666Q383 -640 425 -623Q467 -605 524 -593Q646 -572 728 -531Q810 -490 852 -425Q894 -360 894 -269Q894 -185 848 -119Q803 -54 720 -16Q637 22 528 22Q452 22 405 10Q358 -2 333 -14Q308 -26 299 -26Q281 -26 267 -14Q253 -2 240 10Q227 22 210 22Q187 22 171 7Q155 -8 146 -44L113 -192Q104 -234 110 -268Q116 -303 147 -311Q174 -318 201 -303Q229 -288 252 -251Q295 -176 362 -137Q430 -99 515 -99Z\"/><path id=\"sp-g104\" d=\"M472 -1416V-218Q472 -175 482 -156Q491 -138 511 -128L540 -117Q577 -98 577 -61Q577 0 515 0H146Q114 0 95 -16Q76 -32 76 -61Q76 -84 89 -99Q101 -114 121 -124L151 -134Q170 -143 180 -161Q191 -179 191 -218V-1196Q191 -1233 180 -1247Q169 -1262 150 -1267L105 -1272Q85 -1281 73 -1294Q61 -1307 61 -1329Q61 -1351 76 -1368Q91 -1385 122 -1395L292 -1457Q329 -1471 356 -1479Q383 -1487 408 -1487Q438 -1487 455 -1467Q472 -1448 472 -1416ZM441 -646 382 -714 430 -759Q548 -869 641 -920Q735 -970 818 -970Q941 -970 1010 -892Q1080 -813 1094 -679L1146 -218Q1150 -179 1159 -161Q1167 -144 1184 -134L1214 -124Q1234 -113 1246 -98Q1258 -84 1258 -61Q1258 -32 1240 -16Q1223 0 1189 0H818Q754 0 754 -61Q754 -98 793 -117L822 -128Q841 -138 853 -156Q865 -175 860 -219L817 -608Q806 -692 773 -732Q739 -771 674 -771Q632 -771 583 -751Q535 -731 479 -682Z\"/><path id=\"sp-g117\" d=\"M807 -135V-198L795 -206V-674Q795 -712 784 -726Q773 -740 755 -746L709 -750Q688 -760 677 -773Q666 -785 666 -807Q666 -829 681 -846Q695 -863 726 -873L897 -935Q935 -949 961 -957Q987 -965 1013 -965Q1043 -965 1059 -945Q1076 -926 1076 -895V-218Q1076 -179 1087 -161Q1098 -143 1116 -134L1145 -124Q1167 -114 1179 -99Q1190 -84 1190 -61Q1190 -33 1172 -16Q1153 0 1120 0H942Q883 0 845 -36Q807 -73 807 -135ZM165 -273V-674Q165 -712 154 -726Q143 -740 124 -746L78 -750Q59 -760 48 -773Q36 -785 36 -807Q36 -829 51 -846Q65 -863 96 -873L266 -935Q303 -949 330 -957Q356 -965 382 -965Q412 -965 429 -945Q446 -926 446 -895V-343Q446 -260 484 -217Q523 -173 588 -173Q632 -173 680 -195Q728 -216 781 -264L823 -303L882 -235L831 -188Q713 -76 619 -25Q525 26 442 26Q321 26 243 -56Q165 -139 165 -273Z\"/></defs><g fill=\"currentColor\"><use href=\"#sp-g70\" x=\"0\"/><use href=\"#sp-g97\" x=\"1251\"/><use href=\"#sp-g117\" x=\"2303\"/><use href=\"#sp-g108\" x=\"3559\"/><use href=\"#sp-g116\" x=\"4198\"/><use href=\"#sp-g108\" x=\"4988\"/><use href=\"#sp-g101\" x=\"5627\"/><use href=\"#sp-g115\" x=\"6694\"/><use href=\"#sp-g115\" x=\"7671\"/><use href=\"#sp-g70\" x=\"9083\"/><use href=\"#sp-g114\" x=\"10334\"/><use href=\"#sp-g101\" x=\"11270\"/><use href=\"#sp-g110\" x=\"12337\"/><use href=\"#sp-g99\" x=\"13621\"/><use href=\"#sp-g104\" x=\"14670\"/></g></svg>";
  var SHOW_AFTER = 700;      // ms: a quick start never sees a bar
  var QUIET_AFTER = 12000;   // ms without news: say so, plainly
  var el, fill, label, prog, t0 = Date.now(), p = 0, known = false, last = Date.now(), timers = [], gone = false, failed = false, userLabel = '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build() {
    el = document.createElement('div');
    el.id = 'splash';
    el.setAttribute('aria-busy', 'true');
    el.innerHTML =
      '<div class="sp-col">' +
        '<div class="sp-mark">' + MARK + '</div>' +
        '<div class="sp-name" role="img" aria-label="Faultless French">' + WORD + '</div>' +
        '<div class="sp-prog" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="sp-track"><div class="sp-fill"></div></div>' +
          '<div class="sp-label" aria-live="polite"></div>' +
        '</div>' +
      '</div>';
    fill = el.querySelector('.sp-fill'); label = el.querySelector('.sp-label'); prog = el.querySelector('.sp-prog');
    (document.body || document.documentElement).appendChild(el);
    try { if (document.fonts && document.fonts.check('600 15px "Atkinson Hyperlegible Next"')) el.classList.add('sp-font'); else if (document.fonts) document.fonts.ready.then(function () { el && el.classList.add('sp-font'); }); } catch (e) {}
  }
  function say(text) { if (label && label.textContent !== text) label.textContent = text; }
  function render() {
    if (!el) return;
    el.classList.toggle('sp-ind', !known);
    if (known) { fill.style.transform = 'scaleX(' + p.toFixed(4) + ')'; prog.setAttribute('aria-valuenow', Math.round(p * 100)); }
    else prog.removeAttribute('aria-valuenow');
    var quiet = Date.now() - last > QUIET_AFTER;
    if (failed && Date.now() - t0 > 8000) { say('Something went wrong. Tap to start again.'); el.classList.add('sp-retry'); }
    else if (navigator.onLine === false) say('No connection. The first start needs the internet.');
    else if (quiet) say('Still working. The first start takes longer; after that it is quick.');
    else say(userLabel || 'Getting things ready');
  }
  function show() {
    if (el && !gone) return;
    if (gone) { gone = false; t0 = last = Date.now(); p = 0; known = false; failed = false; userLabel = ''; }
    build();
    timers.push(setTimeout(function () { if (el) { el.classList.add('sp-slow'); render(); } }, SHOW_AFTER));
    timers.push(setInterval(render, 1000));
  }
  function progress(f, text) {
    if (!el || gone) return;
    last = Date.now();
    if (typeof text === 'string') userLabel = text;
    if (f == null || isNaN(f)) known = false;
    else { known = true; p = Math.max(p, Math.min(1, Math.max(0, +f))); }
    if (el.classList.contains('sp-slow')) render();
  }
  function done() {
    return new Promise(function (resolve) {
      if (!el || gone) return resolve();
      gone = true; timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = [];
      var node = el, quick = Date.now() - t0 < SHOW_AFTER;
      node.style.pointerEvents = 'none';                         // the screen underneath answers the finger at once
      node.setAttribute('aria-busy', 'false');
      if (known && node.classList.contains('sp-slow')) fill.style.transform = 'scaleX(1)';
      // wait until the first screen has been painted underneath, then lift the mark and let the paper go
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        var finish = function () { if (node.parentNode) node.parentNode.removeChild(node); resolve(); };
        if (reduce) return finish();
        node.classList.add(quick ? 'sp-out-quick' : 'sp-out');
        var ended = false, end = function () { if (!ended) { ended = true; finish(); } };
        node.addEventListener('transitionend', function (e) { if (e.target === node) end(); });
        setTimeout(end, 450);
      }); });
      el = null;
    });
  }
  window.addEventListener('error', function () { failed = true; });
  window.addEventListener('online', function () { render(); });
  window.addEventListener('offline', function () { render(); });
  document.addEventListener('click', function (e) { if (el && el.classList.contains('sp-retry') && el.contains(e.target)) location.reload(); });

  window.SPLASH = { show: show, progress: progress, done: done };
  show();
})();
