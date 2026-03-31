import type { ConfigurableWindow } from '@vueuse/core'
import { tryOnMounted, useBroadcastChannel, useStorage, useTimeout } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import type { MaybeRefOrGetter } from 'vue'
import { computed, readonly, ref, shallowRef, toRaw, toValue, watch } from 'vue'

interface UseMultipleInstanceDetectionOptions extends ConfigurableWindow {
  instanceId?: MaybeRefOrGetter<string>
  pingTimeout?: MaybeRefOrGetter<number>
  key?: MaybeRefOrGetter<string>
}

interface PingMessage {
  type: 'ping'
  id: string
}
interface PongMessage {
  type: 'pong'
  id: string
  pingId: string
}

export default function useMultipleInstanceDetection(
  options: UseMultipleInstanceDetectionOptions = {},
) {
  const { instanceId, pingTimeout = 500, key = 'multiple-instance-detection', window } = options

  // unwrap
  const keyRaw = toValue(key)
  let instanceIdRaw = toValue(instanceId)

  // create default/fallback (that is used if nothing is found in session storage)
  if (instanceIdRaw === undefined) {
    instanceIdRaw = uuidv4()
    console.debug('Create (possible) new instance id', instanceIdRaw)
  }

  // current tab instance id
  const instanceIdState = useStorage(keyRaw, instanceIdRaw, sessionStorage, {
    writeDefaults: true,
    mergeDefaults: false,
    listenToStorageChanges: false,
    window,
  })
  if (instanceIdState.value !== instanceIdRaw) {
    console.warn('Found another instanceId in session storage? (reloaded page?)', {
      storage: instanceIdState.value,
      newId: instanceIdRaw,
    })
    // NOTE: likely also when duplicating the tab?
  }

  // global application instance id
  const instanceIdGlobalState = useStorage(keyRaw, instanceIdState.value, localStorage, {
    writeDefaults: true,
    mergeDefaults: false,
    listenToStorageChanges: true,
    window,
  })

  // ping to detect stale global instance id and possible other active instances
  const pingId = ref<string | null>(instanceIdState.value)
  const pongIds = shallowRef<string[]>([]) // other instances
  const otherInstanceIds = shallowRef<string[]>([])

  const {
    isSupported: isBroadcastSupported,
    data: broadcastData,
    post: broadcastPost,
  } = useBroadcastChannel({ name: keyRaw, window })

  function sendPing() {
    const myInstanceId = instanceIdState.value

    otherInstanceIds.value = []
    pongIds.value = []
    pingId.value = myInstanceId

    const pingMessage = { type: 'ping', id: myInstanceId }
    console.debug('Send PING', pingMessage)
    broadcastPost(pingMessage)

    startPingTimeout()
  }

  function pingTimeoutCallback() {
    console.debug('ping timeout', {
      pingId: pingId.value,
      pongIds: pongIds.value,
      instanceIdState: instanceIdState.value,
      instanceIdGlobalState: instanceIdGlobalState.value,
    })

    // ping is done
    if (pingId.value !== instanceIdState.value) {
      console.warn('Did we encounter another PING?!', {
        pingId: pingId.value,
        instanceIdState: instanceIdState.value,
      })
    } else {
      pingId.value = null
    }

    // is self but may be a duplicated tab, so check and otherwise reassign the new instance id
    if (pongIds.value.includes(instanceIdState.value)) {
      console.warn(
        'InstanceId is same as global id but we also got a PONG response! Duplicated tab (same session storage?)',
        instanceIdState.value,
      )

      console.debug('Update own instance id', instanceIdRaw)
      instanceIdState.value = instanceIdRaw
      // TODO: do we want to send a new PING to announce the new ID?
      // Really depends on the usecase, so for now is not really required...

      console.debug('Send another ping to refresh others')
      sendPing()
      return
    }

    // check if we are the global instance, then we are done
    if (instanceIdState.value === instanceIdGlobalState.value) {
      return
    }

    // check if there is no global instance id
    // so either we are the global one or the global instance is not alive anymore
    if (!pongIds.value.includes(instanceIdGlobalState.value)) {
      console.warn('Did not find original instance! Promoting self', instanceIdState.value)
      instanceIdGlobalState.value = instanceIdState.value
    }
  }

  const { start: startPingTimeout } = useTimeout(pingTimeout, {
    controls: true,
    immediate: false,
    callback: pingTimeoutCallback,
  })

  // send ping and start countdown
  tryOnMounted(() => sendPing())

  // TODO: on unmount detection?
  // might be flaky, so let's just not it and rely on possibly incorrect state

  // wait for pongs / or other instances' pings
  watch(broadcastData, () => {
    if (!broadcastData.value) return

    const message = broadcastData.value as PingMessage | PongMessage

    console.log('local stored pingId', pingId.value)

    if (message.type === 'ping') {
      if (pingId.value !== message.id) {
        otherInstanceIds.value = [message.id] // NOTE: this is so, it can update self if another tab opens
        pongIds.value = []
        pingId.value = message.id
      }

      const pongMessage = { type: 'pong', id: instanceIdState.value, pingId: message.id }
      console.debug('Got PING, send PONG', pongMessage)
      broadcastPost(pongMessage)
    } else if (message.type === 'pong') {
      if (pingId.value !== message.pingId) {
        console.warn('PING/PONG confusion?', { messagePingId: message.pingId, pingId: pingId })
        // too many parallel tab openings?
      }

      console.debug('Got PONG', toRaw(message))
      pongIds.value = [...pongIds.value, message.id]
      otherInstanceIds.value = [...otherInstanceIds.value, message.id]
    }
  })

  const isMainInstance = computed(() => instanceIdGlobalState.value === instanceIdState.value)

  // NOTE: those logs can be wrong when updated after pings
  console.debug('instanceId', instanceIdState.value)
  console.debug('instanceId (global)', instanceIdGlobalState.value)
  // console.debug('is main instance?', isMainInstance.value)
  // console.debug('found another (possibly stale) instance?', !isMainInstance.value)

  return {
    instanceId: readonly(instanceIdState),
    mainInstanceId: readonly(instanceIdGlobalState),
    otherInstanceIds: readonly(otherInstanceIds),
    isMainInstance,
    // forward the broadcast supported state, it does not quite work without it
    isSupported: isBroadcastSupported,
  }
}
