import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { buildSurveyForLexicon, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";
import "./App.css";

/* =========================================================
   Safety-net CSS: hide normal-view ratings (we render our own
   lightbox UI). This does NOT clear values—unlike visible=false.
   ========================================================= */
const hideNormalRatingsStyle = `
.sd-question[data-name="green"],
.sd-question[data-name="pleasant"] {
  display: none !important;
}
`;

/* =========================================================
   RATING ORDER resolver (GP = green first, PG = pleasant first)
   precedence: URL > localStorage override > env default > persisted random
   ========================================================= */
const ORDER_KEY_PERSIST = "ratingOrder.persist.v1";
const ORDER_KEY_OVERRIDE = "ratingOrder.override.v1";

function normalizeOrder(v) {
  if (!v) return null;
  const s = String(v).toLowerCase();
  if (["gp", "green-first", "green"].includes(s)) return "GP";
  if (["pg", "pleasant-first", "pleasant"].includes(s)) return "PG";
  return null;
}

function resolveRatingOrder() {
  // 1) ?order=gp | pg
  const urlParam = new URLSearchParams(window.location.search).get("order");
  const fromUrl = normalizeOrder(urlParam);
  if (fromUrl) return { value: fromUrl, source: "url" };

  // 2) local override
  const fromOverride = normalizeOrder(localStorage.getItem(ORDER_KEY_OVERRIDE));
  if (fromOverride) return { value: fromOverride, source: "override" };

  // 3) env default (to disable randomization later)
  const fromEnv = normalizeOrder(process.env.REACT_APP_RATING_DEFAULT_ORDER);
  if (fromEnv) return { value: fromEnv, source: "env" };

  // 4) persisted random
  const saved = normalizeOrder(localStorage.getItem(ORDER_KEY_PERSIST));
  if (saved) return { value: saved, source: "persist" };

  // 5) first-time random
  const assigned = Math.random() < 0.5 ? "GP" : "PG";
  localStorage.setItem(ORDER_KEY_PERSIST, assigned);
  return { value: assigned, source: "random" };
}

/* =========================================================
   LEXICON randomizer (GREEN vs VEG)
   precedence: URL > local override > env default > persisted random
   ========================================================= */
const LEX_KEY_PERSIST = "lexicon.persist.v1";
const LEX_KEY_OVERRIDE = "lexicon.override.v1";

function normalizeLex(v) {
  if (!v) return null;
  const s = String(v).toLowerCase();
  if (["green", "g", "greenery"].includes(s)) return "GREEN";
  if (["veg", "vegetation", "v"].includes(s)) return "VEG";
  return null;
}

function resolveLexicon() {
  // 1) ?lex=veg | green
  const urlParam = new URLSearchParams(window.location.search).get("lex");
  const fromUrl = normalizeLex(urlParam);
  if (fromUrl) return { value: fromUrl, source: "url" };

  // 2) local override
  const fromOverride = normalizeLex(localStorage.getItem(LEX_KEY_OVERRIDE));
  if (fromOverride) return { value: fromOverride, source: "override" };

  // 3) env default (disable randomization globally)
  const fromEnv = normalizeLex(process.env.REACT_APP_LEXICON_DEFAULT);
  if (fromEnv) return { value: fromEnv, source: "env" };

  // 4) persisted random
  const saved = normalizeLex(localStorage.getItem(LEX_KEY_PERSIST));
  if (saved) return { value: saved, source: "persist" };

  // 5) first-time random
  const assigned = Math.random() < 0.5 ? "GREEN" : "VEG";
  localStorage.setItem(LEX_KEY_PERSIST, assigned);
  return { value: assigned, source: "random" };
}

// Wording map for each variant
const LEXMAP = {
  GREEN: {
    greenLabel: "Greenery",
    greenMin: "0 = Not green at all",
    greenMid: "5 = Half of the view is green",
    greenMax: "10 = Completely green",
    tapToRate: "Click the image to start rating",
  },
  VEG: {
    greenLabel: "Vegetation",
    greenMin: "0 = No vegetation",
    greenMid: "5 = Vegetation covers about half the view",
    greenMax: "10 = Fully covered by vegetation",
    tapToRate: "Click the image to start rating",
  },
};

/* =========================================================
   KeyboardRatings (honors rating order)
   ========================================================= */
function KeyboardRatings({ model, lightbox, order }) {
  const TEN_MS = 800;
  const stateRef = React.useRef({
    lastField: null,
    greenArm10Until: 0,
  });

  React.useEffect(() => {
    if (!model) return;

    const [FIRST, SECOND] = order || ["green", "pleasant"];

    const getActivePanel = () => lightbox?.panel ?? null;
    const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
    const setVal = (q, val) => { if (!q || q.readOnly) return; q.value = val; };
    const clearArm = () => { stateRef.current.greenArm10Until = 0; };

    const onKeyDown = (e) => {
      const t = e.target;
      const tag = (t?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || t?.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const panel = getActivePanel();
      if (!panel) return;

      const qFirst  = panel.getQuestionByName(FIRST);
      const qSecond = panel.getQuestionByName(SECOND);
      const qGreen  = panel.getQuestionByName("green");
      const now = performance.now();

      // Backspace clears most-recent and disarms
      if (e.key === "Backspace") {
        clearArm();
        if (hasVal(qSecond)) qSecond.value = null;
        else if (hasVal(qFirst)) qFirst.value = null;
        e.preventDefault();
        return;
      }

      // Only number keys
      const isDigit = /^[0-9]$/.test(e.key) || /^Numpad[0-9]$/.test(e.code);
      if (!isDigit) return;
      const digit = /^[0-9]$/.test(e.key) ? e.key : e.code.replace("Numpad", "");
      const n = parseInt(digit, 10);

      // Is greenery armed for 1→0 => 10?
      const greenArmed =
        now <= stateRef.current.greenArm10Until &&
        stateRef.current.lastField === "green" &&
        String(qGreen?.value) === "1";

      if (greenArmed) {
        if (digit === "0") {
          setVal(qGreen, 10);
          clearArm();
          stateRef.current.lastField = "green";
          e.preventDefault();
          return;
        }
        const qPleasant = panel.getQuestionByName("pleasant");
        if (!hasVal(qPleasant) && n >= 1 && n <= 7) {
          setVal(qPleasant, n);
          stateRef.current.lastField = "pleasant";
          e.preventDefault();
        }
        clearArm();
        return;
      }

      const fitsGreen = (x) => x >= 0 && x <= 10;
      const fitsPleasant = (x) => x >= 1 && x <= 7;

      const firstEmpty  = !hasVal(qFirst);
      const secondEmpty = !hasVal(qSecond);

      // Fill FIRST
      if (firstEmpty) {
        if (FIRST === "green") {
          if (digit === "1") {
            setVal(qFirst, 1);
            stateRef.current.greenArm10Until = now + TEN_MS;
            stateRef.current.lastField = "green";
            e.preventDefault();
            return;
          }
          if (fitsGreen(n)) {
            setVal(qFirst, n);
            stateRef.current.lastField = "green";
            clearArm();
            e.preventDefault();
          }
        } else {
          if (fitsPleasant(n)) {
            setVal(qFirst, n);
            stateRef.current.lastField = "pleasant";
            clearArm();
            e.preventDefault();
          }
        }
        return;
      }

      // Fill SECOND
      if (secondEmpty) {
        if (SECOND === "green") {
          if (digit === "1") {
            setVal(qSecond, 1);
            stateRef.current.greenArm10Until = now + TEN_MS;
            stateRef.current.lastField = "green";
            e.preventDefault();
            return;
          }
          if (fitsGreen(n)) {
            setVal(qSecond, n);
            stateRef.current.lastField = "green";
            clearArm();
            e.preventDefault();
          }
        } else {
          if (fitsPleasant(n)) {
            setVal(qSecond, n);
            stateRef.current.lastField = "pleasant";
            clearArm();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [model, lightbox, order]);

  return null;
}

/* =========================================================
   PopupRatings (uses order + lexicon)
   ========================================================= */
function PopupRatings({ panel, order, lex }) {
  const [, force] = React.useState(0);

  const scaleMeta = {
    green: {
      min: lex.greenMin,
      mid: lex.greenMid,
      max: lex.greenMax,
      choices: Array.from({ length: 11 }, (_, i) => i), // 0..10
      className: "rating-row rating-row--green",
      label: lex.greenLabel,
    },
    pleasant: {
      min: "1 = Very unpleasant",
      mid: "4 = Neither pleasant or unpleasant",
      max: "7 = Very pleasant",
      choices: [1, 2, 3, 4, 5, 6, 7],
      className: "rating-row rating-row--pleasant",
      label: "Pleasant",
    }
  };

  const getQ = React.useCallback((name) => panel?.getQuestionByName(name), [panel]);
  const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
  const isSelected = (q, n) => String(q?.value) === String(n);

  const setVal = (q, val) => {
    if (!q || q.readOnly) return;
    q.value = val;
    force((x) => x + 1);
  };

  React.useEffect(() => {
    if (!panel) return;
    const s = panel.survey;
    const RATING_KEYS = new Set(["green", "pleasant"]);

    const onValueChanged = (_sender, opt) => {
      if (RATING_KEYS.has(opt?.name)) force((x) => x + 1);
    };
    const onDP = (_sender, opt) => {
      const isDP = opt?.question?.name === "comfort_loop";
      const isThisPanel = opt?.panel === panel;
      if (!isDP || !isThisPanel) return;
      if (RATING_KEYS.has(opt?.name)) force((x) => x + 1);
    };

    s.onValueChanged.add(onValueChanged);
    if (s.onDynamicPanelValueChanged) s.onDynamicPanelValueChanged.add(onDP);
    else if (s.onDynamicPanelItemValueChanged) s.onDynamicPanelItemValueChanged.add(onDP);

    return () => {
      s.onValueChanged.remove(onValueChanged);
      if (s.onDynamicPanelValueChanged) s.onDynamicPanelValueChanged.remove(onDP);
      else if (s.onDynamicPanelItemValueChanged) s.onDynamicPanelItemValueChanged.remove(onDP);
    };
  }, [panel]);

  const [firstName, secondName] = order || ["green", "pleasant"];
  const qFirst  = getQ(firstName);
  const qSecond = getQ(secondName);

  const awaitingSecond = hasVal(qFirst) && !hasVal(qSecond);
  const awaitingFirst  = hasVal(qSecond) && !hasVal(qFirst);

  const renderRow = (name, q) => {
    const m = scaleMeta[name];
    return (
      <div className={m.className} key={name}>
        <div className="rating-label">{m.label}</div>
        <div className="rating-scale">
          <div className="scale-header">
            <span className="scale-label scale-label--min" style={{ gridColumn: '1' }}>
              {m.min}
            </span>
            <span className="scale-label scale-label--mid" style={{ gridColumn: name === "green" ? '6' : '4' }}>
              {m.mid}
            </span>
            <span className="scale-label scale-label--max" style={{ gridColumn: name === "green" ? '11' : '7' }}>
              {m.max}
            </span>
          </div>
          <div className="rating-buttons">
            {m.choices.map((n) => (
              <button
                key={`${name}-${n}`}
                type="button"
                className={isSelected(q, n) ? "active" : ""}
                aria-pressed={isSelected(q, n)}
                onClick={() => setVal(q, n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={[
        "rating-group",
        awaitingSecond ? "awaiting-pleasant" : "",
        awaitingFirst ? "awaiting-green" : "",
      ].join(" ").trim()}
    >
      {renderRow(firstName, qFirst)}
      {renderRow(secondName, qSecond)}
    </div>
  );
}

/* =========================================================
   App
   ========================================================= */
export default function App() {
  const MIN_DWELL_MS = 2000;
  const MAX_IMAGES = 100; // ← cap how many images to rate in the lightbox flow

  const imageLoadedAtRef = React.useRef(new WeakMap());
  const pendingAdvanceRef = React.useRef(null);
  const waitingForDwellAdvanceRef = React.useRef(new WeakMap());
  const ratedCountRef = React.useRef(0); // ← count fully-rated images (both ratings + dwell)

  const [lightbox, setLightbox] = React.useState(null);
  const [lightboxLoaded, setLightboxLoaded] = React.useState(false);
  React.useEffect(() => setLightboxLoaded(false), [lightbox?.src]);

  const lightboxRef = React.useRef(null);
  React.useEffect(() => { lightboxRef.current = lightbox; }, [lightbox]);

  const openLightboxForPanel = React.useCallback((panel) => {
    if (!panel) return;
    const imgQ = panel.getQuestionByName("image");
    const src = imgQ?.imageLink || "";
    if (src) setLightbox({ src, panel });
  }, []);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // ---------------- rating order + lexicon ----------------
  const { value: ratingOrderStr, source: ratingOrderSource } = React.useMemo(resolveRatingOrder, []);
  const ratingOrder = ratingOrderStr === "GP" ? ["green", "pleasant"] : ["pleasant", "green"];

  const { value: lexVariant, source: lexSource } = React.useMemo(resolveLexicon, []);
  const lex = LEXMAP[lexVariant];
  const surveyJson = React.useMemo(() => buildSurveyForLexicon(lex), [lex]);

  const model = React.useMemo(() => {
    const m = new Model(surveyJson);

    // Apply theme + survey config
    m.applyTheme(themeJson);
    m.title = surveyConfig.title;
    m.description = surveyConfig.description;
    m.logo = surveyConfig.logo;
    m.logoPosition = surveyConfig.logoPosition;
    Object.keys(surveyConfig.settings).forEach((key) => (m[key] = surveyConfig.settings[key]));
    m.focusFirstQuestionAutomatic = false;
    m.previewText = "Finish survey";
    m.showPreviewBeforeComplete = false;

    const defaultNext = m.pageNextText || "Next";
    m.completeText = "Finish survey";

    // Keep one-at-a-time panel behavior, but hide panel-level nav UI
    const killPanelNav = () => {
      const dp = m.getQuestionByName("comfort_loop");
      if (!dp) return;
      dp.renderMode = "progressTop";     // ← keep auto-advance logic behavior
      dp.showNavigationButtons = false;  // hide Prev/Next inside the panel
      dp.allowAddPanel = false;
      dp.allowRemovePanel = false;
    };
    killPanelNav();
    m.onCurrentPageChanged.add(killPanelNav);

    // Remove any stray panel footer/progress/action bars from DOM
    m.onAfterRenderQuestion.add((_s, opt) => {
      if (opt.question.name !== "comfort_loop") return;
      opt.htmlElement
        .querySelectorAll(`
          .sd-paneldynamic__progress,
          .sd-paneldynamic__footer,
          .sd-paneldynamic__prev-btn,
          .sd-paneldynamic__next-btn,
          .sd-action-bar
        `)
        .forEach((el) => (el.style.display = "none"));
    });

    // Page next button labels (cap-aware)
    const setNextLabel = () => {
      const name = m.currentPage?.name;
      if (name === "introPage") m.pageNextText = "I agree";
      else if (name === "consentPage") m.pageNextText = "Accept";
      else if (name === "instructionsPage") m.pageNextText = "Start survey";
      else if (name === "demographics") m.pageNextText = "Continue to rating";
      else if (name === "comfort_loop_page") {
        m.pageNextText = ratedCountRef.current >= MAX_IMAGES ? "Finish survey" : "Finish rating";
      } else m.pageNextText = defaultNext;
    };
    setNextLabel();
    m.onCurrentPageChanged.add(setNextLabel);

    // Build image queue
    const pool = (displayedImages?.comfort_rating ?? [])
      .map((x, i) => {
        const url = x?.imageLink || x?.image || "";
        if (!url) console.warn("[images] empty url at index", i, x);
        return url;
      })
      .filter(Boolean);
    const imageQueue = [...pool];

    // Preloader
    const preloadedLocal = new Set();
    const preloadLocal = (url) => {
      if (!url || preloadedLocal.has(url)) return;
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      preloadedLocal.add(url);
      try {
        if (!document.querySelector(`link[rel="preload"][as="image"][href="${url}"]`)) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = url;
          document.head.appendChild(link);
        }
      } catch (_) {}
    };
    const preloadNext = (n = 2) => {
      for (let i = 0; i < n && i < imageQueue.length; i++) {
        preloadLocal(imageQueue[i]);
      }
    };
    m.__preloadNext = preloadNext;
    preloadNext(2);

    const nextImage = () => (imageQueue.length ? imageQueue.shift() : "");

    // Update the wording on the SurveyJS rating question ("green")
    const applyLexiconToSurvey = (mm, lexArg) => {
      const dp = mm.getQuestionByName("comfort_loop");
      if (!dp) return;

      // Update template so new panels inherit wording
      const tmplGreen = dp.template?.elements?.find(e => e.name === "green");
      if (tmplGreen) {
        tmplGreen.title = lexArg.greenLabel;
        tmplGreen.minRateDescription = lexArg.greenMin;
        tmplGreen.maxRateDescription = lexArg.greenMax;
      }

      // Update any existing panels (e.g., first panel)
      dp.panels?.forEach(p => {
        const qG = p.getQuestionByName("green");
        if (qG) {
          qG.title = lexArg.greenLabel;
          qG.minRateDescription = lexArg.greenMin;
          qG.maxRateDescription = lexArg.greenMax;
        }
      });
    };
    applyLexiconToSurvey(m, lex);

    // Normal view: attach click-to-open + dwell timing + banners
    m.onAfterRenderQuestion.add((sender, options) => {
      if (options.question.name === "green" || options.question.name === "pleasant") {
        // keep hidden via CSS, do nothing here
        return;
      }
      if (options.question.name !== "image") return;

      const img = options.htmlElement.querySelector("img");
      if (!img) return;

      const panel = options.question.parent;

      // Click to open lightbox
      img.style.cursor = "zoom-in";
      img.onclick = () => {
        const src = img.getAttribute("src") || options.question.imageLink || "";
        if (src) setLightbox({ src, panel });
      };

      // “Tap to rate” banners (use lex text)
      const host = options.htmlElement;
      const bannerIdTop = `tap-to-rate-top-${panel.id}`;
      const bannerIdBottom = `tap-to-rate-${panel.id}`;
      const imgEl = host.querySelector(".sd-image__image, img");
      if (imgEl) {
        const makeBanner = (id) => {
          const el = document.createElement("div");
          el.id = id;
          el.className = "tap-to-rate-banner";
          el.textContent = lex.tapToRate;
          return el;
        };
        if (!host.querySelector(`#${bannerIdTop}`)) {
          const topBanner = makeBanner(bannerIdTop);
          imgEl.insertAdjacentElement("beforebegin", topBanner);
        }
        if (!host.querySelector(`#${bannerIdBottom}`)) {
          const bottomBanner = makeBanner(bannerIdBottom);
          imgEl.insertAdjacentElement("afterend", bottomBanner);
        }
      }

      // Dwell stamp
      const markLoaded = () => {
        if (!imageLoadedAtRef.current.get(panel)) {
          imageLoadedAtRef.current.set(panel, performance.now());
        }
      };
      if (img.complete) markLoaded();
      else img.addEventListener("load", markLoaded, { once: true });
    });

    // Seed first panel
    m.onAfterRenderSurvey.add((sender) => {
      const dp = sender.getQuestionByName("comfort_loop");
      if (!dp || !dp.panels.length) return;

      const first = dp.panels[0];
      const hidden = first.getQuestionByName("imageUrl");
      if (hidden?.value) return;

      const url = nextImage();
      const imgQ = first.getQuestionByName("image");
      if (imgQ) {
        imgQ.imageLink = url;
        imgQ.locImageLink?.onChanged?.();
      }
      if (hidden) hidden.value = url;
      preloadNext(2);
    });

    // Seed each new panel
    m.onDynamicPanelAdded.add((sender, opt) => {
      if (opt.question.name !== "comfort_loop") return;
      const panel = opt.panel;

      const url = nextImage();
      const imgQ = panel.getQuestionByName("image");
      if (imgQ) {
        imgQ.imageLink = url;
        imgQ.locImageLink?.onChanged?.();
      }
      const hidden = panel.getQuestionByName("imageUrl");
      if (hidden) hidden.value = url;
      preloadNext(2);
    });

    // Scroll helpers
    const getActiveScroller = () => {
      const candidates = [
        document.querySelector(".sd-body__page"),
        document.querySelector(".sd-page"),
        document.querySelector(".sd-body"),
        document.scrollingElement,
        document.documentElement,
        document.body,
      ].filter(Boolean);

      for (const el of candidates) {
        const style = getComputedStyle(el);
        const scrollable =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 1;
        if (scrollable) return el;
      }
      return window;
    };

    const takeScrollSnapshot = () => {
      const scroller = getActiveScroller();
      return scroller === window
        ? { scroller, y: window.scrollY }
        : { scroller, y: scroller.scrollTop };
    };

    const restoreScroll = ({ scroller, y }) => {
      const currentY = scroller === window ? window.scrollY : scroller.scrollTop;
      if (y === 0 && currentY === 0) return;
      const doScroll = () => {
        if (scroller === window) window.scrollTo({ top: y, behavior: "auto" });
        else scroller.scrollTo({ top: y, behavior: "auto" });
      };
      requestAnimationFrame(() => {
        doScroll();
        requestAnimationFrame(doScroll);
      });
    };

    const doAdvanceFromPanel = (panel) => {
      const dp = m.getQuestionByName("comfort_loop");
      const wasOpen = !!lightboxRef.current;
      const hasExistingNext = dp.currentIndex < dp.panels.length - 1;

      if (hasExistingNext) {
        const snap = takeScrollSnapshot();
        dp.currentIndex = dp.currentIndex + 1;

        if (wasOpen) {
          const nextPanel = dp.panels[dp.currentIndex];
          const imgQ = nextPanel.getQuestionByName("image");
          const src = imgQ?.imageLink || "";
          if (src) setLightbox({ src, panel: nextPanel });
        }

        restoreScroll(snap);
        return;
      }

      // No existing next: create one if we still have images; otherwise complete
      if (imageQueue.length > 0) {
        m.__preloadNext?.(2);
        const snap = takeScrollSnapshot();
        dp.addPanel();
        setTimeout(() => {
          dp.currentIndex = dp.currentIndex + 1;
          const nextPanel = dp.panels[dp.currentIndex];
          if (wasOpen) {
            const imgQ = nextPanel.getQuestionByName("image");
            const src = imgQ?.imageLink || "";
            if (src) setLightbox({ src, panel: nextPanel });
          }
          restoreScroll(snap);
        }, 100);
      } else {
        setTimeout(() => {
          m.completeLastPage();
          setLightbox(null);
        }, 100);
      }
    };

    // Cap-aware completion handler
    const onPanelComplete = (panel) => {
      const count = ++ratedCountRef.current;

      // If we’ve hit the cap, close the lightbox and stop creating/advancing panels.
      if (count >= MAX_IMAGES) {
        const dp = m.getQuestionByName("comfort_loop");
        dp.allowAddPanel = false; // hard stop adding more

        // Close lightbox and guide the user to finish
        setLightbox(null);
        m.pageNextText = "Finish survey";
        alert('Thanks for rating! You’ve completed 100 images.\n\nPlease press “Finish rating” to continue.');
        return; // do NOT advance or add more panels
      }

      // Otherwise proceed to the next image as usual
      doAdvanceFromPanel(panel);
    };

    // Advance after both ratings + dwell
    const hookDynamic = (mm) => {
      const RATING_KEYS = ["green", "pleasant"];

      const bothAnswered = (panel) => {
        const g = panel.getQuestionByName("green");
        const p = panel.getQuestionByName("pleasant");
        const has = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
        return { g, p, ok: has(g) && has(p) };
      };

      const handler = (_sender, opt) => {
        if (opt?.question?.name !== "comfort_loop") return;
        if (!RATING_KEYS.includes(opt?.name)) return;

        const dp = opt.question;
        const panel = opt.panel;
        if (!panel) return;

        const { ok } = bothAnswered(panel);
        if (!ok) {
          waitingForDwellAdvanceRef.current.delete(panel);
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        const loadedAt = imageLoadedAtRef.current.get(panel);
        if (!loadedAt) {
          waitingForDwellAdvanceRef.current.set(panel, true);
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        const elapsed = performance.now() - loadedAt;
        const remaining = Math.max(0, MIN_DWELL_MS - elapsed);

        waitingForDwellAdvanceRef.current.set(panel, true);
        if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);

        pendingAdvanceRef.current = setTimeout(() => {
          const cur = dp.panels[dp.currentIndex];
          if (cur === panel && waitingForDwellAdvanceRef.current.get(panel)) {
            waitingForDwellAdvanceRef.current.delete(panel);
            onPanelComplete(panel); // ← cap-aware path
          }
        }, remaining);
      };

      if (mm.onDynamicPanelValueChanged) {
        mm.onDynamicPanelValueChanged.add(handler);
      } else if (mm.onDynamicPanelItemValueChanged) {
        mm.onDynamicPanelItemValueChanged.add(handler);
      }
    };

    hookDynamic(m);

    // Save completion (attach rating order + lexicon metadata)
    m.onComplete.add(async (survey) => {
      const responses = survey.data;
      const completeData = {
        responses,
        displayed_images: displayedImages,
        survey_metadata: {
          completion_time: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          survey_version: "1.0",
          rating_order: ratingOrderStr,           // "GP" | "PG"
          rating_order_source: ratingOrderSource, // "url" | "override" | "env" | "persist" | "random"
          lexicon_variant: lexVariant,            // "GREEN" | "VEG"
          lexicon_source: lexSource,              // "url" | "override" | "env" | "persist" | "random"
          rated_images_count: ratedCountRef.current,
          max_images_cap: MAX_IMAGES,
        },
      };
      const result = await saveSurveyResponse(completeData);
      if (result.success) {
        alert("Thank you for completing the survey! Your responses have been saved.");
      } else {
        console.error("Failed to save survey response:", result.error);
        alert("There was an error saving your responses. Please try again.");
      }
    });

    // Expose meta for debugging if needed
    m.__meta = { ...(m.__meta || {}), ratingOrderStr, ratingOrderSource, lexVariant, lexSource };
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyJson, ratingOrderStr, ratingOrderSource, lexVariant, lexSource]); // (metadata only)

  React.useEffect(() => {
    return () => {
      if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
    };
  }, []);

  return (
    <>
      {/* Hide normal-view ratings; we rate inside the lightbox */}
      <style>{hideNormalRatingsStyle}</style>

      <Survey model={model} />
      <KeyboardRatings model={model} lightbox={lightbox} order={ratingOrder} />

      {lightbox && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className={`lightbox-media ${lightboxLoaded ? "is-loaded" : ""}`}>
              <img
                className="lightbox-img"
                src={lightbox.src}
                alt=""
                decoding="async"
                fetchPriority="high"
                onLoad={() => setLightboxLoaded(true)}
              />
            </div>

            {/* Ratings are ONLY rendered inside the lightbox */}
            <PopupRatings panel={lightbox.panel} order={ratingOrder} lex={lex} />

            <button
              className="lightbox-close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
