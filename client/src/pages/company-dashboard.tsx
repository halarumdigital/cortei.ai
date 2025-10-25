import { Building2, Users, Calendar, CreditCard, Settings, FileText, User, MessageSquare, HelpCircle, X } from "lucide-react";
import { useCompanyAuth } from "@/hooks/useCompanyAuth";
import { PaymentAlerts } from "@/components/PaymentAlerts";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CompanyDashboard() {
  const { company, isLoading } = useCompanyAuth();
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Fetch training video for dashboard menu
  const { data: trainingVideo, error: videoError, isLoading: videoLoading } = useQuery({
    queryKey: ['/api/training-videos/by-menu/dashboard'],
    queryFn: async () => {
      console.log('Fetching training video for dashboard...');
      const res = await fetch('/api/training-videos/by-menu/dashboard');
      console.log('Response status:', res.status);
      if (!res.ok) {
        if (res.status === 404) {
          console.log('No training video found for dashboard');
          return null;
        }
        throw new Error('Erro ao buscar vídeo de treinamento');
      }
      const data = await res.json();
      console.log('Training video data:', data);
      return data;
    },
  });

  // Debug log
  console.log('trainingVideo:', trainingVideo);
  console.log('videoError:', videoError);
  console.log('videoLoading:', videoLoading);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-96">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando...</h3>
          <p className="text-sm text-gray-500">
            Obtendo informações da empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Payment Alerts */}
      <PaymentAlerts />

      {/* Company Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Informações da Empresa</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nome Fantasia</p>
            <p className="font-semibold text-gray-900">{company?.fantasyName || "Salão"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Documento</p>
            <p className="font-semibold text-gray-900">{company?.document || "573.286.450-40"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="font-semibold text-gray-900">{company?.email || "damasceno02@hotmail.com"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ativo
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-1">Endereço</p>
          <p className="text-gray-900">{company?.address || "asasasa"}</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Plano Atual</p>
              <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">Premium</div>
          <p className="text-sm text-gray-500">Próximo vencimento em 30 dias</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Usuários Ativos</p>
              <Users className="w-5 h-5 text-gray-400 mt-1" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">5</div>
          <p className="text-sm text-gray-500">+2 desde o mês passado</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Dias Restantes</p>
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">30</div>
          <p className="text-sm text-gray-500">Do período atual</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recursos Disponíveis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recursos Disponíveis</h3>
          <p className="text-sm text-gray-500 mb-6">Funcionalidades liberadas para sua empresa</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">WhatsApp Integration</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Ativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Relatórios Avançados</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Ativo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Access</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Limitado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Suporte Prioritário</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ações Rápidas</h3>
          <p className="text-sm text-gray-500 mb-6">Acesse rapidamente as principais funcionalidades</p>
          
          <div className="space-y-3">
            <button className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-gray-700">Gerenciar Usuários</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-gray-700">Configurações da Empresa</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-gray-700">Histórico de Pagamentos</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-gray-700">Agendar Reunião</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => {
          console.log('Button clicked! Video data:', trainingVideo);
          if (trainingVideo) {
            setShowVideoModal(true);
          } else {
            alert('Nenhum vídeo encontrado. Check console.');
          }
        }}
        className="fixed top-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Ajuda"
        title={trainingVideo ? `Vídeo: ${trainingVideo.name}` : 'Sem vídeo'}
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{trainingVideo?.name || 'Vídeo de Treinamento'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {trainingVideo?.description && (
              <p className="text-sm text-gray-600 mb-4">{trainingVideo.description}</p>
            )}
            {trainingVideo?.youtubeUrl && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(trainingVideo.youtubeUrl)}`}
                  title={trainingVideo.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}