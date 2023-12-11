import { MCEvent } from '@managed-components/types'
import crypto from 'crypto'
import {
  getTrackEventArgs,
  getAliasEventArgs,
  getIdentifyEventArgs,
  getSetPropertiesEventArgs,
  getUnsetPropertiesEventArgs,
  getDeleteProfileEventArgs,
} from '.'

if (!global.crypto) {
  vi.stubGlobal('crypto', crypto)
}

const settings = {
  token: '12345',
  isEU: true,
}

const cookie = encodeURIComponent(
  JSON.stringify({
    distinct_id: 'f477ebf8-0ddc-451f-8091-65effa05ec87',
    $device_id: 'f477ebf8-0ddc-451f-8091-65effa05ec87',
    $initial_referrer: '$direct',
    $initial_referring_domain: '$direct',
    $userId: undefined,
  })
)
const cookieData = JSON.parse(decodeURIComponent(cookie))

const dummyClient = {
  title: 'Zaraz "Test" /t Page',
  timestamp: 1670502437,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  language: 'en-GB',
  referer: '',
  ip: '127.0.0.1',
  emitter: 'browser',
  url: new URL('http://127.0.0.1:1337'),
  screenHeight: 1080,
  screenWidth: 2560,
  fetch: () => undefined,
  set: () => undefined,
  execute: () => undefined,
  return: () => undefined,
  get: (key: string) => {
    if (key === settings.token) {
      return cookie
    }
  },
  attachEvent: () => undefined,
  detachEvent: () => undefined,
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('Mixpanel MC track event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('track', {}) as MCEvent
  fakeEvent.payload = {
    event: 'Sign up',
    someData: 'some_value',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getTrackEventArgs(settings, fakeEvent)

  it('creates the Mixpanel track request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/track?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)[0]

    expect(body?.event).toEqual(fakeEvent.payload.event)
    expect(body?.properties?.token).toEqual(settings.token)
    expect(body?.properties?.$device_id).toEqual(cookieData.$device_id)
    expect(body?.properties?.distinct_id).toEqual(cookieData.distinct_id)
    expect(body?.properties?.time).toEqual(fakeEvent.client.timestamp)
    expect(body?.properties?.$insert_id).toMatch(uuidPattern)
    expect(body?.properties?.ip).toEqual(fakeEvent.client.ip)
    expect(body?.properties?.$referrer).toEqual('$direct')
    expect(body?.properties?.$referring_domain).toEqual('$direct')
    expect(body?.properties?.$current_url).toEqual(fakeEvent.client.url.href)
    expect(body?.properties?.$screen_height).toEqual(
      fakeEvent.client.screenHeight
    )
    expect(body?.properties?.$screen_width).toEqual(
      fakeEvent.client.screenWidth
    )
    expect(body?.properties?.$browser).toEqual('Chrome')
    expect(body?.properties?.$browser_version).toEqual('108.0.0.0')
    expect(body?.properties?.$os).toEqual('Mac OS')
    expect(body?.properties?.someData).toEqual(fakeEvent.payload.someData)
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('Mixpanel MC identify event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('identify', {}) as MCEvent
  fakeEvent.payload = {
    $identified_id: 'user_12345',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getIdentifyEventArgs(settings, fakeEvent)

  it('creates the Mixpanel identify request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/track#create-identity?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body.get('data'))

    expect(body?.event).toEqual('$identify')
    expect(body?.properties?.token).toEqual(settings.token)
    expect(body?.properties?.$device_id).toEqual(cookieData.$device_id)
    expect(body?.properties?.distinct_id).toEqual(
      fakeEvent.payload.$identified_id
    )
    expect(body?.properties?.time).toEqual(fakeEvent.client.timestamp)
    expect(body?.properties?.$insert_id).toMatch(uuidPattern)
    expect(body?.properties?.ip).toEqual(fakeEvent.client.ip)
    expect(body?.properties?.$referrer).toEqual('$direct')
    expect(body?.properties?.$referring_domain).toEqual('$direct')
    expect(body?.properties?.$current_url).toEqual(fakeEvent.client.url.href)
    expect(body?.properties?.$screen_height).toEqual(
      fakeEvent.client.screenHeight
    )
    expect(body?.properties?.$screen_width).toEqual(
      fakeEvent.client.screenWidth
    )
    expect(body?.properties?.$browser).toEqual('Chrome')
    expect(body?.properties?.$browser_version).toEqual('108.0.0.0')
    expect(body?.properties?.$os).toEqual('Mac OS')
    expect(body?.properties?.$identified_id).toEqual(
      fakeEvent.payload.$identified_id
    )
    expect(body?.properties?.$anon_id).toEqual(cookieData.$device_id)
  })

  it('updates the cookie correctly', () => {
    expect(setCookie).toBeTruthy()
    expect(setCookie.key).toEqual(settings.token)

    const setCookieData = JSON.parse(decodeURIComponent(setCookie.value))
    expect(setCookieData.distinct_id).toEqual(cookieData.distinct_id)
    expect(setCookieData.$device_id).toEqual(cookieData.$device_id)
    expect(setCookieData.$initial_referrer).toEqual(
      cookieData.$initial_referrer
    )
    expect(setCookieData.initial_referring_domain).toEqual(
      cookieData.initial_referring_domain
    )
    expect(setCookieData.$userId).toEqual(fakeEvent.payload.$identified_id)
  })
})

describe('Mixpanel MC alias event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('create_alias', {}) as MCEvent
  fakeEvent.payload = {
    alias: 'alias_12345',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getAliasEventArgs(settings, fakeEvent)

  it('creates the Mixpanel alias request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/track#identity-create-alias?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body.get('data'))

    expect(body?.event).toEqual('$create_alias')
    expect(body?.properties?.token).toEqual(settings.token)
    expect(body?.properties?.$device_id).toEqual(cookieData.$device_id)
    expect(body?.properties?.distinct_id).toEqual(cookieData.distinct_id)
    expect(body?.properties?.time).toEqual(fakeEvent.client.timestamp)
    expect(body?.properties?.$insert_id).toMatch(uuidPattern)
    expect(body?.properties?.ip).toEqual(fakeEvent.client.ip)
    expect(body?.properties?.$referrer).toEqual('$direct')
    expect(body?.properties?.$referring_domain).toEqual('$direct')
    expect(body?.properties?.$current_url).toEqual(fakeEvent.client.url.href)
    expect(body?.properties?.$screen_height).toEqual(
      fakeEvent.client.screenHeight
    )
    expect(body?.properties?.$screen_width).toEqual(
      fakeEvent.client.screenWidth
    )
    expect(body?.properties?.$browser).toEqual('Chrome')
    expect(body?.properties?.$browser_version).toEqual('108.0.0.0')
    expect(body?.properties?.$os).toEqual('Mac OS')
    expect(body?.properties?.alias).toEqual(fakeEvent.payload.alias)
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('Mixpanel MC set_group_property event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('set_group_property', {}) as MCEvent
  fakeEvent.payload = {
    'group-set-action': 'group-set',
    $group_key: 'group_key',
    $group_id: 'group_id',
    someProp: 'someValue',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getSetPropertiesEventArgs(settings, fakeEvent)

  it('creates the Mixpanel set request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/engage#group-set?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)[0]

    expect(body).toBeTruthy()
    expect(body.$token).toEqual(settings.token)
    expect(body.$distinct_id).toEqual(cookieData.distinct_id)
    expect(body.$group_key).toEqual(fakeEvent.payload.$group_key)
    expect(body.$group_id).toEqual(fakeEvent.payload.$group_id)
    expect(body.$set).toBeTruthy()
    expect(body.$set.someProp).toEqual(fakeEvent.payload.someProp)
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('Mixpanel MC set_user_property event with $union type handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('set_user_property', {}) as MCEvent
  fakeEvent.payload = {
    'user-set-action': 'profile-union',
    someProp: 'value1,value2, value3 ,,value4',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getSetPropertiesEventArgs(settings, fakeEvent)

  it('creates the Mixpanel set request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/engage#profile-union?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)[0]

    expect(body).toBeTruthy()
    expect(body.$token).toEqual(settings.token)
    expect(body.$distinct_id).toEqual(cookieData.distinct_id)
    expect(body.$union).toBeTruthy()
    expect(body.$union.someProp).toHaveLength(4)
    expect(body.$union.someProp).toContain('value1')
    expect(body.$union.someProp).toContain('value2')
    expect(body.$union.someProp).toContain('value3')
    expect(body.$union.someProp).toContain('value4')
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('Mixpanel MC unset_user_property event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('unset_user_property', {}) as MCEvent
  fakeEvent.payload = {
    unsetList: 'value1,value2 , value3',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getUnsetPropertiesEventArgs(settings, fakeEvent)

  it('creates the Mixpanel unset request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/engage#profile-unset?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)[0]

    expect(body).toBeTruthy()
    expect(body.$token).toEqual(settings.token)
    expect(body.$distinct_id).toEqual(cookieData.distinct_id)
    expect(body.$unset).toBeTruthy()
    expect(body.$unset).toHaveLength(3)
    expect(body.$unset).toContain('value1')
    expect(body.$unset).toContain('value2')
    expect(body.$unset).toContain('value3')
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('Mixpanel MC delete_group_profile event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('delete_group_profile', {}) as MCEvent
  fakeEvent.payload = {
    $group_key: 'group_key',
    $group_id: 'group_id',
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getDeleteProfileEventArgs(settings, fakeEvent)

  it('creates the Mixpanel delete request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/engage#group-delete?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)[0]

    expect(body).toBeTruthy()
    expect(body.$token).toEqual(settings.token)
    expect(body.$distinct_id).toEqual(cookieData.distinct_id)
    expect(body.$group_key).toEqual(fakeEvent.payload.$group_key)
    expect(body.$group_id).toEqual(fakeEvent.payload.$group_id)
    expect(body).toHaveProperty('$delete')
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})

describe('Mixpanel MC delete_user_profile event handler works correctly', () => {
  let setCookie: any

  const fakeEvent = new Event('delete_user_profile', {}) as MCEvent
  fakeEvent.payload = {
    $ignore_alias: true,
  }
  fakeEvent.client = {
    ...dummyClient,
    set: (key, value, opts) => {
      setCookie = { key, value, opts }
      return undefined
    },
  }

  const fetchRequest = getDeleteProfileEventArgs(settings, fakeEvent)

  it('creates the Mixpanel delete request correctly', async () => {
    expect(fetchRequest).toBeTruthy()
    expect(fetchRequest.url).toEqual(
      'https://api-eu.mixpanel.com/engage#profile-delete?verbose=1'
    )
    expect(fetchRequest.opts?.method).toEqual('POST')
    expect(fetchRequest.opts?.headers['accept']).toEqual('text/plain')
    expect(fetchRequest.opts?.headers['content-type']).toEqual(
      'application/json'
    )

    const body = JSON.parse(fetchRequest.opts?.body)[0]

    expect(body).toBeTruthy()
    expect(body.$token).toEqual(settings.token)
    expect(body.$distinct_id).toEqual(cookieData.distinct_id)
    expect(body.$ignore_alias).toEqual(fakeEvent.payload.$ignore_alias)
    expect(body).toHaveProperty('$delete')
  })

  it('does not update the cookie', () => {
    expect(setCookie).toBeUndefined()
  })
})
