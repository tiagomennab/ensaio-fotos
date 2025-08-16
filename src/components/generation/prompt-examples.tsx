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
          category: 'Professional',
          prompts: [
            'professional business headshot, wearing suit and tie, confident smile, office background, studio lighting',
            'corporate executive portrait, modern office setting, natural lighting, professional attire',
            'LinkedIn profile photo, business casual, clean background, sharp focus'
          ]
        },
        {
          category: 'Casual',
          prompts: [
            'casual outdoor portrait, wearing jeans and t-shirt, natural smile, park background',
            'relaxed weekend look, coffee shop setting, warm lighting, approachable expression',
            'vacation photo, beach background, casual summer clothes, candid smile'
          ]
        },
        {
          category: 'Artistic',
          prompts: [
            'dramatic portrait with strong shadows, black and white photography, artistic lighting',
            'creative headshot with colorful background, modern studio setup, dynamic pose',
            'cinematic portrait, moody lighting, film photography style'
          ]
        }
      ],
      WOMAN: [
        {
          category: 'Professional',
          prompts: [
            'professional businesswoman portrait, elegant blouse, confident pose, office environment',
            'executive headshot, modern business attire, natural makeup, studio lighting',
            'corporate profile photo, professional styling, clean background'
          ]
        },
        {
          category: 'Fashion',
          prompts: [
            'fashion portrait, elegant dress, sophisticated pose, studio lighting',
            'glamour photography, evening wear, dramatic makeup, luxurious background',
            'lifestyle fashion shot, trendy outfit, urban background, natural light'
          ]
        },
        {
          category: 'Casual',
          prompts: [
            'casual lifestyle portrait, comfortable clothes, natural smile, home setting',
            'outdoor casual photo, summer dress, garden background, golden hour lighting',
            'coffee shop portrait, cozy sweater, warm atmosphere, candid expression'
          ]
        }
      ],
      BOY: [
        {
          category: 'Playful',
          prompts: [
            'young boy playing in park, casual clothes, joyful expression, outdoor setting',
            'school portrait, neat uniform, friendly smile, classroom background',
            'birthday party photo, festive clothes, excited expression, colorful background'
          ]
        },
        {
          category: 'Sports',
          prompts: [
            'youth athlete portrait, sports uniform, confident pose, field background',
            'soccer player action shot, team jersey, dynamic pose, stadium setting',
            'basketball portrait, athletic wear, determined expression, court background'
          ]
        }
      ],
      GIRL: [
        {
          category: 'Portrait',
          prompts: [
            'young girl portrait, pretty dress, sweet smile, garden background',
            'school photo, neat uniform, friendly expression, classroom setting',
            'family portrait style, casual clothes, natural pose, home environment'
          ]
        },
        {
          category: 'Activities',
          prompts: [
            'dancing portrait, ballet outfit, graceful pose, studio setting',
            'art class photo, creative expression, colorful background, focused look',
            'outdoor adventure, hiking clothes, excited expression, nature background'
          ]
        }
      ],
      ANIMAL: [
        {
          category: 'Pet Portrait',
          prompts: [
            'professional pet portrait, sitting pose, studio lighting, clean background',
            'outdoor pet photo, natural environment, playful expression, golden hour',
            'lifestyle pet photography, home setting, comfortable pose, warm lighting'
          ]
        },
        {
          category: 'Action',
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
          Prompt Examples
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
                        Use Prompt
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
                      {prompt.split(' ').length} words
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">💡 How to Use Examples</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Click "Use Prompt" to copy an example to the prompt field</p>
            <p>• Modify examples to match your specific vision</p>
            <p>• Combine elements from different examples</p>
            <p>• Add your own creative details and specifications</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}