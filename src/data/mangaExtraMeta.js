/**
 * Доп. поля карточки тайтла (год, авторы на латинице как у издателя, издатель, ориентир по числу глав).
 */
const known = {
  1: { year: 1989, author: 'Kentaro Miura', artist: 'Kentaro Miura', publisher: 'Hakusensha', totalChapters: 364 },
  2: { year: 2001, author: 'Hiromu Arakawa', artist: 'Hiromu Arakawa', publisher: 'Enix / Square Enix', totalChapters: 108 },
  3: { year: 1998, author: 'Takehiko Inoue', artist: 'Takehiko Inoue', publisher: 'Kodansha', totalChapters: 327 },
  4: { year: 1994, author: 'Naoki Urasawa', artist: 'Naoki Urasawa', publisher: 'Shogakukan', totalChapters: 18 },
  5: { year: 1997, author: 'Eiichiro Oda', artist: 'Eiichiro Oda', publisher: 'Shueisha', totalChapters: 1100 },
  6: { year: 1999, author: 'Masashi Kishimoto', artist: 'Masashi Kishimoto', publisher: 'Shueisha', totalChapters: 72 },
  7: { year: 2001, author: 'Tite Kubo', artist: 'Tite Kubo', publisher: 'Shueisha', totalChapters: 74 },
  8: { year: 2003, author: 'Tsugumi Ohba', artist: 'Takeshi Obata', publisher: 'Shueisha', totalChapters: 12 },
  9: { year: 2009, author: 'Hajime Isayama', artist: 'Hajime Isayama', publisher: 'Kodansha', totalChapters: 34 },
  10: { year: 1998, author: 'Yoshihiro Togashi', artist: 'Yoshihiro Togashi', publisher: 'Shueisha', totalChapters: 400 },
  11: { year: 2016, author: 'Koyoharu Gotouge', artist: 'Koyoharu Gotouge', publisher: 'Shueisha', totalChapters: 23 },
  12: { year: 2018, author: 'Tatsuki Fujimoto', artist: 'Tatsuki Fujimoto', publisher: 'Shueisha', totalChapters: 97 },
  13: { year: 2014, author: 'Kohei Horikoshi', artist: 'Kohei Horikoshi', publisher: 'Shueisha', totalChapters: 42 },
  14: { year: 2018, author: 'Gege Akutami', artist: 'Gege Akutami', publisher: 'Shueisha', totalChapters: 30 },
  15: { year: 2011, author: 'Sui Ishida', artist: 'Sui Ishida', publisher: 'Shueisha', totalChapters: 14 },
  16: { year: 2017, author: 'Ken Wakui', artist: 'Ken Wakui', publisher: 'Kodansha', totalChapters: 31 },
  17: { year: 2017, author: 'Riichiro Inagaki', artist: 'Boichi', publisher: 'Shueisha', totalChapters: 26 },
  18: { year: 2005, author: 'Makoto Yukimura', artist: 'Makoto Yukimura', publisher: 'Kodansha', totalChapters: 28 },
  19: { year: 2006, author: 'Yasuhisa Hara', artist: 'Yasuhisa Hara', publisher: 'Shueisha', totalChapters: 64 },
  20: { year: 1979, author: 'Kazuo Kamimura', artist: 'Kazuo Kamimura', publisher: 'Shogakukan', totalChapters: 21 },
  21: { year: 2012, author: 'Kafka Asagiri', artist: 'Sango Harukawa', publisher: 'Kadokawa', totalChapters: 110 },
  22: { year: 2009, author: 'Kazue Kato', artist: 'Kazue Kato', publisher: 'Shueisha', totalChapters: 27 },
  23: { year: 1989, author: 'Hitoshi Iwaaki', artist: 'Hitoshi Iwaaki', publisher: 'Kodansha', totalChapters: 10 },
  24: { year: 1999, author: 'Naoki Urasawa', artist: 'Naoki Urasawa', publisher: 'Shogakukan', totalChapters: 22 },
  25: { year: 2003, author: 'Naoki Urasawa', artist: 'Naoki Urasawa', publisher: 'Shogakukan', totalChapters: 8 },
  26: { year: 1982, author: 'Katsuhiro Otomo', artist: 'Katsuhiro Otomo', publisher: 'Kodansha', totalChapters: 6 },
  27: { year: 2000, author: 'Hiroya Oku', artist: 'Hiroya Oku', publisher: 'Shueisha', totalChapters: 37 },
  28: { year: 1997, author: 'Kouta Hirano', artist: 'Kouta Hirano', publisher: 'Shonen Gahosha', totalChapters: 10 },
  29: { year: 2000, author: 'Q Hayashida', artist: 'Q Hayashida', publisher: 'Shogakukan', totalChapters: 23 },
  30: { year: 2008, author: 'Tsugumi Ohba', artist: 'Takeshi Obata', publisher: 'Shueisha', totalChapters: 20 },
  31: { year: 2000, author: 'Ai Yazawa', artist: 'Ai Yazawa', publisher: 'Shueisha', totalChapters: 21 },
  32: { year: 1997, author: 'Tooru Fujisawa', artist: 'Tooru Fujisawa', publisher: 'Kodansha', totalChapters: 25 },
  33: { year: 2001, author: 'Norihiro Yagi', artist: 'Norihiro Yagi', publisher: 'Shueisha', totalChapters: 27 },
  34: { year: 2015, author: 'Shinichiro Kotani', artist: 'Shinichiro Kotani', publisher: 'Kodansha', totalChapters: 20 },
  35: { year: 2021, author: 'Yukinobu Tatsu', artist: 'Yukinobu Tatsu', publisher: 'Shueisha', totalChapters: 20 },
  36: { year: 2018, author: 'Muneyuki Kaneshiro', artist: 'Yusuke Nomura', publisher: 'Kodansha', totalChapters: 30 },
  37: { year: 2012, author: 'Haruichi Furudate', artist: 'Haruichi Furudate', publisher: 'Shueisha', totalChapters: 45 },
  38: { year: 1990, author: 'Takehiko Inoue', artist: 'Takehiko Inoue', publisher: 'Shueisha', totalChapters: 31 },
  42: { year: 2015, author: 'Aka Akasaka', artist: 'Aka Akasaka', publisher: 'Shueisha', totalChapters: 28 },
  43: { year: 2016, author: 'Tomohito Oda', artist: 'Tomohito Oda', publisher: 'Shogakukan', totalChapters: 27 },
  54: { year: 2019, author: 'Tatsuya Endo', artist: 'Tatsuya Endo', publisher: 'Shueisha', totalChapters: 15 },
  72: { year: 2012, author: 'ONE', artist: 'Yusuke Murata', publisher: 'Shueisha', totalChapters: 30 },
  88: { year: 2015, author: 'Fuse', artist: 'Mitz Vah', publisher: 'Micro Magazine', totalChapters: 24 },
  90: { year: 2009, author: '5pb. / Nitroplus', artist: 'Yomi Sarachi', publisher: 'Media Factory', totalChapters: 3 }
}

const defaults = {
  year: null,
  author: 'See imprint / credits',
  artist: 'See imprint / credits',
  publisher: 'Magazine / collected edition',
  totalChapters: null
}

export function getMangaExtendedMeta(manga) {
  if (!manga) return { ...defaults }
  const row = known[manga.id]
  if (row) {
    return { ...defaults, ...row }
  }
  return {
    ...defaults,
    year: 1995 + (manga.id % 25),
    author: 'Manga author',
    artist: 'Manga artist',
    publisher: 'Japanese magazine (typical)',
    totalChapters: 12 + (manga.id % 120)
  }
}
