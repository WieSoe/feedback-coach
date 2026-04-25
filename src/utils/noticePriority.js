export const NOTICE_CHANGE = {
  NONE: 'none',
  LANGUAGE: 'language',
  FORMAT: 'format',
}

export function getNoticeFlagsForChange(changeType) {
  switch (changeType) {
    case NOTICE_CHANGE.LANGUAGE:
      return {
        languageChangedAfterGeneration: true,
        formatChangedAfterGeneration: false,
      }
    case NOTICE_CHANGE.FORMAT:
      return {
        languageChangedAfterGeneration: false,
        formatChangedAfterGeneration: true,
      }
    case NOTICE_CHANGE.NONE:
    default:
      return {
        languageChangedAfterGeneration: false,
        formatChangedAfterGeneration: false,
      }
  }
}
