// surveyTranslations.js

export const SURVEY_TEXT = {
  /* =========================================================
     SURVEY-LEVEL TEXTS
     ========================================================= */
  survey_title: {
    en: "Urban {greenLabel} Survey",
    fi: "Kaupunkien {greenLabel}-kysely",
  },
  survey_description: {
    en: "This survey helps us understand how people perceive different street environments. Your responses will help improve urban design.",
    fi: "Tämän kyselyn avulla selvitämme, miten ihmiset kokevat erilaisia kaupunkiympäristöjä. Vastauksesi auttavat parantamaan kaupunkisuunnittelua.",
  },
  survey_startSurveyText: {
    en: "Start Survey",
    fi: "Aloita kysely",
  },

  /* =========================================================
     PAGE TITLES / DESCRIPTIONS
     ========================================================= */
  page_demographics_title: {
    en: "Part 1: Background Information",
    fi: "Osa 1: Taustatiedot",
  },
  page_demographics_description: {
    en: "Please tell us a bit about yourself.",
    fi: "Kerro hieman itsestäsi.",
  },

  page_comfort_title: {
    en: "{greenLabel} rating",
    fi: "{greenLabel}-arviointi",
  },

  page_feedback_title: {
    en: "Survey feedback",
    fi: "Kyselyn palaute",
  },
  page_feedback_description: {
    en: "Please tell us briefly how you felt while completing the survey. All questions are optional and can be skipped.",
    fi: "Kerro lyhyesti miltä kyselyyn vastaaminen tuntui. Kaikki kysymykset ovat vapaaehtoisia.",
  },

  /* =========================================================
     INTRO / INSTRUCTIONS / COMPLETED HTML
     (use {greenLabel}, {greenLabelLower}, {greenMin}, {greenMax})
     ========================================================= */
  intro_html: {
    en: `
      <img src="into_image.png" alt="banner image" />
      <h2>Welcome to the Street {greenLabel} Survey</h2>
      <b>Before you begin, please read the following information:</b>
      <p>This study, conducted by the Digital Geography Lab of the University of Helsinki, is part of the GREENTRAVEL project (2023–2027) funded by the European Research Council (ERC, 101044906). It explores the use of street view images to capture the importance of {greenLabelLower} in people’s perception of street environments. The findings are expected to inform transportation and green infrastructure planning.</p>
      <b>You can read more here (click the link to open):</b>
      <p></p>
      <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel">GREENTRAVEL</a>
      <p></p>
      <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab">Digital Geography Lab</a>
      <p></p>
      <a href="https://www.helsinki.fi/en">University of Helsinki</a>
      <p></p>

      <b>The survey comprises of three parts. It should take approximately 10–20 minutes to complete.</b>
      <p>We will collect, analyze, publish, and store your data confidentially and anonymously under the EU GDPR. Full notice: <a href="https://a3s.fi/swift/v1/AUTH_b76bb3a5f80349d9acabe9cd285f7497/survey_elements/Survey_Privacy_Notice_English.pdf">Data and privacy notice</a></p>
      <p>At the end of the survey, you will have the opportunity to enter your email address for a chance to win movie tickets.</p>
      <p>Questions? Email the responsible researcher Jussi Torkko (jussi.torkko[at]helsinki.fi)</p>
      <h5>By continuing, you confirm: (1) you understand the purpose, (2) participation is voluntary, and (3) you are at least 18 years old.</h5>
    `,
    fi: `
      <img src="into_image.png" alt="banner image" />
      <h2>Tervetuloa katutasovihreys-kyselyyn</h2>
      <b>Ennen kuin aloitat, luethan seuraavat tiedot:</b>
      <p>Tämä tutkimus on Helsingin yliopiston Digital Geography Lab -tutkimusryhmän toteuttama ja osa GREENTRAVEL-hanketta (2023–2027), jota rahoittaa Euroopan tutkimusneuvosto (ERC, 101044906). Tutkimuksessa tarkastellaan katunäkymäkuvia ja sitä, miten katutasovihreys koetaan kaupunkiympäristöissä. Tuloksia voidaan hyödyntää liikenne- ja viherverkostojen suunnittelussa.</p>
      <b>Lisätietoa löydät täältä (paina linkkiä avataksesi):</b>
      <p></p>
      <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel">GREENTRAVEL</a>
      <p></p>
      <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab">Digital Geography Lab</a>
      <p></p>
      <a href="https://www.helsinki.fi/en">Helsingin yliopisto</a>
      <p></p>

      <b>Kysely koostuu kolmesta osasta ja sen täyttämiseen kuluu noin 10–15 minuuttia.</b>
      <p>Vastauksesi kerätään, analysoidaan, julkaistaan ja säilytetään luottamuksellisesti ja anonyymisti EU:n tietosuoja-asetuksen (GDPR) mukaisesti. Täysi tietosuojaseloste: <a href="https://a3s.fi/swift/v1/AUTH_b76bb3a5f80349d9acabe9cd285f7497/survey_elements/Survey_Privacy_Notice_English.pdf">Tieto- ja tietosuojailmoitus (englanniksi)</a></p>
      <p>Kyselyn lopussa voit halutessasi jättää sähköpostiosoitteesi osallistuaksesi elokuvalippujen arvontaan.</p>
      <p>Kysyttävää? Ota yhteyttä tutkimuksen vetäjään: Jussi Torkko (jussi.torkko[at]helsinki.fi)</p>
      <h5>Jatkamalla eteenpäin vahvistat, että (1) ymmärrät tutkimuksen tarkoituksen, (2) tiedostat että osallistuminen on vapaaehtoista ja (3) olet vähintään 18-vuotias.</h5>
    `,
  },

  instructions_html: {
    en: `
      <h2>Instructions</h2>
      <p>In the first part you’ll answer a few background questions. Then you will rate a series of street images.</p>
      <p>You will be shown different images. <b>Consider the scene as it appears in the picture (do not imagine other seasons or conditions).</b> Please answer the following for each image:</p>
      <p><b>{greenLabel}:</b>
        <i>How much {greenLabelLower}, as in visible vegetation, do you see in the image, based on your own estimation?</i>
        <br/>{greenMin} … 5 = half of the view is green … {greenMax}</p>
      <p><b>Pleasantness:</b>
        <i>How pleasant is the scene in the image as a whole to you?</i>
        <br/>1 = Very unpleasant … 4 = neither pleasant or unpleasant … 7 = Very pleasant</p>
      <p>After answering both questions, the next image will appear automatically.</p>
      <p>Click an image to start rating. You can also use the keyboard numbers: Backspace corrects the last rating. Press F11 to enter/exit full screen. Click the "x" in the top right corner or outside of the white rating area to exit the rating. Press Finish rating whenever you want to stop.</p>
      <img src="rating_instructions.png" alt="instruction image" />
      <p><strong>To complete the survey, please rate images for approximately 10 minutes. After the final image, you will be prompted to move to the next section. Finally you will answer some feedback questions and can finish.</strong></p>
    `,
    fi: `
      <h2>Ohjeet</h2>
      <p>Kyselyn ensimmäisessä osassa vastaat muutamiin taustakysymyksiin. Sen jälkeen pääset tarkastelemaan katutasokuvia.</p>
      <p>Sinulle esitetään erilaisia kuvia. <b>Arvioi näkymää sellaisena kuin se kuvassa näkyy (älä kuvittele esimerkiksi eri vuodenaikoja tai olosuhteita).</b> Vastaa jokaiseen kuvaan seuraavasti:</p>
      <p><b>{greenLabel}:</b>
        <i>Kuinka paljon vihreyttä, eli näkyvää kasvillisuutta näet kuvassa oman arviosi mukaan?</i>
        <br/>{greenMin} … 5 = puoliksi vihreä näkymä … {greenMax}</p>
      <p><b>Miellyttävyys:</b>
        <i>Kuinka miellyttävänä koet kuvan maiseman kokonaisuutena?</i>
        <br/>1 = Erittäin epämiellyttävä … 4 = ei miellyttävä eikä epämiellyttävä … 7 = Erittäin miellyttävä</p>
      <p>Kun olet vastannut molempiin kysymyksiin, seuraava kuva avautuu automaattisesti.</p>
      <p>Paina ensimmäistä kuvaa aloittaaksesi arvioinnin. Voit käyttää myös näppäimistön numeroita: askelpalautin korjaa viimeisimmän arvion. Paina F11 päästäksesi tai poistuaksesi selaimen koko näytön tilasta. Paina oikean yläkulman ruksia tai valkoisen arviointialueen ulkopuolelle poistuaksesi arvioinneista. Voit lopettaa milloin tahansa painamalla Lopeta arviointi-painiketta.</p>
      <img src="rating_instructions.png" alt="ohjekuva" />
      <p><strong>Jotta saamme riittävästi vastauksia, pyydämme sinua arvioimaan kuvia noin 10 minuuttia. Viimeisen kuvan jälkeen kysely ohjaa sinut automaattisesti seuraavaan osioon. Tämän jälkeen vastaat lyhyeeseen palautekyselyyn ja voit lopettaa kyselyn.</strong></p>
    `,
  },

  while_rating_html: {
    en: `
      <p>Please rate images for the requested time. Click an image to start rating. You can also use the keyboard numbers: Backspace corrects the last rating. Press F11 to enter/exit full screen. Click the "x" in the top right corner or outside of the white rating area to exit the rating. Press Finish rating whenever you want to stop.</p>
      <ul style="list-style:none;padding-left:0;">
        <li><b>{greenLabel}:</b> How much {greenLabelLower}, as in visible vegetation, do you see?</li>
        <li><b>Pleasantness:</b> How pleasant do you find the scene in the image as a whole?</li>
      </ul>
    `,
    fi: `
      <p>Arvioi kuvia pyydetty määrä. Paina ensimmäistä kuvaa aloittaaksesi arvioinnin. Voit käyttää myös näppäimistön numeroita: askelpalautin korjaa viimeisimmän arvion. Paina F11 päästäksesi tai poistuaksesi selaimen koko näytön tilasta. Paina oikean yläkulman ruksia tai valkoisen arviointialueen ulkopuolelle poistuaksesi arvioinneista. Voit lopettaa milloin tahansa painamalla Lopeta arviointi-painiketta.</p>
      <ul style="list-style:none;padding-left:0;">
        <li><b>{greenLabel}:</b> Kuinka paljon vihreyttä, eli näkyvää kasvillisuutta näet kuvassa?</li>
        <li><b>Miellyttävyys:</b> Kuinka miellyttävänä koet kuvan maiseman kokonaisuutena?</li>
      </ul>
    `,
  },

  completed_html: {
    en: `
      <h3>Thank you for your participation!</h3>
      <h4>
        <a href="https://elomake.helsinki.fi/lomakkeet/138006/lomake.html" style="color:#0911f9;">
          Click here to input your email to join the raffle (movie tickets).
        </a>
      </h4> 
      <h4>
        If you have any questions, you can contact the responsible researcher at
        <b>jussi.torkko[at]helsinki.fi</b>.
      </h4>
      <h4>
        <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel" style="color:#16a34a;">
          Click here to be redirected to the GREENTRAVEL project website.
        </a>
      </h4>
    `,
    fi: `
      <h3>Kiitos osallistumisestasi!</h3>
      <h4>
        <a href="https://elomake.helsinki.fi/lomakkeet/138006/lomake.html" style="color:#0911f9;">
          Klikkaa tästä ja jätä sähköpostiosoitteesi osallistuaksesi elokuvalippujen arvontaan.
        </a>
      </h4> 
      <h4>
        Jos sinulla on kysyttävää, voit olla yhteydessä tutkimuksen vetäjään 
        <b>jussi.torkko[at]helsinki.fi</b>.
      </h4>
      <h4>
        <a href="https://www.helsinki.fi/en/researchgroups/digital-geography-lab/projects/greentravel" style="color:#16a34a;">
          Klikkaa tästä siirtyäksesi GREENTRAVEL-hankkeen verkkosivuille.
        </a>
      </h4>
    `,
  },

  /* =========================================================
     DEMOGRAPHICS QUESTIONS
     ========================================================= */
  q_gender_title: {
    en: "What is your gender identity?",
    fi: "Mikä on sukupuoli-identiteettisi?",
  },
  q_gender_choices: {
    en: ["Female", "Male", "Other", "Prefer not to say"],
    fi: ["Nainen", "Mies", "Muu", "En halua kertoa"],
  },

  q_age_title: {
    en: "What is your age group?",
    fi: "Mihin ikäryhmään kuulut?",
  },
  q_age_choices: {
    en: [
      "Under 18",
      "18-24",
      "25-34",
      "35-44",
      "45-54",
      "55-64",
      "65 or older",
    ],
    fi: [
      "Alle 18",
      "18–24",
      "25–34",
      "35–44",
      "45–54",
      "55–64",
      "65 tai vanhempi",
    ],
  },

  q_home_country_title: {
    en: "Where are you from? (Country)",
    fi: "Mistä olet kotoisin? (maa)",
  },
  q_current_country_title: {
    en: "Where are you currently living? (Country)",
    fi: "Missä asut tällä hetkellä? (maa)",
  },

  q_income_title: {
    en: "What is your household monthly income level?",
    fi: "Mikä on kotitaloutesi kuukausittainen tulotaso?",
  },
  q_income_choices: {
    en: [
      "Less than €1500",
      "€1500 - €2500",
      "€2501 - €3500",
      "€3501 - €4500",
      "€4501 - €6000",
      "Over €6000",
      "Prefer not to say",
    ],
    fi: [
      "Alle 1500 €",
      "1500–2500 €",
      "2501–3500 €",
      "3501–4500 €",
      "4501–6000 €",
      "Yli 6000 €",
      "En halua kertoa",
    ],
  },

  q_education_title: {
    en: "What is your highest level of education?",
    fi: "Mikä on korkein suorittamasi koulutusaste?",
  },
  q_education_choices: {
    en: [
      "Secondary education",
      "Upper secondary education",
      "Trade/technical/vocational training",
      "Bachelor's degree",
      "Master's degree",
      "Doctoral degree",
      "Other",
      "Prefer not to say",
    ],
    fi: [
      "Perusopetus",
      "Toinen aste (lukio/ammattikoulu)",
      "Ammatillinen koulutus",
      "Alempi korkeakoulututkinto",
      "Ylempi korkeakoulututkinto",
      "Tohtorintutkinto",
      "Muu",
      "En halua kertoa",
    ],
  },

  q_outdoor_activity_title: {
    en: "Do you consider yourself part of nature? From the picture above, choose which corresponds best to your relationship with nature.",
    fi: "Koetko olevasi osa luontoa? Valitse yllä olevasta kuvasta se, joka parhaiten kuvaa suhdettasi luontoon.",
  },

  /* =========================================================
     FEEDBACK QUESTIONS
     ========================================================= */
  q_background_title: {
    en: "How clear was the background of the survey and the description of consent given?",
    fi: "Kuinka selkeä on tutkimuksen tausta ja tiedot suostumuksesta?",
  },
  q_background_choices: {
    en: [
      "Very unclear",
      "Somewhat unclear",
      "Neither clear nor unclear",
      "Somewhat clear",
      "Very clear",
      "Prefer not to say",
    ],
    fi: [
      "Erittäin epäselvä",
      "Jossain määrin epäselvä",
      "Ei selkeä eikä epäselvä",
      "Jossain määrin selkeä",
      "Erittäin selkeä",
      "En halua kertoa",
    ],
  },

  q_instructions_title: {
    en: "How clear were the instructions of the survey?",
    fi: "Kuinka selkeät kyselyn ohjeet olivat?",
  },
  q_instructions_choices: {
    en: [
      "Very unclear",
      "Somewhat unclear",
      "Neither clear nor unclear",
      "Somewhat clear",
      "Very clear",
      "Prefer not to say",
    ],
    fi: [
      "Erittäin epäselvät",
      "Jossain määrin epäselvät",
      "Ei selkeät eikä epäselvät",
      "Jossain määrin selkeät",
      "Erittäin selkeät",
      "En halua kertoa",
    ],
  },

  q_rating_ease_title: {
    en: "How easy was the rating platform to use?",
    fi: "Kuinka helppokäyttöisenä koit kuvien arviointialustan?",
  },
  q_rating_ease_choices: {
    en: [
      "Very difficult",
      "Somewhat difficult",
      "Neither difficult nor easy",
      "Somewhat easy",
      "Very easy",
      "Prefer not to say",
    ],
    fi: [
      "Erittäin vaikea",
      "Jossain määrin vaikea",
      "Ei vaikea eikä helppo",
      "Jossain määrin helppo",
      "Erittäin helppo",
      "En halua kertoa",
    ],
  },

  q_length_feel_title: {
    en: "How did you feel about the length of the survey?",
    fi: "Miltä kyselyn pituus sinusta tuntui?",
  },
  q_length_feel_choices: {
    en: [
      "Too long",
      "Somewhat long",
      "Neither long nor short",
      "Somewhat short",
      "Too short",
      "Prefer not to say",
    ],
    fi: [
      "Liian pitkä",
      "Melko pitkä",
      "Ei pitkä eikä lyhyt",
      "Melko lyhyt",
      "Liian lyhyt",
      "En halua kertoa",
    ],
  },

  q_benefits_title: {
    en: "Is it clear to you what the benefits of the survey are?",
    fi: "Ovatko kyselyn mahdolliset hyödyt sinulle selviä?",
  },
  q_benefits_choices: {
    en: [
      "Very unclear",
      "Somewhat unclear",
      "Neither clear nor unclear",
      "Somewhat clear",
      "Very clear",
      "Prefer not to say",
    ],
    fi: [
      "Erittäin epäselvä",
      "Jossain määrin epäselvä",
      "Ei selkeä eikä epäselvä",
      "Jossain määrin selkeä",
      "Erittäin selkeä",
      "En halua kertoa",
    ],
  },

  q_ai_title: {
    en: "Did you notice AI generated features within the images shown?",
    fi: "Huomasitko tekoälyn tuottamia piirteitä esitetyissä kuvissa?",
  },
  q_ai_choice_no: {
    en: "No",
    fi: "En",
  },
  q_ai_otherText: {
    en: "Yes",
    fi: "Kyllä",
  },
  q_ai_otherPlaceholder: {
    en: "Please describe what made you consider some of the images to be AI generated",
    fi: "Kuvaile, mikä sai sinut ajattelemaan joidenkin kuvien olevan tekoälyllä tuotettuja",
  },
  q_ai_otherErrorText: {
    en: "Please specify your answer",
    fi: "Täsmennä vastauksesi",
  },

  q_open_feedback_title: {
    en: "Open feedback or any additional comments and remarks regarding the previous questions?",
    fi: "Avoin palaute tai muita kommentteja liittyen aiempiin kysymyksiin?",
  },
};

/* =========================================================
   Helpers
   ========================================================= */

export function t(lang, key) {
  const entry = SURVEY_TEXT[key];
  if (!entry) return "";
  return entry[lang] ?? entry.en ?? "";
}

export function tmpl(value, vars) {
  if (typeof value !== "string") return value;
  return value.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`
  );
}
