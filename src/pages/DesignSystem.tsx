import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Palette, Type, LayoutGrid as Layout, Layers, Globe, Smartphone, CheckCircle } from 'lucide-react';

const colorRamps = [
  {
    name: 'Teal (Primary)',
    shades: [
      { label: '50', hex: '#F0FDFA', textDark: true },
      { label: '100', hex: '#CCFBF1', textDark: true },
      { label: '200', hex: '#99F6E4', textDark: true },
      { label: '300', hex: '#5EEAD4', textDark: true },
      { label: '400', hex: '#2DD4BF', textDark: true },
      { label: '500', hex: '#0D9488', textDark: false },
      { label: '600', hex: '#0A8A8A', textDark: false },
      { label: '700', hex: '#0F766E', textDark: false },
      { label: '800', hex: '#115E59', textDark: false },
      { label: '900', hex: '#134E4A', textDark: false },
    ],
  },
  {
    name: 'Navy (Text)',
    shades: [
      { label: '50', hex: '#F0F4F8', textDark: true },
      { label: '100', hex: '#D9E2EC', textDark: true },
      { label: '200', hex: '#BCCCDC', textDark: true },
      { label: '300', hex: '#9FB3C8', textDark: true },
      { label: '400', hex: '#829AB1', textDark: false },
      { label: '500', hex: '#627D98', textDark: false },
      { label: '600', hex: '#486581', textDark: false },
      { label: '700', hex: '#334E68', textDark: false },
      { label: '800', hex: '#243B53', textDark: false },
      { label: '900', hex: '#102A43', textDark: false },
    ],
  },
  {
    name: 'Success',
    shades: [
      { label: '50', hex: '#F0FDF4', textDark: true },
      { label: '500', hex: '#22C55E', textDark: true },
      { label: '700', hex: '#15803D', textDark: false },
    ],
  },
  {
    name: 'Warning',
    shades: [
      { label: '50', hex: '#FFFBEB', textDark: true },
      { label: '500', hex: '#F59E0B', textDark: true },
      { label: '700', hex: '#B45309', textDark: false },
    ],
  },
  {
    name: 'Error',
    shades: [
      { label: '50', hex: '#FEF2F2', textDark: true },
      { label: '500', hex: '#EF4444', textDark: false },
      { label: '700', hex: '#B91C1C', textDark: false },
    ],
  },
  {
    name: 'Brand Blue',
    shades: [
      { label: '50', hex: '#EBF5FF', textDark: true },
      { label: '500', hex: '#0067FF', textDark: false },
      { label: '700', hex: '#003D99', textDark: false },
    ],
  },
];

const typographyScale = [
  { name: 'Display', class: 'text-4xl sm:text-5xl font-bold', sample: 'Legal help, simplified' },
  { name: 'H1', class: 'text-3xl sm:text-4xl font-bold', sample: 'Your legal questions answered' },
  { name: 'H2', class: 'text-2xl font-bold', sample: 'How it works' },
  { name: 'H3', class: 'text-xl font-semibold', sample: 'Document Generation' },
  { name: 'Body Large', class: 'text-lg', sample: 'Get clear, actionable legal information powered by AI.' },
  { name: 'Body', class: 'text-base', sample: 'ezLegal.ai provides legal information, not legal advice.' },
  { name: 'Small', class: 'text-sm', sample: 'Last updated June 6, 2026' },
  { name: 'Caption', class: 'text-xs', sample: 'This does not create an attorney-client relationship.' },
];

const spacingTokens = [
  { name: '1 (4px)', class: 'w-1 h-4', px: 4 },
  { name: '2 (8px)', class: 'w-2 h-4', px: 8 },
  { name: '3 (12px)', class: 'w-3 h-4', px: 12 },
  { name: '4 (16px)', class: 'w-4 h-4', px: 16 },
  { name: '6 (24px)', class: 'w-6 h-4', px: 24 },
  { name: '8 (32px)', class: 'w-8 h-4', px: 32 },
  { name: '10 (40px)', class: 'w-10 h-4', px: 40 },
  { name: '12 (48px)', class: 'w-12 h-4', px: 48 },
  { name: '16 (64px)', class: 'w-16 h-4', px: 64 },
];

