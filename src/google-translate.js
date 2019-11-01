// Description:
//   Allows Hubot to know many languages.
//
// Configuration:
//   HUBOT_GOOGLE_TRANSLATE_API_KEY - API key from Google Cloud Console with access to the Cloud Translation API.
//
// Commands:
//   hubot translate me <phrase> - Searches for a translation for the <phrase> and then prints that bad boy out.
//   hubot translate me from <source> into <target> <phrase> - Translates <phrase> from <source> into <target>. Both <source> and <target> are optional

const languages = {
  af: 'Afrikaans',
  sq: 'Albanian',
  ar: 'Arabic',
  az: 'Azerbaijani',
  eu: 'Basque',
  bn: 'Bengali',
  be: 'Belarusian',
  bg: 'Bulgarian',
  ca: 'Catalan',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  eo: 'Esperanto',
  et: 'Estonian',
  tl: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  gl: 'Galician',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  iw: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  is: 'Icelandic',
  id: 'Indonesian',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ko: 'Korean',
  la: 'Latin',
  lv: 'Latvian',
  lt: 'Lithuanian',
  mk: 'Macedonian',
  ms: 'Malay',
  mt: 'Maltese',
  no: 'Norwegian',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sr: 'Serbian',
  sk: 'Slovak',
  sl: 'Slovenian',
  es: 'Spanish',
  sw: 'Swahili',
  sv: 'Swedish',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  cy: 'Welsh',
  yi: 'Yiddish'
}

const getCode = (language, languages) => {
  for (const code in languages) {
    const lang = languages[code]
    if (lang.toLowerCase() === language.toLowerCase()) {
      return code
    }
  }
}

module.exports = robot => {
  const languageChoices = Object.values(languages)
    .sort()
    .join('|')

  const pattern = new RegExp(
    'translate(?: me)?' +
      `(?: from (${languageChoices}))?` +
      `(?: (?:in)?to (${languageChoices}))?` +
      '(.*)',
    'i'
  )

  robot.respond(pattern, msg => {
    const term = msg.match[3] && msg.match[3].trim()
    const key = process.env.HUBOT_GOOGLE_TRANSLATE_API_KEY
    const origin = msg.match[1] ? getCode(msg.match[1], languages) : 'auto'
    const target = msg.match[2] ? getCode(msg.match[2], languages) : 'en'

    if (!key) {
      msg.send(
        `I can't do that, Dave... because I don't have the HUBOT_GOOGLE_TRANSLATE_API_KEY environment variable set.`
      )
      return
    }

    if (!term) {
      msg.send('Translate what?')
      return
    }

    msg
      .http('https://translation.googleapis.com/language/translate/v2')
      .query({
        key,
        origin,
        target,
        format: 'text',
        q: term
      })
      .get()((err, res, body) => {
        if (err) {
          msg.send('Failed to connect to Google Translate API')
          robot.emit('error', err, res)
          return
        }

        if (body.data && body.data.translations[0]) {
          const {
            translatedText,
            detectedSourceLanguage
          } = body.data.translations[0]

          const language = languages[detectedSourceLanguage]
          const translation = translatedText.trim()

          if (msg.match[2] == null) {
            msg.send(`${term} is ${translation} in ${language}`)
          } else {
            msg.send(
              `The ${language} ${term} translates as ${translation} in ${
                languages[target]
              }`
            )
          }
        } else {
          msg.send('The Google Translate API returned something unexpected.')
        }
      })
  })
}
