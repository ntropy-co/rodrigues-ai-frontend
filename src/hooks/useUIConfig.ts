'use client'

import { useState } from 'react'
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
      showSuggestions?: boolean
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
  const [config] = useState<UIConfig>(() => {
    const initialConfig = uiConfigData as UIConfig

    // Sobrescrever com variáveis de ambiente se necessário
    const envOverrides = {
      ui: {
        ...initialConfig.ui,
        branding: {
          ...initialConfig.ui.branding,
          displayModelName:
            process.env.NEXT_PUBLIC_AGENT_NAME ||
            initialConfig.ui.branding.displayModelName
        },
        features: {
          ...initialConfig.ui.features,
          showProButton:
            process.env.NEXT_PUBLIC_SHOW_PRO_BUTTON === 'true' ||
            initialConfig.ui.features.showProButton,
          showUploadButton:
            process.env.NEXT_PUBLIC_SHOW_UPLOAD_BUTTON === 'true' ||
            initialConfig.ui.features.showUploadButton,
          showToolsButton:
            process.env.NEXT_PUBLIC_SHOW_TOOLS_BUTTON === 'true' ||
            initialConfig.ui.features.showToolsButton
        }
      }
    }

    return { ...initialConfig, ...envOverrides }
  })

  return config
}
