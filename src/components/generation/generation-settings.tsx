'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Crown } from 'lucide-react'

interface GenerationSettingsProps {
  settings: {
    aspectRatio: string
    resolution: string
    variations: number
    strength: number
    seed?: number
    style: string
    // FLUX quality parameters
    steps?: number
    guidance_scale?: number
    raw_mode?: boolean
    output_quality?: number
    safety_tolerance?: number
    output_format?: string
  }
  onSettingsChange: (settings: any) => void
  userPlan: string
}

export function GenerationSettings({ settings, onSettingsChange, userPlan }: GenerationSettingsProps) {
  const aspectRatios = [
    { value: '1:1', label: 'Quadrado (1:1)', free: true },
    { value: '4:3', label: 'Padrão (4:3)', free: true },
    { value: '3:4', label: 'Retrato (3:4)', free: true },
    { value: '16:9', label: 'Paisagem (16:9)', free: false },
    { value: '9:16', label: 'Vertical (9:16)', free: false }
  ]

  const resolutions = [
    { value: '512x512', label: '512×512', free: false, plan: 'PREMIUM' },
    { value: '768x768', label: '768×768', free: false, plan: 'PREMIUM' },
    { value: '1024x1024', label: '1024×1024', free: false, plan: 'PREMIUM' },
    { value: '1536x1536', label: '1536×1536', free: false, plan: 'GOLD' },
    { value: '2048x2048', label: '2048×2048 (4MP)', free: false, plan: 'GOLD', ultra: true }
  ]

  const styles = [
    { value: 'photographic', label: 'Fotográfico', description: 'Estilo de foto realista' },
    { value: 'artistic', label: 'Artístico', description: 'Criativo e estilizado' },
    { value: 'portrait', label: 'Retrato', description: 'Estilo de retrato profissional' },
    { value: 'fashion', label: 'Moda', description: 'Fotografia de alta moda' },
    { value: 'vintage', label: 'Vintage', description: 'Visual retrô e clássico' },
    { value: 'cinematic', label: 'Cinemático', description: 'Qualidade de filme' }
  ]

  const canUseFeature = (requiredPlan: string) => {
    // Temporarily allow all features for STARTER plan testing
    if (userPlan === 'STARTER') return true
    
    const planHierarchy = { PREMIUM: 1, GOLD: 2 }
    const userLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0
    const requiredLevel = planHierarchy[requiredPlan as keyof typeof planHierarchy] || 0
    return userLevel >= requiredLevel
  }

  const updateSetting = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Proporção da Imagem
        </label>
        <div className="grid grid-cols-1 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => ratio.free || userPlan !== 'FREE' ? updateSetting('aspectRatio', ratio.value) : null}
              disabled={!ratio.free && userPlan === 'FREE'}
              className={`p-3 border rounded-lg text-left transition-colors ${
                settings.aspectRatio === ratio.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : ratio.free || userPlan !== 'FREE'
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{ratio.label}</span>
                {!ratio.free && userPlan === 'FREE' && (
                  <Lock className="w-4 h-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Resolução
        </label>
        <div className="grid grid-cols-1 gap-2">
          {resolutions.map((res) => {
            const canUse = canUseFeature(res.plan)
            return (
              <button
                key={res.value}
                onClick={() => canUse ? updateSetting('resolution', res.value) : null}
                disabled={!canUse}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  settings.resolution === res.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : canUse
                    ? 'border-gray-300 hover:border-gray-400'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{res.label}</span>
                  <div className="flex items-center space-x-1">
                    {res.plan !== 'FREE' && (
                      <Badge variant="secondary" className="text-xs">
                        {res.plan}
                      </Badge>
                    )}
                    {!canUse && <Lock className="w-4 h-4" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Variations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Número de Variações
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => updateSetting('variations', num)}
              className={`p-3 border rounded-lg text-center transition-colors ${
                settings.variations === num
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{num}</div>
              <div className="text-xs text-gray-500">{num} crédito{num > 1 ? 's' : ''}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Model Strength */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Força do Modelo
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.1"
            value={settings.strength}
            onChange={(e) => updateSetting('strength', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Mais Criativo</span>
            <span className="font-medium">{(settings.strength * 100).toFixed(0)}%</span>
            <span>Mais Preciso</span>
          </div>
        </div>
      </div>

      {/* Style */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Estilo
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => updateSetting('style', style.value)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                settings.style === style.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium text-gray-900">{style.label}</div>
              <div className="text-sm text-gray-500 mt-1">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Seed */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Semente (Opcional)
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={settings.seed || ''}
            onChange={(e) => updateSetting('seed', e.target.value ? parseInt(e.target.value) : undefined)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Deixe vazio para aleatório"
            min="0"
            max="999999999"
          />
          <button
            onClick={() => updateSetting('seed', Math.floor(Math.random() * 999999999))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
          >
            Aleatório
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use a mesma semente para reproduzir resultados similares
        </p>
      </div>

      {/* FLUX Ultra Quality Settings - Only show for STARTER plan testing */}
      {userPlan === 'STARTER' && (
        <>
          {/* Inference Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Etapas de Inferência
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="4"
                max="50"
                step="1"
                value={settings.steps || 25}
                onChange={(e) => updateSetting('steps', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Rápido (4)</span>
                <span className="font-medium">{settings.steps || 25} etapas</span>
                <span>Máxima Qualidade (50)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mais etapas = maior qualidade e tempo de geração
            </p>
          </div>

          {/* Guidance Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Escala de Orientação
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="2.0"
                max="5.0"
                step="0.1"
                value={settings.guidance_scale || 3.0}
                onChange={(e) => updateSetting('guidance_scale', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Criativo (2.0)</span>
                <span className="font-medium">{(settings.guidance_scale || 3.0).toFixed(1)}</span>
                <span>Preciso (5.0)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Controla o equilíbrio entre criatividade e precisão do prompt
            </p>
          </div>

          {/* Output Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Qualidade da Saída
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="80"
                max="100"
                step="5"
                value={settings.output_quality || 95}
                onChange={(e) => updateSetting('output_quality', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Boa (80)</span>
                <span className="font-medium">{settings.output_quality || 95}%</span>
                <span>Máxima (100)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Qualidade de compressão da imagem final
            </p>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato de Saída
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['jpg', 'png'].map((format) => (
                <button
                  key={format}
                  onClick={() => updateSetting('output_format', format)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    (settings.output_format || 'jpg') === format
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{format.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">
                    {format === 'jpg' ? 'Menor tamanho' : 'Maior qualidade'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Tolerance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tolerância de Segurança
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={settings.safety_tolerance || 2}
                onChange={(e) => updateSetting('safety_tolerance', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Restrito (1)</span>
                <span className="font-medium">{settings.safety_tolerance || 2}</span>
                <span>Flexível (6)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Controla a rigidez dos filtros de conteúdo
            </p>
          </div>

          {/* Raw Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Modo Raw (FLUX Ultra)
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateSetting('raw_mode', !settings.raw_mode)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  settings.raw_mode
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {settings.raw_mode ? 'Ativado' : 'Desativado'}
              </button>
              <Badge variant="secondary" className="text-xs">
                FLUX ULTRA
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gera imagens mais naturais e fotorrealistas
            </p>
          </div>
        </>
      )}

      {/* Enhanced Quality Notice for STARTER */}
      {userPlan === 'STARTER' && (
        <div className="md:col-span-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <Crown className="w-5 h-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-800">Qualidade Máxima Desbloqueada</h4>
              <p className="text-purple-700 text-sm mt-1">
                Você tem acesso temporário ao FLUX 1.1 Pro Ultra com resolução de 4MP, Modo Raw e controles avançados de qualidade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Upgrade Notice */}
      {userPlan === 'FREE' && (
        <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Crown className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Upgrade para Mais Opções</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Planos Premium e Gold desbloqueiam resoluções maiores, mais proporções e recursos avançados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}