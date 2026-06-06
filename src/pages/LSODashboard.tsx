import { BarChart3, PieChart, Users, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function LSODashboard() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'Legal Service Organization Dashboard' : 'Panel de Organización de Servicios Legales'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Track impact metrics and grant reporting.'
                : 'Rastrear métricas de impacto e informes de subvenciones.'}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Clients Served' : 'Clientes Atendidos'}
                </h3>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">1,247</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Cases Closed' : 'Casos Cerrados'}
                </h3>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">342</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Issues Resolved' : 'Problemas Resueltos'}
                </h3>
                <BarChart3 className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">856</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Grant Period' : 'Período de Subvención'}
                </h3>
                <PieChart className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">75%</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {en ? 'Client Demographics' : 'Demografía de Clientes'}
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Housing Issues</span>
                    <span className="text-sm font-semibold text-slate-900">35%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Employment</span>
                    <span className="text-sm font-semibold text-slate-900">28%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Family Law</span>
                    <span className="text-sm font-semibold text-slate-900">22%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: '22%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Consumer</span>
                    <span className="text-sm font-semibold text-slate-900">15%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {en ? 'Monthly Trend' : 'Tendencia Mensual'}
              </h2>
              <div className="text-center text-slate-500">
                {en ? 'Chart data would display here' : 'Los datos del gráfico se mostrarían aquí'}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
