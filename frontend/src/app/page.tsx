import { Calendar, MessageCircle, BarChart3, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏥 Z-Clinic v1
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de Atendimento Virtual para Clínica Odontológica
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Sistema Online
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <MessageCircle className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="font-semibold mb-2">Atendente Virtual</h3>
            <p className="text-gray-600 text-sm">IA conversacional via WhatsApp</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Calendar className="w-8 h-8 text-green-500 mb-4" />
            <h3 className="font-semibold mb-2">Agendamentos</h3>
            <p className="text-gray-600 text-sm">Gestão completa da agenda</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="font-semibold mb-2">Campanhas</h3>
            <p className="text-gray-600 text-sm">Envio em massa automatizado</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BarChart3 className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">Métricas e relatórios</p>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Acessar Sistema
          </button>
        </div>
      </div>
    </div>
  )
}
