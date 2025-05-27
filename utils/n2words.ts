import n2words from 'n2words';

export function formatAmountInWords(amount: number): string {
  const dirhams = Math.floor(amount);
  const centimes = Math.round((amount - dirhams) * 100);

  let result = n2words(dirhams, { lang: 'fr' }) + " dirhams";
  if (centimes > 0) result += " et " + n2words(centimes, { lang: 'fr' }) + " centimes";
  return result;
}