'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  UserCircle, 
  Mail, 
  Camera, 
  Save, 
  Bell,
  Shield,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { useState, useRef } from 'react'

function getInitials(name?: string): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    avatar: session?.user?.image || ''
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">Você precisa estar logado para acessar seu perfil.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('O arquivo deve ter no máximo 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      // Simular upload (substituir por lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Criar URL temporário para preview
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, avatar: imageUrl }))
      
    } catch (error) {
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    
    try {
      // Simular salvamento (substituir por lógica real)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaveStatus('saved')
      
      // Resetar status após 3 segundos
      setTimeout(() => setSaveStatus('idle'), 3000)
      
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Salvando...
          </>
        )
      case 'saved':
        return (
          <>
            <Check className="w-4 h-4 mr-2" />
            Salvo!
          </>
        )
      case 'error':
        return (
          <>
            <X className="w-4 h-4 mr-2" />
            Erro
          </>
        )
      default:
        return (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meu Perfil
              </h1>
              <p className="text-gray-600">
                Gerencie suas informações pessoais e preferências
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Status de salvamento */}
          {saveStatus === 'saved' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800">Suas alterações foram salvas com sucesso!</span>
              </div>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-red-800">Ocorreu um erro ao salvar. Tente novamente.</span>
              </div>
            </div>
          )}

          {/* Informações Básicas */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Suas informações principais de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-medium">
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Foto de Perfil</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Clique no ícone da câmera para alterar sua foto
                  </p>
                  <p className="text-xs text-gray-400">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                  </p>
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-11"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Plano Atual */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Plano Atual</p>
                    <p className="text-sm text-gray-600">Seu plano de assinatura ativo</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {(session.user as any)?.plan || 'STARTER'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`h-11 px-8 ${
                saveStatus === 'saved' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : saveStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {getSaveButtonContent()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}