import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { saveSurveyResponse } from "./lib/supabase";
import { buildSurveyForLexicon, displayedImages } from "./config/questions";
import { surveyConfig } from "./config/surveyConfig";
import { themeJson } from "./theme";
import "./App.css";
import "survey-core/survey.i18n";
/* =========================================================
   CONFIG: Trap logic
   ========================================================= */
const TRAP_EVERY = 12; // show a trap on the 5th, 10th, 15th, ... NORMAL rating

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
   RATING ORDER resolver
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
  const urlParam = new URLSearchParams(window.location.search).get("order");
  const fromUrl = normalizeOrder(urlParam);
  if (fromUrl) return { value: fromUrl, source: "url" };

  const fromOverride = normalizeOrder(localStorage.getItem(ORDER_KEY_OVERRIDE));
  if (fromOverride) return { value: fromOverride, source: "override" };

  const fromEnv = normalizeOrder(process.env.REACT_APP_RATING_DEFAULT_ORDER);
  if (fromEnv) return { value: fromEnv, source: "env" };

  const saved = normalizeOrder(localStorage.getItem(ORDER_KEY_PERSIST));
  if (saved) return { value: saved, source: "persist" };

  const assigned = Math.random() < 0.5 ? "GP" : "PG";
  localStorage.setItem(ORDER_KEY_PERSIST, assigned);
  return { value: assigned, source: "random" };
}

/* =========================================================
   LEXICON randomizer
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
  const urlParam = new URLSearchParams(window.location.search).get("lex");
  const fromUrl = normalizeLex(urlParam);
  if (fromUrl) return { value: fromUrl, source: "url" };

  const fromOverride = normalizeLex(localStorage.getItem(LEX_KEY_OVERRIDE));
  if (fromOverride) return { value: fromOverride, source: "override" };

  const fromEnv = normalizeLex(process.env.REACT_APP_LEXICON_DEFAULT);
  if (fromEnv) return { value: fromEnv, source: "env" };

  const saved = normalizeLex(localStorage.getItem(LEX_KEY_PERSIST));
  if (saved) return { value: saved, source: "persist" };

  const assigned = Math.random() < 0.5 ? "GREEN" : "VEG";
  localStorage.setItem(LEX_KEY_PERSIST, assigned);
  return { value: assigned, source: "random" };
}

const LEXMAP = {
  GREEN: {
    en: {
      greenLabel: "Greenery",
      greenMin: "0 = Not green at all",
      greenMid: "5 = Half of the view is green",
      greenMax: "10 = Completely green",
      tapToRate: "Click the image to start rating",
    },
    fi: {
      greenLabel: "Vihreys",
      greenMin: "0 = Ei vihreyttä lainkaan",
      greenMid: "5 = Näkymästä noin puolet on vihreää",
      greenMax: "10 = Täysin vihreä näkymä",
      tapToRate: "Klikkaa kuvaa aloittaaksesi arvioinnin",
    },
  },
  VEG: {
    en: {
      greenLabel: "Vegetation",
      greenMin: "0 = No vegetation",
      greenMid: "5 = Vegetation covers about half the view",
      greenMax: "10 = Fully covered by vegetation",
      tapToRate: "Click the image to start rating",
    },
    fi: {
      greenLabel: "Kasvillisuus",
      greenMin: "0 = Ei kasvillisuutta",
      greenMid: "5 = Kasvillisuutta noin puolet näkymästä",
      greenMax: "10 = Näkymä täysin kasvillisuuden peittämä",
      tapToRate: "Klikkaa kuvaa aloittaaksesi arvioinnin",
    },
  },
};


/* =========================================================
   Utils
   ========================================================= */
function pickRandomTrap(trapImages) {
  if (!trapImages || !trapImages.length) return null;
  const idx = Math.floor(Math.random() * trapImages.length);
  return trapImages[idx];
}

function resolveLang() {
  const urlParam = new URLSearchParams(window.location.search).get("lang");
  const s = (urlParam || "").toLowerCase();
  if (s === "fi" || s === "fi-fi") return "fi";
  return "en"; // default
}

