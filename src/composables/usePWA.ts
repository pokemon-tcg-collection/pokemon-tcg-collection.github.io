import type { ConfigurableWindow } from '@vueuse/core'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { computed, shallowRef } from 'vue'

// see: https://stackoverflow.com/a/67171375/9360161

type UserChoice = Promise<{
  outcome: 'accepted' | 'dismissed'
  platform: string
}>

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<UserChoice>
  prompt(): Promise<UserChoice>
}

interface UsePWAOptions extends ConfigurableWindow {
  blockAutomaticPrompt?: boolean
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

// share state since this should probably be global if `usePWA` is used multiple times
const rawPrompt = shallowRef<BeforeInstallPromptEvent>()

export default function usePWA(options: UsePWAOptions = {}) {
  const { blockAutomaticPrompt = false, window } = options

  const isInstalled = useMediaQuery('(display-mode: standalone)', { window })

  const canBeInstalled = computed(() => rawPrompt.value !== undefined)

  if (blockAutomaticPrompt) {
    useEventListener(window, 'beforeinstallprompt', (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      rawPrompt.value = event
    })
  }

  async function promptInstall() {
    if (rawPrompt.value === undefined) return
    await rawPrompt.value.prompt()
    rawPrompt.value = undefined
  }

  return { isInstalled, canBeInstalled, promptInstall }
}
