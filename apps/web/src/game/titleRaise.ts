let raised = false

export function titleIsRaised(): boolean {
  return raised
}

export function claimTitleRaise(): boolean {
  if (raised) {
    return false
  }
  raised = true
  return true
}