const PLEASANT_SCALE_TEXT = {
  en: {
    label: "Pleasantness",
    min: "1 = Very unpleasant",
    mid: "4 = Neither pleasant or unpleasant",
    max: "7 = Very pleasant",
  },
  fi: {
    label: "Miellyttävyys",
    min: "1 = Erittäin epämiellyttävä",
    mid: "4 = Ei miellyttävä eikä epämiellyttävä",
    max: "7 = Erittäin miellyttävä",
  },
};


const STRINGS = {
  en: {
    finishRatingAlert: (n) =>
      `Thanks for rating! You’ve completed ${n} images.\n\nPlease press “Finish rating” to continue.`,
    saveSuccess: "Thank you for completing the survey! Your responses have been saved.",
    saveError: "There was an error saving your responses. Please try again.",
    finishSurveyLabel: "Finish survey",
    finishRatingLabel: "Finish rating",
  },
  fi: {
    finishRatingAlert: (n) =>
      `Kiitos arvioista! Olet arvioinut ${n} kuvaa.\n\nPaina \"Lopeta arviointi\" jatkaaksesi.`,
      saveSuccess: "Kiitos kyselyyn vastaamisesta! Vastauksesi on tallennettu.",
      saveError: "Vastausten tallentamisessa tapahtui virhe. Yritä uudelleen.",
      finishSurveyLabel: "Lopeta kysely",
      finishRatingLabel: "Lopeta arviointi",
  },
};

/* =========================================================
   KeyboardRatings
   ========================================================= */