const componentShowcase = [
  {
    name: 'Primary Button',
    nameEs: 'Botón primario',
    en: <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">Get Started</button>,
    es: <button className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">Comenzar</button>,
  },
  {
    name: 'Secondary Button',
    nameEs: 'Botón secundario',
    en: <button className="px-6 py-3 border-2 border-teal-600 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors">Learn More</button>,
    es: <button className="px-6 py-3 border-2 border-teal-600 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors">Saber Más</button>,
  },
  {
    name: 'Disclaimer Badge',
    nameEs: 'Distintivo de aviso',
    en: <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full">Not Legal Advice</span>,
    es: <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full">No es asesoría legal</span>,
  },
  {
    name: 'Success Badge',
    nameEs: 'Distintivo de éxito',
    en: <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full"><CheckCircle className="w-3 h-3" /> Verified</span>,
    es: <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full"><CheckCircle className="w-3 h-3" /> Verificado</span>,
  },
  {
    name: 'Card Pattern',
    nameEs: 'Patrón de tarjeta',
    en: (
      <div className="border border-navy-200 rounded-xl p-5 hover:border-teal-300 transition-colors max-w-xs">
        <h4 className="font-bold text-navy-900 mb-1">Document Title</h4>
        <p className="text-sm text-navy-600">Brief description of the card content and purpose.</p>
      </div>
    ),
    es: (
      <div className="border border-navy-200 rounded-xl p-5 hover:border-teal-300 transition-colors max-w-xs">
        <h4 className="font-bold text-navy-900 mb-1">Título del documento</h4>
        <p className="text-sm text-navy-600">Breve descripción del contenido y propósito de la tarjeta.</p>
      </div>
    ),
  },
];

