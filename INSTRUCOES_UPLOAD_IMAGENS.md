# 📸 Instruções para Upload de Imagens dos Pacotes

## ✅ Estrutura Criada

Foi criada a estrutura completa de diretórios para organizar as imagens de preview dos pacotes:

```
public/packages/previews/
├── flight-mode/          (4 imagens de preview)
├── summer-vibes/         (4 imagens de preview)  
├── golden-hour/          (4 imagens de preview)
├── vintage/              (4 imagens de preview)
├── 360-cam/              (4 imagens de preview)
├── food-mood/            (4 imagens de preview)
├── outfit/               (4 imagens de preview)
├── 2000s-cam/            (4 imagens de preview)
└── life-aesthetic/       (4 imagens de preview)
```

## 📝 Convenção de Nomenclatura

Para cada pacote, carregar **exatamente 4 imagens** com os nomes:
- `preview-1.jpg`
- `preview-2.jpg` 
- `preview-3.jpg`
- `preview-4.jpg`

## 📋 Lista de Pacotes para Upload

### 🆕 Pacotes que PRECISAM de 4 imagens cada:

1. **Flight Mode** (`/public/packages/previews/flight-mode/`)
   - Vibes de viagem aérea, aeroporto, aventura

2. **Summer Vibes** (`/public/packages/previews/summer-vibes/`)
   - Vibe tropical, praia, férias de verão

3. **Golden Hour** (`/public/packages/previews/golden-hour/`)
   - Luz dourada, pôr do sol, hora mágica

4. **Vintage** (`/public/packages/previews/vintage/`)
   - Estilo retrô, nostálgico, cores desbotadas

5. **360 Cam** (`/public/packages/previews/360-cam/`)
   - Câmera 360°, perspectiva imersiva, tech

6. **Food Mood** (`/public/packages/previews/food-mood/`)
   - Vibe gastronômica, culinária, restaurante

7. **Outfit** (`/public/packages/previews/outfit/`)
   - Looks coordenados, fashion, conjuntos

8. **2000s Cam** (`/public/packages/previews/2000s-cam/`)
   - Y2K, anos 2000, digital camera aesthetic

9. **Life Aesthetic** (`/public/packages/previews/life-aesthetic/`)
   - Lifestyle, aspiracional, cotidiano estético

10. **Pet Shot** (`/public/packages/previews/pet-shot/`)
   - Fotos com pets, animais de estimação, momentos fofos

### ✅ Pacotes que JÁ TÊM imagens (não alterar):
- Quiet Luxury
- Executive Minimalist  
- Nomade
- Fitness Aesthetic
- Conceitual
- Mirror Selfie
- Rebel
- Urban
- Soft Power
- Neo Casual

## 🔧 Especificações Técnicas

- **Formato**: JPG ou PNG (preferência JPG)
- **Tamanho**: Mínimo 512x512px (recomendado 1024x1024px)
- **Proporção**: Quadrada (1:1) preferencial
- **Qualidade**: Alta resolução

## 🚀 Após Upload das Imagens

O código já está configurado para usar os novos caminhos:
- Os pacotes foram atualizados para referenciar `/packages/previews/[nome-pacote]/preview-[1-4].jpg`
- As imagens aparecerão automaticamente quando carregadas nos diretórios corretos
- Cada pacote mostrará 4 previews diferentes no grid e modal

## 📁 Exemplo de Estrutura Final

Após carregar todas as imagens, cada diretório deve ter:

```
flight-mode/
├── README.md
├── preview-1.jpg  ← Sua imagem aqui
├── preview-2.jpg  ← Sua imagem aqui  
├── preview-3.jpg  ← Sua imagem aqui
└── preview-4.jpg  ← Sua imagem aqui
```

**Total de imagens para carregar: 40 imagens (10 pacotes × 4 previews)**