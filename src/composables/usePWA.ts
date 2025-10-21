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

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function usePWA({
  blockAutomaticPrompt = false,
}: { blockAutomaticPrompt?: boolean } = {}) {
  const isInstalled = useMediaQuery('(display-mode: standalone)')
  const rawPrompt = shallowRef<BeforeInstallPromptEvent>()

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
