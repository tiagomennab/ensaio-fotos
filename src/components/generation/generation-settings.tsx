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
  }
  onSettingsChange: (settings: any) => void
  userPlan: string
}

export function GenerationSettings({ settings, onSettingsChange, userPlan }: GenerationSettingsProps) {
  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)', free: true },
    { value: '4:3', label: 'Standard (4:3)', free: true },
    { value: '3:4', label: 'Portrait (3:4)', free: true },
    { value: '16:9', label: 'Landscape (16:9)', free: false },
    { value: '9:16', label: 'Vertical (9:16)', free: false }
  ]

  const resolutions = [
    { value: '512x512', label: '512×512', free: true, plan: 'FREE' },
    { value: '768x768', label: '768×768', free: false, plan: 'PREMIUM' },
    { value: '1024x1024', label: '1024×1024', free: false, plan: 'PREMIUM' },
    { value: '1536x1536', label: '1536×1536', free: false, plan: 'GOLD' },
    { value: '2048x2048', label: '2048×2048', free: false, plan: 'GOLD' }
  ]

  const styles = [
    { value: 'photographic', label: 'Photographic', description: 'Realistic photo style' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and stylized' },
    { value: 'portrait', label: 'Portrait', description: 'Professional portrait style' },
    { value: 'fashion', label: 'Fashion', description: 'High-fashion photography' },
    { value: 'vintage', label: 'Vintage', description: 'Retro and classic look' },
    { value: 'cinematic', label: 'Cinematic', description: 'Movie-like quality' }
  ]

  const canUseFeature = (requiredPlan: string) => {
    const planHierarchy = { FREE: 0, PREMIUM: 1, GOLD: 2 }
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
          Aspect Ratio
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
          Resolution
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
          Number of Variations
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
              <div className="text-xs text-gray-500">{num} credit{num > 1 ? 's' : ''}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Model Strength */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Model Strength
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
            <span>More Creative</span>
            <span className="font-medium">{(settings.strength * 100).toFixed(0)}%</span>
            <span>More Accurate</span>
          </div>
        </div>
      </div>

      {/* Style */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Style
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
          Seed (Optional)
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={settings.seed || ''}
            onChange={(e) => updateSetting('seed', e.target.value ? parseInt(e.target.value) : undefined)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Leave empty for random"
            min="0"
            max="999999999"
          />
          <button
            onClick={() => updateSetting('seed', Math.floor(Math.random() * 999999999))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
          >
            Random
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use the same seed to reproduce similar results
        </p>
      </div>

      {/* Plan Upgrade Notice */}
      {userPlan === 'FREE' && (
        <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Crown className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Upgrade for More Options</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Premium and Gold plans unlock higher resolutions, more aspect ratios, and advanced features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}