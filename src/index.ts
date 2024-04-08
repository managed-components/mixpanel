import {
  ComponentSettings,
  Manager,
  MCEvent,
  Client,
} from '@managed-components/types'
import { isValidHttpUrl } from './utils'
import UAParser from 'ua-parser-js'

const SetActionsMap = {
  'profile-set': '$set',
  'profile-set-once': '$set_once',
  'profile-numerical-add': '$add',
  'profile-union': '$union',
  'profile-list-append': '$append',
  'profile-list-remove': '$remove',
  'group-set': '$set',
  'group-set-once': '$set_once',
  'group-remove-from-list': '$remove',
  'group-union': '$union',
}

const getAPIEndpointPath = (eventType: string, action = '') => {
  switch (eventType) {
    case 'track':
      return 'track'
    case 'identify':
      return 'track#create-identity'
    case 'create_alias':
      return 'track#identity-create-alias'
    case 'set_user_property':
    case 'set_group_property':
      return `engage#${action}`
    case 'unset_user_property':
      return 'engage#profile-unset'
    case 'unset_group_property':
      return 'engage#group-unset'
    case 'delete_user_profile':
      return 'engage#profile-delete'
    case 'delete_group_profile':
      return 'engage#group-delete'
    default:
      return ''
  }
}

const getAPIEndpoint = (isEU: boolean, eventType: string, action?: string) => {
  return `https://api${isEU ? '-eu' : ''}.mixpanel.com/${getAPIEndpointPath(
    eventType,
    action
  )}?verbose=1`
}

const handleCookieData = (
  client: Client,
  token: string,
  $identified_id?: string
) => {
  const cookie = client.get(token)
  let cookieData: { [k: string]: string | undefined } = {}

  const setFreshCookie = () => {
    const distinct_id = crypto.randomUUID()
    const referer = client.referer
    cookieData = {
      distinct_id,
      $device_id: distinct_id,
      $initial_referrer: referer || '$direct',
      $initial_referring_domain: isValidHttpUrl(referer)
        ? new URL(referer).host
        : '$direct',
      $userId: $identified_id,
    }
    client.set(token, encodeURIComponent(JSON.stringify(cookieData)))
  }

  if (cookie) {
    try {
      cookieData = JSON.parse(decodeURIComponent(cookie))
    } catch {
      setFreshCookie()
    }
    if (!cookieData?.distinct_id) {
      setFreshCookie()
    }
    // add userId to cookie if cookie already exists
    else if ($identified_id && !cookieData['$userId']) {
      cookieData['$userId'] = $identified_id
      client.set(token, encodeURIComponent(JSON.stringify(cookieData)))
    }
  } else setFreshCookie()

  return cookieData
}

const getRequestBodyProperties = (event: MCEvent, token: string) => {
  const { client, payload } = event
  const { $identified_id } = payload
  const { browser, os, device } = new UAParser(
    event.client.userAgent
  ).getResult()
  const cookieData = handleCookieData(client, token, $identified_id)
  return {
    token,
    $device_id: cookieData.$device_id,
    distinct_id: cookieData.$userId || cookieData.distinct_id,
    time: client.timestamp,
    $insert_id: crypto.randomUUID(),
    ip: client.ip,
    $referrer: client.referer || '$direct',
    $referring_domain: isValidHttpUrl(client.referer)
      ? new URL(client.referer).host
      : '$direct',
    $current_url: client.url.href,
    $current_domain: client.url.hostname,
    $current_page_title: client.title,
    $current_url_path: client.url.pathname,
    $current_url_search: client.url.search,
    $current_url_protocol: client.url.protocol,
    $screen_height: client.screenHeight,
    $screen_width: client.screenWidth,
    $browser: browser.name,
    $browser_version: browser.version,
    $os: os.name,
    $device: device.model,
    $gclid: client.url.searchParams.get('gclid'),
    $fbclid: client.url.searchParams.get('fbclid'),
  }
}

const getProfileRequestBodyProperties = (event: MCEvent, token: string) => {
  const { client, payload } = event
  const { $group_key, $group_id } = payload
  const cookieData = handleCookieData(client, token)

  return {
    $token: token,
    $distinct_id: cookieData.$userId || cookieData.distinct_id,
    $group_key,
    $group_id,
  }
}

