export type DraftAccessCode = 'DRAFT_NOT_FOUND' | 'DRAFT_ACCESS_DENIED' | 'DRAFT_EXPIRED' | 'DRAFT_ALREADY_SUBMITTED'

export class DraftAccessError extends Error {
  constructor(message: string, public readonly code: DraftAccessCode, public readonly status: number) {
    super(message)
    this.name = 'DraftAccessError'
  }
}
