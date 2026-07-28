/**
 * neighbourhood.ts — what is actually around the estate.
 *
 * SOURCING. Every venue named here comes from the voice-of-traveller research
 * in Anjuna_Full_Deck (slide 14, "Cafes they name" and "sunset beach clubs")
 * and the surf breaks the same research lists — i.e. the places Uluwatu guests
 * themselves bring up, not a list assembled to look full. Walk times are the
 * ones recorded per villa; everything further is described the way the estate
 * describes it ("a short ride"), because no verified drive time exists for
 * each venue and inventing one is not an option (CLAUDE.md rule 6).
 *
 * These are independent businesses. Nothing here is a partner, none of it is
 * on the estate, and none of it is paid placement — so the copy points at
 * them without claiming any of it as ours.
 *
 * TODO(neighbourhood): once someone drives each route, replace 'A short ride'
 * with the measured minutes.
 */

export interface Place {
  name: string;
  detail: string;
  distance: string;
}

export interface NeighbourhoodGroup {
  id: string;
  title: string;
  intro: string;
  places: Place[];
}

export const NEIGHBOURHOOD: NeighbourhoodGroup[] = [
  {
    id: 'surf',
    title: 'The breaks',
    intro:
      'The reason the Bukit was settled in the first place. Thomas Beach is the walk; the rest are a short ride along the cliff road.',
    places: [
      { name: 'Thomas Beach', detail: 'Sand and a mellow beach break', distance: '3 min walk' },
      { name: 'Padang Padang', detail: 'The barrelling right, and the cove above it', distance: '12 min walk' },
      { name: 'Bingin', detail: 'Reef, low tide, and the stairs down', distance: 'A short ride' },
      { name: 'Impossibles', detail: 'Long walls on the right swell', distance: 'A short ride' },
      { name: 'Uluwatu', detail: 'The break the peninsula is named for', distance: 'A short ride' },
    ],
  },
  {
    id: 'eat',
    title: 'Coffee and dinner',
    intro:
      'The places Uluwatu regulars name first — none of them ours, all of them a ride away.',
    places: [
      { name: 'Suka Espresso', detail: 'The Bukit breakfast, most mornings', distance: 'A short ride' },
      { name: 'Drifter Surf Café', detail: 'Coffee, boards and books', distance: 'A short ride' },
      { name: 'The Cashew Tree', detail: 'Long lunches in a garden', distance: 'A short ride' },
      { name: 'The Loft', detail: 'Quiet, and open late enough', distance: 'A short ride' },
      { name: 'Bukit Cafe', detail: 'The all-day one', distance: 'A short ride' },
    ],
  },
  {
    id: 'sunset',
    title: 'Where the day ends',
    intro:
      'Sunset is the event here. Book ahead in high season, or watch it from your own pool instead.',
    places: [
      { name: 'Single Fin', detail: 'The cliff-edge institution', distance: 'A short ride' },
      { name: 'Savaya', detail: 'Louder, later, on the headland', distance: 'A short ride' },
      { name: 'Sundays Beach Club', detail: 'Down at the water, with a bonfire', distance: 'A short ride' },
      { name: 'Uluwatu Temple', detail: 'Kecak dance as the light goes', distance: '15 min by car' },
    ],
  },
];

/**
 * The honest caveat. Recurred more than any other complaint in the research:
 * the Bukit is spread out and not walkable end to end.
 */
export const GETTING_AROUND_NOTE =
  'The Bukit is spread out — beyond the beach walk, most guests want a scooter or a driver, and we can arrange either. It is the one thing visitors consistently wish they had known.';
