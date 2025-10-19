'use client'

import { useState, useEffect } from 'react'
import uiConfigData from '@/config/ui-config.json'

interface UIConfig {
  ui: {
    branding: {
      appName: string
      displayModelName: string
    }
    features: {
      showProButton: boolean
      showUploadButton: boolean
      showToolsButton: boolean
      showModelSelector: boolean
      carouselMode: boolean
      minimalSuggestions: boolean
    }
    layout: {
      headerHeight: string
      maxContentWidth: string
      suggestionColumns: {
        mobile: number
        tablet: number
        desktop: number
      }
    }
    theme: {
      primaryColor: string
      accentColor: string
      greetingColor: string
    }
  }
  suggestions: Array<{
    id: string
    title: string
    description: string
    icon: string
    prompt: string
    category: 'basic' | 'advanced' | 'expert'
  }>
}

export function useUIConfig(): UIConfig {
  const [config, setConfig] = useState<UIConfig>(uiConfigData as UIConfig)

  useEffect(() => {
    // Aqui podemos implementar lógica para carregar config de diferentes fontes
    // Por exemplo, sobrescrever com variáveis de ambiente se necessário
    
    const envOverrides = {
      ui: {
        ...config.ui,
        branding: {
          ...config.ui.branding,
          displayModelName: process.env.NEXT_PUBLIC_AGENT_NAME || config.ui.branding.displayModelName
        },
        features: {
          ...config.ui.features,
          showProButton: process.env.NEXT_PUBLIC_SHOW_PRO_BUTTON === 'true' || config.ui.features.showProButton,
          showUploadButton: process.env.NEXT_PUBLIC_SHOW_UPLOAD_BUTTON === 'true' || config.ui.features.showUploadButton,
          showToolsButton: process.env.NEXT_PUBLIC_SHOW_TOOLS_BUTTON === 'true' || config.ui.features.showToolsButton
        }
      }
    }

    setConfig({ ...config, ...envOverrides })
  }, [])

  return config
}