function KeyboardRatings({ model, lightbox, order }) {
  const TEN_MS = 800;
  const stateRef = React.useRef({ lastField: null, greenArm10Until: 0 });

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

      if (e.key === "Backspace") {
        clearArm();
        if (hasVal(qSecond)) qSecond.value = null;
        else if (hasVal(qFirst)) qFirst.value = null;
        e.preventDefault();
        return;
      }

      const isDigit = /^[0-9]$/.test(e.key) || /^Numpad[0-9]$/.test(e.code);
      if (!isDigit) return;
      const digit = /^[0-9]$/.test(e.key) ? e.key : e.code.replace("Numpad", "");
      const n = parseInt(digit, 10);

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
function PopupRatings({ panel, order, lex, lang }) {
  const [, force] = React.useState(0);

  const pleasantTexts = PLEASANT_SCALE_TEXT[lang] || PLEASANT_SCALE_TEXT.en;

  const scaleMeta = {
    green: {
      min: lex.greenMin, mid: lex.greenMid, max: lex.greenMax,
      choices: Array.from({ length: 11 }, (_, i) => i),
      className: "rating-row rating-row--green", label: lex.greenLabel,
    },
    pleasant: {
      min: pleasantTexts.min,
      mid: pleasantTexts.mid,
      max: pleasantTexts.max,
      choices: [1, 2, 3, 4, 5, 6, 7],
      className: "rating-row rating-row--pleasant",
      label: pleasantTexts.label,
    },
  };

  const getQ = React.useCallback((name) => panel?.getQuestionByName(name), [panel]);
  const hasVal = (q) => q && q.value !== undefined && q.value !== null && q.value !== "";
  const isSelected = (q, n) => String(q?.value) === String(n);
  const setVal = (q, val) => { if (!q || q.readOnly) return; q.value = val; force(v => v + 1); };

  React.useEffect(() => {
    if (!panel) return;
    const s = panel.survey;
    const onValueChanged = (_sender, opt) => {
      if (opt?.name === "green" || opt?.name === "pleasant") force(v => v + 1);
    };
    const onDP = (_sender, opt) => {
      const isDP = opt?.question?.name === "comfort_loop";
      const isThisPanel = opt?.panel === panel;
      if (isDP && isThisPanel && (opt?.name === "green" || opt?.name === "pleasant")) force(v => v + 1);
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
            <span className="scale-label scale-label--min" style={{ gridColumn: '1' }}>{m.min}</span>
            <span className="scale-label scale-label--mid" style={{ gridColumn: name === "green" ? '6' : '4' }}>{m.mid}</span>
            <span className="scale-label scale-label--max" style={{ gridColumn: name === "green" ? '11' : '7' }}>{m.max}</span>
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
    <div className={["rating-group", awaitingSecond ? "awaiting-pleasant" : "", awaitingFirst ? "awaiting-green" : ""].join(" ").trim()}>
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
  const MAX_IMAGES = 60; // NORMAL images only

  const surveyOpenedAtRef = React.useRef(new Date().toISOString());
  const ratingStartRef = React.useRef(null);

  const imageLoadedAtRef = React.useRef(new WeakMap()); // normal
  const trapLoadedAtRef  = React.useRef(new WeakMap()); // trap

  const pendingAdvanceRef = React.useRef(null);
  const waitingForDwellAdvanceRef = React.useRef(new WeakMap());

  const normalRatedCountRef = React.useRef(0);
  const lastTrapIndexRef = React.useRef(0); // <- prevent repeated trap on same nth index

  const trapInfoMapRef = React.useRef(new WeakMap()); // panel -> trap info
  const trapChecksRef = React.useRef([]);             // for survey_metadata

  const [lightbox, setLightbox] = React.useState(null);
  const [lightboxLoaded, setLightboxLoaded] = React.useState(false);
  React.useEffect(() => setLightboxLoaded(false), [lightbox?.src]);

  const lightboxRef = React.useRef(null);
  React.useEffect(() => { lightboxRef.current = lightbox; }, [lightbox]);

  const perfToISO = (t) => new Date(performance.timeOrigin + t).toISOString();

  // Should we show a trap before the upcoming normal?
  const shouldShowTrap = React.useCallback(() => {
    const nextNormalIdx = normalRatedCountRef.current + 1; // 1-based
    if (TRAP_EVERY <= 0) return false;
    if (nextNormalIdx % TRAP_EVERY !== 0) return false;
    if (lastTrapIndexRef.current === nextNormalIdx) return false; // already showed for this index
    lastTrapIndexRef.current = nextNormalIdx; // remember we fired it
    return true;
  }, []);

  // ---------------- rating order + lexicon ----------------

  //Uncomment this to test multiple rating orders
  //const { value: ratingOrderStr, source: ratingOrderSource } = React.useMemo(resolveRatingOrder, []);
  //Comment the next lines and uncomment the previous to test different orders
  const ratingOrderStr = "GP";
  const ratingOrderSource = "forced";
  
  const ratingOrder = ratingOrderStr === "GP" ? ["green", "pleasant"] : ["pleasant", "green"];
  
    
  //Uncomment this to test multiple lexicons
  //const { value: lexVariant, source: lexSource } = React.useMemo(resolveLexicon, []);
  //Comment the next lines and uncomment the previous to test different lexicons
  // Language state (en / fi) with initial value from URL
  const [lang, setLang] = React.useState(resolveLang);  // "en" or "fi"
  const t = STRINGS[lang];

  // Trap images depend on language
  const trapImages = React.useMemo(
    () =>
      lang === "fi"
        ? [
            "/trap/space1_fin.png",
            "/trap/space2_fin.png",
            "/trap/space3_fin.png",
            "/trap/space4_fin.png",
          ]
        : [
            "/trap/space1.png",
            "/trap/space2.png",
            "/trap/space3.png",
            "/trap/space4.png",
          ],
    [lang]
  );


  const lexVariant = "GREEN";
  const lexSource = "forced";


  const lex = LEXMAP[lexVariant][lang];

  const surveyJson = React.useMemo(
    () => buildSurveyForLexicon(lex, lang),
    [lex, lang]
  );

  const model = React.useMemo(() => {
    const m = new Model(surveyJson);

    // Theme + config
    m.applyTheme(themeJson);
    m.title = lang === "fi" ? surveyConfig.title.fin : surveyConfig.title.en;
    m.description = surveyConfig.description;
    m.logo = surveyConfig.logo;
    m.logoPosition = surveyConfig.logoPosition;
    Object.assign(m, surveyConfig.settings || {});
    m.focusFirstQuestionAutomatic = false;
    m.previewText = t.finishSurveyLabel 
    m.showPreviewBeforeComplete = false;
    const defaultNext = m.pageNextText || "Next";
    m.completeText = t.finishSurveyLabel
    m.locale = lang;

    // Hide panel nav UI always (we drive via lightbox)
    const removePanelUI = () => {
      const dp = m.getQuestionByName("comfort_loop");
      if (!dp) return;
      dp.renderMode = "progressTop";
      dp.showNavigationButtons = false;
      dp.allowAddPanel = false; // hide UI; programmatic add still OK
      dp.allowRemovePanel = false;
    };
    removePanelUI();
    m.onCurrentPageChanged.add(removePanelUI);

    // Also strip any DOM bits
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

    // Next button label (based on NORMAL count)
    const setNextLabel = () => {
      const name = m.currentPage?.name;
      if (name === "introPage") m.pageNextText = lang === "fi" ? "Hyväksyn" : "I agree";
      else if (name === "consentPage") m.pageNextText = lang === "fi" ? "Hyväksyn" : "Accept";
      else if (name === "instructionsPage") m.pageNextText = lang === "fi" ? "Aloita kysely" : "Start survey";
      else if (name === "demographics") m.pageNextText = lang === "fi" ? "Jatka arviointiin" : "Continue to rating";
      else if (name === "comfort_loop_page") {
        m.pageNextText =
          normalRatedCountRef.current >= MAX_IMAGES
            ? t.finishSurveyLabel
            : t.finishRatingLabel;
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
      } catch {}
    };
    const preloadNext = (n = 2) => { for (let i = 0; i < n && i < imageQueue.length; i++) preloadLocal(imageQueue[i]); };
    m.__preloadNext = preloadNext;
    preloadNext(2);

    const nextImage = () => (imageQueue.length ? imageQueue.shift() : "");

    // Normal view: click opens lightbox; stamp dwell start
    m.onAfterRenderQuestion.add((_sender, options) => {
      if (options.question.name === "green" || options.question.name === "pleasant") return;
      if (options.question.name !== "image") return;

      const img = options.htmlElement.querySelector("img");
      if (!img) return;
      const panel = options.question.parent;

      img.style.cursor = "zoom-in";
      img.onclick = () => openLightboxForPanel(panel);

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

      const markLoaded = () => {
        if (!imageLoadedAtRef.current.get(panel)) {
          const nowPerf = performance.now();
          imageLoadedAtRef.current.set(panel, nowPerf);
          const qLoaded = panel.getQuestionByName("image_loaded_at");
          if (qLoaded && !qLoaded.value) qLoaded.value = new Date(performance.timeOrigin + nowPerf).toISOString();
        }
      };
      if (img.complete) markLoaded(); else img.addEventListener("load", markLoaded, { once: true });
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
      if (imgQ) { imgQ.imageLink = url; imgQ.locImageLink?.onChanged?.(); }
      if (hidden) hidden.value = url;
      m.__preloadNext?.(2);
    });

    // Seed each new panel
    m.onDynamicPanelAdded.add((_sender, opt) => {
      if (opt.question.name !== "comfort_loop") return;
      const panel = opt.panel;

      const url = nextImage();
      const imgQ = panel.getQuestionByName("image");
      if (imgQ) { imgQ.imageLink = url; imgQ.locImageLink?.onChanged?.(); }
      const hidden = panel.getQuestionByName("imageUrl");
      if (hidden) hidden.value = url;
      m.__preloadNext?.(2);
    });

    // Programmatic advance (do NOT gate on allowAddPanel)
    const doAdvanceFromPanel = (panel) => {
      const dp = m.getQuestionByName("comfort_loop");
      const wasOpen = !!lightboxRef.current;
      const hasExistingNext = dp.currentIndex < dp.panels.length - 1;

      if (hasExistingNext) {
        dp.currentIndex = dp.currentIndex + 1;
        if (wasOpen) {
          const nextPanel = dp.panels[dp.currentIndex];
          openLightboxForPanel(nextPanel);
        }
        return;
      }

      if (imageQueue.length > 0) {
        m.__preloadNext?.(2);
        dp.addPanel();
        setTimeout(() => {
          dp.currentIndex = dp.currentIndex + 1;
          const nextPanel = dp.panels[dp.currentIndex];
          if (wasOpen) openLightboxForPanel(nextPanel);
        }, 100);
      } else {
        dp.allowAddPanel = false;    // optional: hard-stop any more panels
        setLightbox(null);           // close lightbox
        alert(t.finishRatingAlert(MAX_IMAGES)); 
      }
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

        if (!ratingStartRef.current) ratingStartRef.current = new Date().toISOString();

        const dp = opt.question;
        const panel = opt.panel;
        if (!panel) return;

        if (opt.name === "green") {
          const q = panel.getQuestionByName("green_rated_at");
          if (q && !q.value) q.value = new Date().toISOString();
        }
        if (opt.name === "pleasant") {
          const q = panel.getQuestionByName("pleasant_rated_at");
          if (q && !q.value) q.value = new Date().toISOString();
        }

        const { ok } = bothAnswered(panel);
        if (ok) {
          const both = panel.getQuestionByName("both_rated_at");
          if (both && !both.value) both.value = new Date().toISOString();
        }

        if (!ok) {
          waitingForDwellAdvanceRef.current.delete(panel);
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        const trapInfo = trapInfoMapRef.current.get(panel);
        const loadedAtPerf = trapInfo ? trapLoadedAtRef.current.get(panel) : imageLoadedAtRef.current.get(panel);
        if (!loadedAtPerf) {
          waitingForDwellAdvanceRef.current.set(panel, true);
          if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);
          return;
        }

        const elapsed = performance.now() - loadedAtPerf;
        const remaining = Math.max(0, MIN_DWELL_MS - elapsed);

        waitingForDwellAdvanceRef.current.set(panel, true);
        if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current);

        pendingAdvanceRef.current = setTimeout(() => {
          const cur = dp.panels[dp.currentIndex];
          if (cur === panel && waitingForDwellAdvanceRef.current.get(panel)) {
            waitingForDwellAdvanceRef.current.delete(panel);

            if (!trapInfo) {
              const bothISO = panel.getQuestionByName("both_rated_at")?.value;
              if (bothISO) {
                const dwellField = panel.getQuestionByName("dwell_ms");
                if (dwellField && !dwellField.value) {
                  const dwellMs = Math.max(0, Math.round(new Date(bothISO).getTime() - (performance.timeOrigin + loadedAtPerf)));
                  dwellField.value = dwellMs;
                }
              }
            }

            onPanelComplete(panel);
          }
        }, remaining);
      };

      if (mm.onDynamicPanelValueChanged) mm.onDynamicPanelValueChanged.add(handler);
      else if (mm.onDynamicPanelItemValueChanged) mm.onDynamicPanelItemValueChanged.add(handler);
    };

    const onPanelComplete = (panel) => {
      const trapInfo = trapInfoMapRef.current.get(panel);
      if (trapInfo) {
        const qG = panel.getQuestionByName("green");
        const qP = panel.getQuestionByName("pleasant");
        const bothISO = panel.getQuestionByName("both_rated_at")?.value;

        const tLoaded = trapLoadedAtRef.current.get(panel);
        const basePerf = typeof tLoaded === "number" ? tLoaded : imageLoadedAtRef.current.get(panel);
        let dwellMs = null;
        if (basePerf && bothISO) {
          dwellMs = Math.max(0, Math.round(new Date(bothISO).getTime() - (performance.timeOrigin + basePerf)));
        }

        trapChecksRef.current.push({
          sequence_index: trapInfo.seq,
          trap_image: trapInfo.trapUrl,
          opened_at: trapInfo.opened_at,
          both_rated_at: bothISO || null,
          green: qG?.value ?? null,
          pleasant: qP?.value ?? null,
          dwell_ms: dwellMs,
          panel_id: panel.id,
          underlying_image: panel.getQuestionByName("imageUrl")?.value || null,
        });

        // Clear so trap answers don't pollute normal responses
        if (qG) qG.value = null;
        if (qP) qP.value = null;

        trapInfoMapRef.current.delete(panel);
      } else {
        normalRatedCountRef.current += 1; // ONLY normal images count
      }

      if (normalRatedCountRef.current >= MAX_IMAGES) {
        const dp = m.getQuestionByName("comfort_loop");
        dp.allowAddPanel = false;
        setLightbox(null);
        //m.pageNextText = "Finish rating";
        alert(t.finishRatingAlert(MAX_IMAGES));
        return;
      }

      doAdvanceFromPanel(panel);
    };

    hookDynamic(m);

    // Save completion (attach rating order + lexicon metadata + trap checks)
    m.onComplete.add(async (survey) => {
      const responses = survey.data;
      const completeData = {
        responses,
        displayed_images: displayedImages,
        survey_metadata: {
          survey_opened_at: surveyOpenedAtRef.current,
          completion_time: new Date().toISOString(),
          rating_started_at: ratingStartRef.current,
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          survey_version: "1.0",
          rating_order: ratingOrderStr,
          rating_order_source: ratingOrderSource,
          lexicon_variant: lexVariant,
          lexicon_source: lexSource,
          rated_images_count: normalRatedCountRef.current, // NORMAL only
          max_images_cap: MAX_IMAGES,
          trap_every: TRAP_EVERY,
          trap_checks: trapChecksRef.current,
        },
      };
      const result = await saveSurveyResponse(completeData);
      if (result.success) {
        alert(t.saveSuccess);
      } else {
        console.error("Failed to save survey response:", result.error);
        alert(t.saveError);
      }
    });

    // Expose some debug meta
    m.__meta = { ...(m.__meta || {}), ratingOrderStr, ratingOrderSource, lexVariant, lexSource };

    /* --------- Lightbox opener lives here so it can use shouldShowTrap() --------- */
    function openLightboxForPanel(panel) {
      if (!panel) return;
      const imgQ = panel.getQuestionByName("image");
      const normalSrc = imgQ?.imageLink || "";

      // Trap as interstitial on exact Nth upcoming normal
      if (shouldShowTrap()) {
        const trapUrl = pickRandomTrap(trapImages);
        if (trapUrl) {
          const qOpen = panel.getQuestionByName("lightbox_opened_at");
          if (qOpen && !qOpen.value) qOpen.value = new Date().toISOString();
          const info = {
            trapUrl,
            seq: normalRatedCountRef.current + 1, // 5, 10, 15...
            opened_at: new Date().toISOString(),
          };
          trapInfoMapRef.current.set(panel, info);
          setLightbox({ src: trapUrl, panel, isTrap: true });
          return;
        }
      }

      if (normalSrc) {
        const qOpen = panel.getQuestionByName("lightbox_opened_at");
        if (qOpen && !qOpen.value) qOpen.value = new Date().toISOString();
        setLightbox({ src: normalSrc, panel, isTrap: false });
      }
    }
    // expose to outer closures
    window.__openLightboxForPanel = openLightboxForPanel;

    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyJson, ratingOrderStr, ratingOrderSource, lexVariant, lexSource, shouldShowTrap, lang, trapImages]);

  // bridge to the lightbox opener stored in window (within the memo above)
  const openLightboxForPanel = React.useCallback((panel) => {
    if (typeof window.__openLightboxForPanel === "function") {
      window.__openLightboxForPanel(panel);
    }
  }, []);

  React.useEffect(() => {
    return () => { if (pendingAdvanceRef.current) clearTimeout(pendingAdvanceRef.current); };
  }, []);

  return (
    <>
      <style>{hideNormalRatingsStyle}</style>

      <div className="survey-wrapper">
        <Survey model={model} />

        <div className="lang-switcher">
          <label>
            <span style={{ marginRight: "0.5rem" }}>
              {lang === "fi" ? "Kieli:" : "Language:"}
            </span>
            <select
              value={lang}
              onChange={(e) => {
                const newLang = e.target.value;
                if (newLang === lang) return;

                const ok = window.confirm(
                  lang === "fi"
                    ? "Kielen vaihtaminen aloittaa kyselyn alusta. Haluatko jatkaa?"
                    : "Changing language will restart the survey. Continue?"
                );
                if (!ok) return;

                setLang(newLang);
                const url = new URL(window.location.href);
                url.searchParams.set("lang", newLang);
                window.history.replaceState({}, "", url.toString());
              }}
            >
              <option value="en">English</option>
              <option value="fi">Suomi</option>
            </select>
          </label>
        </div>
      </div>

      <KeyboardRatings model={model} lightbox={lightbox} order={ratingOrder} />

      {lightbox && (
        <div className="lightbox-overlay" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className={`lightbox-media ${lightboxLoaded ? "is-loaded" : ""}`}>
              <img
                className="lightbox-img"
                src={lightbox.src}
                alt=""
                decoding="async"
                fetchPriority="high"
                onLoad={() => {
                  setLightboxLoaded(true);
                  if (lightbox.isTrap && lightbox.panel) {
                    trapLoadedAtRef.current.set(lightbox.panel, performance.now());
                  }
                }}
              />
              
            </div>

            {/* Ratings are ONLY rendered inside the lightbox */}
            <PopupRatings panel={lightbox.panel} order={ratingOrder} lex={lex} lang={lang} />

            <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">×</button>
          </div>
        </div>
      )}
    </>
  );
}
