'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Sparkles } from 'lucide-react'

interface PromptExamplesProps {
  modelClass: string
  onPromptSelect: (prompt: string) => void
}

export function PromptExamples({ modelClass, onPromptSelect }: PromptExamplesProps) {
  const getPromptsForClass = (className: string) => {
    const basePrompts = {
      MAN: [
        {
          category: 'Profissional',
          prompts: [
            'Ultra realistic professional business headshot, wearing suit and tie, confident smile, office background, studio lighting, sharp focus, 85mm lens, RAW photo style',
            'Professional corporate portrait, wearing elegant suit, confident expression, modern office background, natural window light, shallow depth of field, 50mm lens, RAW photo style',
            'Ultra realistic LinkedIn profile photo, business casual outfit, approachable smile, clean neutral background, sharp focus, studio lighting, 85mm lens, RAW photo style'
          ]
        },
        {
          category: 'Casual',
          prompts: [
            'Ultra realistic casual outdoor portrait, wearing jeans and t-shirt, natural smile, park background with greenery, soft daylight, Sony A7R IV, 50mm lens, RAW photo style',
            'Ultra realistic candid photo in a cozy coffee shop, relaxed weekend look, casual modern outfit, holding a coffee cup, warm golden daylight through windows, approachable smile, natural posture, cinematic depth of field, Canon 5D with 50mm lens, RAW photo style',
            'Ultra realistic vacation photo at the beach, wearing casual summer clothes, candid smile, ocean and sand background, golden hour sunlight, natural outdoor lighting, Nikon Z7 II, 35mm lens, RAW photo style'
          ]
        },
        {
          category: 'Artístico',
          prompts: [
            'Ultra realistic dramatic portrait, black and white photography, strong artistic lighting with deep shadows, high contrast tones, sharp focus, studio setting, shot on Leica M10 Monochrom, 50mm lens, RAW photo style',
            'Ultra realistic creative headshot, colorful gradient studio background, modern lighting setup, dynamic natural pose, sharp focus, vibrant tones, shot on Canon EOS R5, 85mm lens, RAW photo style',
            'Ultra realistic cinematic portrait, moody atmospheric lighting, film photography style with subtle grain, soft depth of field, high contrast, shot on Arri Alexa 65, 50mm lens, RAW photo style'
          ]
        }
      ],
      MULHER: [
        {
          category: 'Profissional',
          prompts: [
            'Ultra realistic professional business headshot, woman wearing elegant suit and blouse, confident smile, modern office background, studio lighting, sharp focus, 85mm lens, RAW photo style',
            'Professional corporate portrait, woman in sophisticated business attire, natural makeup, confident expression, modern office background, natural window light, shallow depth of field, 50mm lens, RAW photo style',
            'Ultra realistic LinkedIn profile photo, woman in business casual outfit, approachable smile, clean neutral background, professional styling, sharp focus, studio lighting, 85mm lens, RAW photo style'
          ]
        },
        {
          category: 'Moda',
          prompts: [
            'Ultra realistic fashion portrait, woman wearing elegant evening dress, sophisticated pose, dramatic studio lighting, shallow depth of field, Canon EOS R5, 85mm lens, RAW photo style',
            'Ultra realistic glamour photography, woman in luxury evening wear, dramatic makeup with subtle highlights, luxurious background with soft bokeh, professional lighting setup, shot on Sony A7R IV, 50mm lens, RAW photo style',
            'Ultra realistic lifestyle fashion shot, woman in trendy modern outfit, confident pose, urban background with natural lighting, golden hour sunlight, candid expression, Nikon Z7 II, 35mm lens, RAW photo style'
          ]
        },
        {
          category: 'Casual',
          prompts: [
            'Ultra realistic casual lifestyle portrait, woman wearing comfortable stylish clothes, natural genuine smile, cozy home setting with warm lighting, soft daylight, Sony A7R IV, 50mm lens, RAW photo style',
            'Ultra realistic outdoor casual photo, woman in beautiful summer dress, relaxed pose, garden background with greenery, golden hour lighting, natural outdoor setting, Canon 5D with 50mm lens, RAW photo style',
            'Ultra realistic coffee shop portrait, woman in cozy sweater, holding a coffee cup, warm atmosphere with soft window light, candid natural expression, comfortable posture, Nikon Z7 II, 35mm lens, RAW photo style'
          ]
        }
      ],
      BOY: [
        {
          category: 'Brincação',
          prompts: [
            'young boy playing in park, casual clothes, joyful expression, outdoor setting',
            'school portrait, neat uniform, friendly smile, classroom background',
            'birthday party photo, festive clothes, excited expression, colorful background'
          ]
        },
        {
          category: 'Esportes',
          prompts: [
            'youth athlete portrait, sports uniform, confident pose, field background',
            'soccer player action shot, team jersey, dynamic pose, stadium setting',
            'basketball portrait, athletic wear, determined expression, court background'
          ]
        }
      ],
      GIRL: [
        {
          category: 'Retrato',
          prompts: [
            'young girl portrait, pretty dress, sweet smile, garden background',
            'school photo, neat uniform, friendly expression, classroom setting',
            'family portrait style, casual clothes, natural pose, home environment'
          ]
        },
        {
          category: 'Atividades',
          prompts: [
            'dancing portrait, ballet outfit, graceful pose, studio setting',
            'art class photo, creative expression, colorful background, focused look',
            'outdoor adventure, hiking clothes, excited expression, nature background'
          ]
        }
      ],
      ANIMAL: [
        {
          category: 'Retrato Pet',
          prompts: [
            'professional pet portrait, sitting pose, studio lighting, clean background',
            'outdoor pet photo, natural environment, playful expression, golden hour',
            'lifestyle pet photography, home setting, comfortable pose, warm lighting'
          ]
        },
        {
          category: 'Ação',
          prompts: [
            'pet in action, running or jumping, outdoor setting, motion blur background',
            'playing pet photo, toy or ball, garden setting, joyful expression',
            'pet and nature, beautiful landscape, peaceful pose, natural lighting'
          ]
        }
      ]
    }

    return basePrompts[className as keyof typeof basePrompts] || basePrompts.MAN
  }

  const promptCategories = getPromptsForClass(modelClass)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Exemplos de Descrição
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {promptCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Badge variant="outline" className="mr-2">
                {category.category}
              </Badge>
            </h4>
            
            <div className="space-y-3">
              {category.prompts.map((prompt, promptIndex) => (
                <div
                  key={promptIndex}
                  className="group p-3 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors"
                >
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {prompt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPromptSelect(prompt)}
                        className="h-7 px-3 text-xs"
                      >
                        Usar Prompt
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(prompt)}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {prompt.split(' ').length} palavras
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">💡 Como Usar os Exemplos</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Clique em "Usar Prompt" para copiar um exemplo para o campo</p>
            <p>• Modifique exemplos para combinar com sua visão específica</p>
            <p>• Combine elementos de diferentes exemplos</p>
            <p>• Adicione seus próprios detalhes criativos e especificações</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}