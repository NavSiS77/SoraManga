export const genres = [
  { id: 1, name: 'Экшен' },
  { id: 2, name: 'Фэнтези' },
  { id: 3, name: 'Романтика' }
]

export const mangaList = [
  {
    id: 1,
    title: 'Sora Blades',
    description: 'История о летающем городе и охотниках за реликвиями.',
    status: 'ONGOING',
    views: 14200,
    genres: [1, 2],
    chapters: [
      {
        id: 101,
        number: 1,
        title: 'Начало',
        pages: [
          { id: 1001, number: 1, imageUrl: 'https://placehold.co/700x1000/1f2937/ffffff?text=Chapter+1+-+Page+1' },
          { id: 1002, number: 2, imageUrl: 'https://placehold.co/700x1000/111827/ffffff?text=Chapter+1+-+Page+2' }
        ]
      },
      {
        id: 102,
        number: 2,
        title: 'Первая миссия',
        pages: [
          { id: 1003, number: 1, imageUrl: 'https://placehold.co/700x1000/1f2937/ffffff?text=Chapter+2+-+Page+1' },
          { id: 1004, number: 2, imageUrl: 'https://placehold.co/700x1000/111827/ffffff?text=Chapter+2+-+Page+2' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Moon Diary',
    description: 'Школьная драма о тайных письмах и магии луны.',
    status: 'COMPLETED',
    views: 9800,
    genres: [3],
    chapters: [
      {
        id: 201,
        number: 1,
        title: 'Письмо',
        pages: [
          { id: 2001, number: 1, imageUrl: 'https://placehold.co/700x1000/334155/ffffff?text=Moon+Diary+-+Page+1' },
          { id: 2002, number: 2, imageUrl: 'https://placehold.co/700x1000/0f172a/ffffff?text=Moon+Diary+-+Page+2' }
        ]
      }
    ]
  }
]