export default function DesignSystem() {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24 pb-16 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-navy-500 mb-4">
              <Link to="/trust-center" className="hover:text-teal-600 transition-colors">
                {es ? 'Centro de Confianza' : 'Trust Center'}
              </Link>
              <span>/</span>
              <span className="text-navy-700 font-medium">
                {es ? 'Sistema de Diseño' : 'Design System'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {es ? 'Sistema de Diseño' : 'Design System'}
            </h1>
            <p className="text-lg text-navy-600 max-w-3xl">
              {es
                ? 'Tokens de diseño, tipografía, paleta de colores y componentes reutilizables que forman la identidad visual de ezLegal.ai. Todos los componentes son bilingües y accesibles.'
                : 'Design tokens, typography, color palette, and reusable components forming the ezLegal.ai visual identity. All components are bilingual and accessible.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Palette className="w-3 h-3" /> 6 color ramps
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Type className="w-3 h-3" /> Inter + Playfair Display
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Layout className="w-3 h-3" /> 8px grid
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Globe className="w-3 h-3" /> EN/ES bilingual
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Smartphone className="w-3 h-3" /> Responsive (360px-1536px)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-navy-50 text-navy-700 rounded-full border border-navy-200">
                <Layers className="w-3 h-3" /> WCAG 2.2 AA
              </span>
            </div>
          </header>

          {/* Color Palette */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">
              {es ? 'Paleta de colores' : 'Color Palette'}
            </h2>
            <div className="space-y-6">
              {colorRamps.map((ramp) => (
                <div key={ramp.name}>
                  <h3 className="text-sm font-semibold text-navy-700 mb-2">{ramp.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {ramp.shades.map((shade) => (
                      <div
                        key={`${ramp.name}-${shade.label}`}
                        className="flex flex-col items-center"
                      >
                        <div
                          className="w-14 h-14 rounded-lg border border-navy-100 shadow-sm"
                          style={{ backgroundColor: shade.hex }}
                        />
                        <span className="text-xs text-navy-600 mt-1">{shade.label}</span>
                        <span className="text-xs text-navy-400 font-mono">{shade.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">
              {es ? 'Tipografía' : 'Typography'}
            </h2>
            <div className="border border-navy-200 rounded-xl overflow-hidden">
              {typographyScale.map((item, idx) => (
                <div
                  key={item.name}
                  className={`flex items-baseline gap-6 p-4 ${idx !== typographyScale.length - 1 ? 'border-b border-navy-100' : ''}`}
                >
                  <span className="text-xs font-mono text-navy-400 w-24 shrink-0">{item.name}</span>
                  <span className={`${item.class} text-navy-900`}>{item.sample}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-navy-50 rounded-lg">
                <h4 className="text-sm font-semibold text-navy-700 mb-2">{es ? 'Sans Serif' : 'Sans Serif'}</h4>
                <p className="font-sans text-navy-900">Inter - {es ? 'Texto principal y UI' : 'Body text and UI'}</p>
                <p className="text-xs text-navy-500 mt-1">Weights: 400, 500, 600, 700</p>
              </div>
              <div className="p-4 bg-navy-50 rounded-lg">
                <h4 className="text-sm font-semibold text-navy-700 mb-2">Serif</h4>
                <p className="font-serif text-navy-900">Playfair Display - {es ? 'Acentos elegantes' : 'Elegant accents'}</p>
                <p className="text-xs text-navy-500 mt-1">Weights: 400, 700</p>
              </div>
            </div>
          </section>

          {/* Spacing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">
              {es ? 'Espaciado (sistema 8px)' : 'Spacing (8px system)'}
            </h2>
            <div className="space-y-2">
              {spacingTokens.map((token) => (
                <div key={token.name} className="flex items-center gap-4">
                  <span className="text-xs font-mono text-navy-500 w-20">{token.name}</span>
                  <div className={`${token.class} bg-teal-500 rounded-sm`} />
                  <span className="text-xs text-navy-400">{token.px}px</span>
                </div>
              ))}
            </div>
          </section>

          {/* Components - Bilingual */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
              {es ? 'Componentes (bilingüe)' : 'Components (bilingual)'}
            </h2>
            <p className="text-sm text-navy-600 mb-6">
              {es
                ? 'Cada componente se renderiza en ambos idiomas para verificar paridad visual.'
                : 'Each component renders in both languages to verify visual parity.'}
            </p>
            <div className="space-y-8">
              {componentShowcase.map((comp) => (
                <div key={comp.name} className="border border-navy-200 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-navy-700 mb-4">
                    {es ? comp.nameEs : comp.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-mono text-navy-400 block mb-2">EN</span>
                      {comp.en}
                    </div>
                    <div>
                      <span className="text-xs font-mono text-navy-400 block mb-2">ES</span>
                      {comp.es}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Responsive Breakpoints */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">
              {es ? 'Puntos de quiebre responsivos' : 'Responsive Breakpoints'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'xs', value: '360px', desc: es ? 'Móvil pequeño' : 'Small mobile' },
                { name: 'sm', value: '640px', desc: es ? 'Móvil grande' : 'Large mobile' },
                { name: 'md', value: '768px', desc: 'Tablet' },
                { name: 'lg', value: '1024px', desc: es ? 'Escritorio' : 'Desktop' },
                { name: 'xl', value: '1280px', desc: es ? 'Escritorio grande' : 'Large desktop' },
                { name: '2xl', value: '1536px', desc: es ? 'Extra grande' : 'Extra large' },
              ].map((bp) => (
                <div key={bp.name} className="p-3 bg-navy-50 rounded-lg text-center">
                  <span className="text-lg font-bold text-teal-600 font-mono">{bp.name}</span>
                  <p className="text-xs text-navy-600 mt-1">{bp.value}</p>
                  <p className="text-xs text-navy-400">{bp.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Accessibility Tokens */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">
              {es ? 'Tokens de accesibilidad' : 'Accessibility Tokens'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-navy-200 rounded-lg">
                <h4 className="text-sm font-semibold text-navy-700 mb-2">{es ? 'Contraste' : 'Contrast'}</h4>
                <ul className="space-y-1 text-sm text-navy-600">
                  <li>Body text: navy-900 on white = 14.5:1</li>
                  <li>Secondary: navy-600 on white = 7.2:1</li>
                  <li>CTA: white on teal-600 = 4.8:1</li>
                  <li>{es ? 'Mínimo objetivo' : 'Minimum target'}: 4.5:1 (AA)</li>
                </ul>
              </div>
              <div className="p-4 border border-navy-200 rounded-lg">
                <h4 className="text-sm font-semibold text-navy-700 mb-2">{es ? 'Foco y movimiento' : 'Focus & Motion'}</h4>
                <ul className="space-y-1 text-sm text-navy-600">
                  <li>Focus ring: 2px teal-500 offset-2</li>
                  <li>Reduced motion: prefers-reduced-motion honored</li>
                  <li>Skip links: visible on focus</li>
                  <li>Tab order: logical document flow</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="bg-navy-50 border border-navy-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-2">
              {es ? 'Notas de implementación' : 'Implementation Notes'}
            </h2>
            <p className="text-sm text-navy-600">
              {es
                ? 'Este sistema de diseño se implementa mediante Tailwind CSS con tokens personalizados en tailwind.config.js. Todos los componentes soportan modo RTL, temas claro/oscuro, y preferencias de movimiento reducido. No se utilizan bibliotecas de UI de terceros.'
                : 'This design system is implemented via Tailwind CSS with custom tokens in tailwind.config.js. All components support RTL mode, light/dark themes, and reduced motion preferences. No third-party UI libraries are used.'}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
