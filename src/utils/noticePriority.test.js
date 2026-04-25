import { describe, expect, it } from 'vitest'
import { NOTICE_CHANGE, getNoticeFlagsForChange } from './noticePriority'

describe('notice priority state transitions', () => {
  it('shows only format notice when format was changed most recently', () => {
    let state = getNoticeFlagsForChange(NOTICE_CHANGE.LANGUAGE)
    expect(state).toEqual({
      languageChangedAfterGeneration: true,
      formatChangedAfterGeneration: false,
    })

    state = getNoticeFlagsForChange(NOTICE_CHANGE.FORMAT)
    expect(state).toEqual({
      languageChangedAfterGeneration: false,
      formatChangedAfterGeneration: true,
    })
  })

  it('shows only language notice when language was changed most recently', () => {
    let state = getNoticeFlagsForChange(NOTICE_CHANGE.FORMAT)
    expect(state).toEqual({
      languageChangedAfterGeneration: false,
      formatChangedAfterGeneration: true,
    })

    state = getNoticeFlagsForChange(NOTICE_CHANGE.LANGUAGE)
    expect(state).toEqual({
      languageChangedAfterGeneration: true,
      formatChangedAfterGeneration: false,
    })
  })

  it('hides both notices after generate/reset', () => {
    const state = getNoticeFlagsForChange(NOTICE_CHANGE.NONE)
    expect(state).toEqual({
      languageChangedAfterGeneration: false,
      formatChangedAfterGeneration: false,
    })
  })
})
