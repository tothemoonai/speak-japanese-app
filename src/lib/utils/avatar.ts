const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/toon-head/svg';

/**
 * Generate a DiceBear Toon Head avatar URL from character name and gender.
 * Same name always produces the same avatar (deterministic via seed).
 */
export function getAvatarUrl(name: string, gender?: string | null): string {
  const params = new URLSearchParams({ seed: name });

  switch (gender) {
    case 'male':
      params.set('clothes', 'tShirt');
      params.set('hair', 'spiky');
      params.set('beardProbability', '10');
      break;
    case 'female':
      params.set('clothes', 'dress');
      params.set('hair', 'bun');
      params.set('rearHair', 'longStraight');
      params.set('beardProbability', '0');
      break;
    default:
      params.set('clothes', 'shirt');
      params.set('beardProbability', '0');
      break;
  }

  return `${DICEBEAR_BASE}?${params.toString()}`;
}
