'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, ZoomIn, Settings, Sparkles, Image as ImageIcon } from 'lucide-react'
import { UPSCALE_CONFIG } from '@/lib/ai/upscale/upscale-config'
import { calculateUpscaleCredits, estimateProcessingTime } from '@/lib/ai/upscale/upscale-utils'

interface UpscaleModalProps {
  isOpen: boolean
  imageUrl: string
  generation?: any
  onClose: () => void
  onUpscale: (options: any) => void
  userPlan: string
}

export function UpscaleModal({
  isOpen,
  imageUrl,
  generation,
  onClose,
  onUpscale,
  userPlan
}: UpscaleModalProps) {
  const [options, setOptions] = useState({
    scale_factor: 2,
    creativity: UPSCALE_CONFIG.defaults.creativity,
    resemblance: UPSCALE_CONFIG.defaults.resemblance,
    dynamic: UPSCALE_CONFIG.defaults.dynamic,
    sharpen: UPSCALE_CONFIG.defaults.sharpen,
    handfix: UPSCALE_CONFIG.defaults.handfix,
    output_format: UPSCALE_CONFIG.defaults.output_format,
    sd_model: UPSCALE_CONFIG.defaults.sd_model,
    scheduler: UPSCALE_CONFIG.defaults.scheduler,
    num_inference_steps: UPSCALE_CONFIG.defaults.num_inference_steps
  })

  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [imageInfo, setImageInfo] = useState({ width: 0, height: 0 })

  const planLimits = UPSCALE_CONFIG.planLimits[userPlan as keyof typeof UPSCALE_CONFIG.planLimits] || UPSCALE_CONFIG.planLimits.STARTER

  // Carrega informações da imagem
  useEffect(() => {
    if (imageUrl) {
      const img = new Image()
      img.onload = () => {
        setImageInfo({ width: img.width, height: img.height })
      }
      img.src = imageUrl
    }
  }, [imageUrl])

  if (!isOpen) return null

  const handleUpscale = async () => {
    setLoading(true)
    try {
      await onUpscale(options)
      onClose()
    } catch (error) {
      console.error('Upscale error:', error)
    } finally {
      setLoading(false)
    }
  }

  const creditsNeeded = calculateUpscaleCredits(1)
  const estimatedTime = estimateProcessingTime(options.scale_factor)
  const newResolution = {
    width: imageInfo.width * options.scale_factor,
    height: imageInfo.height * options.scale_factor
  }

  const isScaleAllowed = options.scale_factor <= planLimits.maxScaleFactor

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <ZoomIn className="w-6 h-6 mr-2 text-green-600" />
            Upscale com Clarity AI
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preview da imagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Original ({imageInfo.width}x{imageInfo.height})
              </h3>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="Original" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-green-600" />
                Após Upscale ({newResolution.width}x{newResolution.height})
              </h3>
              <div className="aspect-square bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
                <div className="text-center">
                  <ZoomIn className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-gray-600">
                    {options.scale_factor}x maior resolução
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações principais */}
          <div className="space-y-4">
            <h3 className="font-medium">Configurações de Upscale</h3>
            
            {/* Fator de escala */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Fator de Escala
                <Badge variant="secondary" className="ml-2">
                  {options.scale_factor}x
                </Badge>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {UPSCALE_CONFIG.scaleFactors.map((factor) => (
                  <Button
                    key={factor}
                    variant={options.scale_factor === factor ? "default" : "outline"}
                    onClick={() => setOptions({ ...options, scale_factor: factor })}
                    disabled={factor > planLimits.maxScaleFactor}
                    className="relative"
                  >
                    {factor}x
                    {factor > planLimits.maxScaleFactor && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Pro
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              {!isScaleAllowed && (
                <p className="text-sm text-amber-600">
                  ⚠️ Fator {options.scale_factor}x requer plano superior
                </p>
              )}
            </div>

            {/* Preset rápido */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Presets</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOptions({
                    ...options,
                    creativity: 0.2,
                    resemblance: 1.0,
                    sharpen: 0,
                    handfix: 'disabled'
                  })}
                >
                  📷 Foto
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOptions({
                    ...options,
                    creativity: 0.6,
                    resemblance: 0.5,
                    sharpen: 2,
                    handfix: 'enabled'
                  })}
                >
                  🎨 Arte
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOptions({
                    ...options,
                    creativity: 0.1,
                    resemblance: 1.2,
                    sharpen: 5,
                    handfix: 'disabled'
                  })}
                >
                  📝 Texto
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOptions({
                    ...options,
                    creativity: 0.5,
                    resemblance: 0.8,
                    sharpen: 1,
                    handfix: 'enabled'
                  })}
                >
                  ✨ Equilibrado
                </Button>
              </div>
            </div>
          </div>

          {/* Configurações avançadas */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações Avançadas
              {showAdvanced ? ' ▲' : ' ▼'}
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Creativity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Criatividade: {options.creativity}
                  </label>
                  <Slider
                    value={[options.creativity]}
                    onValueChange={(value) => setOptions({ ...options, creativity: value[0] })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Menor = mais fiel ao original | Maior = mais criativo
                  </p>
                </div>

                {/* Resemblance */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Semelhança: {options.resemblance}
                  </label>
                  <Slider
                    value={[options.resemblance]}
                    onValueChange={(value) => setOptions({ ...options, resemblance: value[0] })}
                    min={0}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Controla o quanto o resultado se parece com o original
                  </p>
                </div>

                {/* Dynamic */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Contraste Dinâmico: {options.dynamic}
                  </label>
                  <Slider
                    value={[options.dynamic]}
                    onValueChange={(value) => setOptions({ ...options, dynamic: value[0] })}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    HDR e ajuste de contraste
                  </p>
                </div>

                {/* Sharpen */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Nitidez: {options.sharpen}
                  </label>
                  <Slider
                    value={[options.sharpen]}
                    onValueChange={(value) => setOptions({ ...options, sharpen: value[0] })}
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Handfix */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Correção de Mãos</label>
                  <Select 
                    value={options.handfix} 
                    onValueChange={(value) => setOptions({ ...options, handfix: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Desabilitado</SelectItem>
                      <SelectItem value="enabled">Habilitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Formato de saída */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Formato</label>
                  <Select 
                    value={options.output_format} 
                    onValueChange={(value) => setOptions({ ...options, output_format: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (Melhor qualidade)</SelectItem>
                      <SelectItem value="jpg">JPG (Menor tamanho)</SelectItem>
                      <SelectItem value="webp">WebP (Equilibrado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Informações do processo */}
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Créditos necessários:</span>
              <Badge>{creditsNeeded} créditos</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tempo estimado:</span>
              <span className="text-sm">{Math.round(estimatedTime / 1000)}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Plano atual:</span>
              <Badge variant="outline">{userPlan}</Badge>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpscale} 
              disabled={loading || !isScaleAllowed}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processando...
                </div>
              ) : (
                <>
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Fazer Upscale ({creditsNeeded} créditos)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}