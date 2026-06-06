import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, TrendingUp, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
}

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Review eviction notice deadline',
    status: 'pending',
    dueDate: '2024-06-15',
  },
  {
    id: '2',
    title: 'File employment complaint',
    status: 'overdue',
    dueDate: '2024-06-01',
  },
  {
    id: '3',
    title: 'Prepare small claims documents',
    status: 'completed',
    dueDate: '2024-05-28',
  },
];

export default function Dashboard() {
  const { language, t } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'My Action Plan' : 'Mi Plan de Acción'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Track your legal tasks and progress.'
                : 'Rastrear tus tareas legales y progreso.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Active Tasks' : 'Tareas Activas'}
                </h3>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">5</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Completed' : 'Completado'}
                </h3>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase">
                  {en ? 'Overdue' : 'Vencido'}
                </h3>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">1</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {en ? 'Your Legal Tasks' : 'Tus Tareas Legales'}
            </h2>
            <div className="space-y-3">
              {TASKS.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    task.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : task.status === 'overdue'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {task.status === 'overdue' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {task.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-slate-500'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              {t('dash.purchases')}
            </h2>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Professional Plan</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {t('dash.expires')}: June 30, 2024
                  </p>
                </div>
                <span className="text-sm font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                  {en ? 'Active' : 'Activo'}
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Document Pack</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {t('dash.expired')}: March 15, 2024
                  </p>
                </div>
                <button className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {t('dash.renew')}
                </button>
              </div>

              <button className="w-full flex items-center justify-center gap-2 mt-6 px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium">
                <CreditCard className="w-4 h-4" />
                {t('dash.updatePayment')}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
