export const homeCopy = {
  pathStrip: {
    heading: { en: 'Choose your path', es: 'Elige tu camino' },
    paths: [
      {
        id: 'legal-aid' as const,
        label: { en: "I can't afford a lawyer", es: 'No puedo pagar un abogado' },
        href: '/start?path=legal-aid',
      },
      {
        id: 'smb' as const,
        label: { en: 'I run a small business', es: 'Tengo un pequeño negocio' },
        href: '/start?path=smb',
      },
      {
        id: 'organization' as const,
        label: { en: 'I work with a legal-aid/pro bono organization', es: 'Trabajo con una organización de ayuda legal/pro bono' },
        href: '/for-organizations',
      },
    ],
  },
  whatHappensNext: {
    heading: { en: 'What happens next', es: 'Qué pasa después' },
    steps: [
      { number: 1, text: { en: 'Tell us what is happening.', es: 'Cuéntanos qué está pasando.' } },
      { number: 2, text: { en: 'We check urgency, location, language, and cost options.', es: 'Verificamos urgencia, ubicación, idioma y opciones de costo.' } },
      { number: 3, text: { en: 'You get plain-language next steps and human help options.', es: 'Recibes próximos pasos en lenguaje simple y opciones de ayuda humana.' } },
    ],
  },
  trustProof: {
    claims: [
      { text: { en: 'Not a law firm', es: 'No somos un bufete' } },
      { text: { en: 'Legal information, not legal advice', es: 'Información legal, no asesoría legal' } },
      { text: { en: 'Privacy-first intake', es: 'Intake con privacidad primero' } },
      { text: { en: 'Human help options', es: 'Opciones de ayuda humana' } },
      { text: { en: 'Spanish and English support', es: 'Soporte en español e inglés' } },
    ],
  },
  pricingPreview: {
    heading: { en: 'Start free. Pay only when you choose extra help.', es: 'Empieza gratis. Paga solo cuando elijas ayuda extra.' },
    subline: { en: 'No retainers. No hidden fees. No surprises.', es: 'Sin anticipos. Sin cargos ocultos. Sin sorpresas.' },
    disclaimer: { en: 'You will see any cost before you pay.', es: 'Verás cualquier costo antes de pagar.' },
  },
};
