import { useState } from 'react';
import { Users, FileText, MessageSquare, Handshake, Settings } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

type TabType = 'users' | 'content' | 'chat' | 'partners' | 'system';

interface Tab {
  id: TabType;
  icon: typeof Users;
  label: string;
}

const TABS: Tab[] = [
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'content', icon: FileText, label: 'Content' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'partners', icon: Handshake, label: 'Partners' },
  { id: 'system', icon: Settings, label: 'System' },
];

export default function Admin() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState<TabType>('users');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'User Management' : 'Gestión de Usuarios'}
            </h3>
            <p className="text-slate-600">
              {en ? 'View and manage platform users.' : 'Ver y administrar usuarios de la plataforma.'}
            </p>
          </div>
        );
      case 'content':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'Content Management' : 'Gestión de Contenido'}
            </h3>
            <p className="text-slate-600">
              {en ? 'Manage legal content and documents.' : 'Administrar contenido y documentos legales.'}
            </p>
          </div>
        );
      case 'chat':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'Chat Monitoring' : 'Monitoreo de Chat'}
            </h3>
            <p className="text-slate-600">
              {en ? 'Monitor AI chat interactions and performance.' : 'Monitorear interacciones y rendimiento del chat IA.'}
            </p>
          </div>
        );
      case 'partners':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'Partner Management' : 'Gestión de Asociados'}
            </h3>
            <p className="text-slate-600">
              {en ? 'Manage partner organizations and integrations.' : 'Administrar organizaciones e integraciones asociadas.'}
            </p>
          </div>
        );
      case 'system':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'System Settings' : 'Configuración del Sistema'}
            </h3>
            <p className="text-slate-600">
              {en ? 'Configure system-wide settings and features.' : 'Configurar configuración y características de todo el sistema.'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            {en ? 'Admin Dashboard' : 'Panel de Administración'}
          </h1>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex border-b border-slate-200">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                      isActive
                        ? 'border-teal-600 text-teal-600 bg-teal-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {renderTabContent()}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
