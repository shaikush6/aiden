// What the guide says on the screens before and right after signing in.
// These are the only lines the speech endpoint will make for someone who is not signed in yet,
// so a child who cannot read can still be told what to do on the front door.

export const SIGN_IN_LINES = {
  login: 'Hi there! Who is playing? Ask a grown-up to help you type your username and your password. Then tap the big green Go button.',
  signup: 'Let us make a new account! A grown-up can type a username, a password, and the family invite code. Then tap the big green button.',
  username: 'Type your username here.',
  password: 'Now type your secret password.',
  invite: 'Type the family invite code. A grown-up has it.',
  oops: 'Hmm, that did not work. Ask a grown-up to check, and try again.',
} as const

export const STARTING_POINT_LINES = {
  ask: 'Welcome! Have you played before? Tap the purple button to show me where you got to. Or tap the green button to start playing.',
  pick: 'Tap the level you will play next. Everything before it counts as done. Tap Reading Quest or Block Buddy Land at the top to switch. Then tap Save and play.',
} as const

export function welcomeScripts(): string[] {
  return [...Object.values(SIGN_IN_LINES), ...Object.values(STARTING_POINT_LINES)]
}
