import { VocabularyWord } from '../types';

export const MOCK_VOCABULARY: VocabularyWord[] = [
  {
    id: '1',
    word: 'Abacus',
    definition: 'Frame with balls for calculating',
    part_of_speech: 'noun',
    example_sentence: 'The ancient merchant used an abacus to tally his daily sales.',
    synonyms: ['calculator', 'computer'],
    difficulty_level: 1
  },
  {
    id: '2',
    word: 'Abate',
    definition: 'To lessen or subside',
    part_of_speech: 'verb',
    example_sentence: 'The storm began to abate after three hours of heavy rain.',
    synonyms: ['decrease', 'diminish', 'dwindle'],
    difficulty_level: 2
  },
  {
    id: '3',
    word: 'Abdication',
    definition: 'Giving up control or authority',
    part_of_speech: 'noun',
    example_sentence: 'The king’s abdication shocked the nation and changed the course of history.',
    synonyms: ['resignation', 'renunciation'],
    difficulty_level: 2
  },
  {
    id: '4',
    word: 'Aberration',
    definition: 'Straying away from what is normal',
    part_of_speech: 'noun',
    example_sentence: 'Her angry outburst was an aberration from her usually calm demeanor.',
    synonyms: ['anomaly', 'deviation', 'divergence'],
    difficulty_level: 3
  },
  {
    id: '5',
    word: 'Abet',
    definition: 'Help or encourage somebody (in doing wrong)',
    part_of_speech: 'verb',
    example_sentence: 'He was charged with aiding and abetting the criminal.',
    synonyms: ['assist', 'encourage', 'condone'],
    difficulty_level: 2
  },
  {
    id: '6',
    word: 'Abhor',
    definition: 'To hate or detest',
    part_of_speech: 'verb',
    example_sentence: 'I abhor discrimination of any kind.',
    synonyms: ['despise', 'loathe', 'hate'],
    difficulty_level: 2
  },
  {
    id: '7',
    word: 'Abject',
    definition: 'Extremely bad, unpleasant, and degrading',
    part_of_speech: 'adjective',
    example_sentence: 'They lived in abject poverty.',
    synonyms: ['miserable', 'hopeless'],
    difficulty_level: 3
  },
  {
    id: '8',
    word: 'Abjure',
    definition: 'Promise or swear to give up',
    part_of_speech: 'verb',
    example_sentence: 'The conqueror forced the natives to abjure their religion.',
    synonyms: ['renounce', 'relinquish', 'reject'],
    difficulty_level: 3
  },
  {
    id: '9',
    word: 'Abraded',
    definition: 'Rubbed off or worn away by friction',
    part_of_speech: 'adjective',
    example_sentence: 'His skin was abraded after falling on the pavement.',
    synonyms: ['scraped', 'eroded'],
    difficulty_level: 3
  },
  {
    id: '10',
    word: 'Abrogate',
    definition: 'Repeal or annul by authority',
    part_of_speech: 'verb',
    example_sentence: 'The new government promised to abrogate the unjust law.',
    synonyms: ['revoke', 'repeal', 'nullify'],
    difficulty_level: 4
  },
  {
    id: '11',
    word: 'Abscond',
    definition: 'To go away suddenly (to avoid arrest)',
    part_of_speech: 'verb',
    example_sentence: 'The cashier tried to abscond with the money from the register.',
    synonyms: ['escape', 'flee', 'bolt'],
    difficulty_level: 3
  },
  {
    id: '12',
    word: 'Abstruse',
    definition: 'Difficult to comprehend; obscure',
    part_of_speech: 'adjective',
    example_sentence: 'The professor’s lecture was so abstruse that few students understood it.',
    synonyms: ['obscure', 'perplexing', 'complex'],
    difficulty_level: 4
  },
  {
    id: '13',
    word: 'Acclaimed',
    definition: 'Welcomed with shouts and approval',
    part_of_speech: 'adjective',
    example_sentence: 'The acclaimed author signed books for hours.',
    synonyms: ['praised', 'celebrated', 'renowned'],
    difficulty_level: 1
  },
  {
    id: '14',
    word: 'Accolade',
    definition: 'Praise or approval',
    part_of_speech: 'noun',
    example_sentence: 'She received the highest accolade in her industry.',
    synonyms: ['honor', 'award', 'privilege'],
    difficulty_level: 3
  },
  {
    id: '15',
    word: 'Adamant',
    definition: 'Refusing to be persuaded or to change one\'s mind',
    part_of_speech: 'adjective',
    example_sentence: 'He was adamant that he was not going to resign.',
    synonyms: ['unshakable', 'immovable', 'inflexible'],
    difficulty_level: 2
  },
  {
    id: '16',
    word: 'Admonitory',
    definition: 'Containing warning',
    part_of_speech: 'adjective',
    example_sentence: 'The teacher gave him an admonitory look.',
    synonyms: ['warning', 'reproachful'],
    difficulty_level: 3
  },
  {
    id: '17',
    word: 'Adorn',
    definition: 'Add beauty; decorate',
    part_of_speech: 'verb',
    example_sentence: 'Pictures and posters adorned the walls of his room.',
    synonyms: ['decorate', 'embellish', 'ornament'],
    difficulty_level: 1
  },
  {
    id: '18',
    word: 'Affable',
    definition: 'Polite and friendly',
    part_of_speech: 'adjective',
    example_sentence: 'He was an affable host who made everyone feel welcome.',
    synonyms: ['friendly', 'genial', 'amiable'],
    difficulty_level: 2
  },
  {
    id: '19',
    word: 'Aggravate',
    definition: 'Make worse or irritate',
    part_of_speech: 'verb',
    example_sentence: 'Running on a sprained ankle will only aggravate the injury.',
    synonyms: ['worsen', 'exacerbate', 'annoy'],
    difficulty_level: 2
  },
  {
    id: '20',
    word: 'Alacrity',
    definition: 'Eager and cheerful readiness',
    part_of_speech: 'noun',
    example_sentence: 'She accepted the invitation with alacrity.',
    synonyms: ['eagerness', 'willingness', 'enthusiasm'],
    difficulty_level: 3
  }
];

export const generateLessons = () => {
  const lessons = [];
  const wordsPerLesson = 5;
  const totalLessons = Math.ceil(MOCK_VOCABULARY.length / wordsPerLesson);

  for (let i = 0; i < totalLessons; i++) {
    lessons.push({
      id: `lesson-${i + 1}`,
      title: `Unit ${i + 1}: Foundational Words`,
      section: 1,
      unit: i + 1,
      word_count: wordsPerLesson,
      required_xp: i * 100,
      is_locked: i > 0, // Unlock first lesson only
      completed: false,
      stars: 0
    });
  }
  return lessons;
};