export const getTrackEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const {
    $sr,
    $identified_id,
    event: $event,
    timestamp,
    ...customFields
  } = event.payload
  const { isEU, token } = settings

  const requestBody = {
    event: $event,
    properties: {
      ...customFields,
      ...getRequestBodyProperties(event, token),
    },
  }

  return {
    url: getAPIEndpoint(isEU, event.type),
    opts: {
      method: 'POST',
      headers: { accept: 'text/plain', 'content-type': 'application/json' },
      body: JSON.stringify([requestBody]),
    },
  }
}

export const getAliasEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const { alias } = event.payload
  const { isEU, token } = settings

  const requestBody = {
    event: '$create_alias',
    properties: {
      ...getRequestBodyProperties(event, token),
      alias,
    },
  }

  return {
    url: getAPIEndpoint(isEU, event.type),
    opts: {
      method: 'POST',
      headers: { accept: 'text/plain', 'content-type': 'application/json' },
      body: new URLSearchParams({
        data: JSON.stringify(requestBody),
      }),
    },
  }
}

export const getIdentifyEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const { $identified_id } = event.payload
  const { isEU, token } = settings

  const properties = getRequestBodyProperties(event, token)

  const requestBody = {
    event: '$identify',
    properties: {
      ...properties,
      $identified_id,
      $anon_id: properties.$device_id,
    },
  }

  return {
    url: getAPIEndpoint(isEU, event.type),
    opts: {
      method: 'POST',
      headers: { accept: 'text/plain', 'content-type': 'application/json' },
      body: new URLSearchParams({
        data: JSON.stringify(requestBody),
      }),
    },
  }
}

export const getSetPropertiesEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const {
    'user-set-action': action,
    'group-set-action': groupAction,
    timestamp,
    $group_key,
    $group_id,
    ...customFields
  } = event.payload
  const { isEU, token } = settings
  const actionKey =
    SetActionsMap[(action || groupAction) as keyof typeof SetActionsMap]

  const requestBody = {
    ...getProfileRequestBodyProperties(event, token),
    [actionKey]:
      actionKey === '$union'
        ? Object.fromEntries(
            Object.entries(customFields).map(([key, value]) => [
              key,
              (value as string)
                ?.split(',')
                .map((p: string) => p.trim())
                .filter((p: string) => !!p.length),
            ])
          )
        : customFields,
  }

  return {
    url: getAPIEndpoint(isEU, event.type, action || groupAction),
    opts: {
      method: 'POST',
      headers: { accept: 'text/plain', 'content-type': 'application/json' },
      body: JSON.stringify([requestBody]),
    },
  }
}

export const getUnsetPropertiesEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const { unsetList } = event.payload
  const { isEU, token } = settings

  const requestBody = {
    ...getProfileRequestBodyProperties(event, token),
    $unset:
      unsetList
        ?.split(',')
        .map((p: string) => p.trim())
        .filter((p: string) => !!p.length) || [],
  }

  return {
    url: getAPIEndpoint(isEU, event.type),
    opts: {
      method: 'POST',
      headers: { accept: 'text/plain', 'content-type': 'application/json' },
      body: JSON.stringify([requestBody]),
    },
  }
}

export const getDeleteProfileEventArgs = (
  settings: ComponentSettings,
  event: MCEvent
) => {
  const { $ignore_alias } = event.payload
  const { isEU, token } = settings

  const requestBody = {
    ...getProfileRequestBodyProperties(event, token),
    $delete: null,
    ...(typeof $ignore_alias === 'boolean' && { $ignore_alias }),
  }

  return {
    url: getAPIEndpoint(isEU, event.type),
    opts: {
      method: 'POST',
      headers: { accept: 'text/plain', 'content-type': 'application/json' },
      body: JSON.stringify([requestBody]),
    },
  }
}

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('track', (event: MCEvent) => {
    const { url, opts } = getTrackEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('create_alias', (event: MCEvent) => {
    const { url, opts } = getAliasEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('identify', (event: MCEvent) => {
    const { url, opts } = getIdentifyEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('set_user_property', (event: MCEvent) => {
    const { url, opts } = getSetPropertiesEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('set_group_property', (event: MCEvent) => {
    const { url, opts } = getSetPropertiesEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('unset_user_property', (event: MCEvent) => {
    const { url, opts } = getUnsetPropertiesEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('unset_group_property', (event: MCEvent) => {
    const { url, opts } = getUnsetPropertiesEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('delete_user_profile', (event: MCEvent) => {
    const { url, opts } = getDeleteProfileEventArgs(settings, event)
    manager.fetch(url, opts)
  })
  manager.addEventListener('delete_group_profile', (event: MCEvent) => {
    const { url, opts } = getDeleteProfileEventArgs(settings, event)
    manager.fetch(url, opts)
  })
}
