import { Sticker } from '@/types';

// Siglas FIFA por país
export const COUNTRY_CODES: Record<string, string> = {
  'México': 'MEX', 'África do Sul': 'RSA', 'Coreia do Sul': 'KOR', 'República Tcheca': 'CZE',
  'Canadá': 'CAN', 'Bósnia e Herzegovina': 'BIH', 'Catar': 'QAT', 'Suíça': 'SUI',
  'Brasil': 'BRA', 'Marrocos': 'MAR', 'Haiti': 'HAI', 'Escócia': 'SCO',
  'Estados Unidos': 'USA', 'Paraguai': 'PAR', 'Austrália': 'AUS', 'Turquia': 'TUR',
  'Alemanha': 'GER', 'Curaçao': 'CUW', 'Costa do Marfim': 'CIV', 'Equador': 'ECU',
  'Holanda': 'NED', 'Japão': 'JPN', 'Suécia': 'SWE', 'Tunísia': 'TUN',
  'Bélgica': 'BEL', 'Egito': 'EGY', 'Irã': 'IRN', 'Nova Zelândia': 'NZL',
  'Espanha': 'ESP', 'Cabo Verde': 'CPV', 'Arábia Saudita': 'KSA', 'Uruguai': 'URU',
  'França': 'FRA', 'Senegal': 'SEN', 'Iraque': 'IRQ', 'Noruega': 'NOR',
  'Argentina': 'ARG', 'Argélia': 'ALG', 'Áustria': 'AUT', 'Jordânia': 'JOR',
  'Portugal': 'POR', 'RD Congo': 'COD', 'Uzbequistão': 'UZB', 'Colômbia': 'COL',
  'Inglaterra': 'ENG', 'Croácia': 'CRO', 'Gana': 'GHA', 'Panamá': 'PAN',
  'ABERTURA': 'FWC', 'SEDES': 'FWC', 'LENDAS': 'FWC',
};

// Código ISO 2 letras para flagcdn.com
export const COUNTRY_ISO: Record<string, string> = {
  'México': 'mx', 'África do Sul': 'za', 'Coreia do Sul': 'kr', 'República Tcheca': 'cz',
  'Canadá': 'ca', 'Bósnia e Herzegovina': 'ba', 'Catar': 'qa', 'Suíça': 'ch',
  'Brasil': 'br', 'Marrocos': 'ma', 'Haiti': 'ht', 'Escócia': 'gb-sct',
  'Estados Unidos': 'us', 'Paraguai': 'py', 'Austrália': 'au', 'Turquia': 'tr',
  'Alemanha': 'de', 'Curaçao': 'cw', 'Costa do Marfim': 'ci', 'Equador': 'ec',
  'Holanda': 'nl', 'Japão': 'jp', 'Suécia': 'se', 'Tunísia': 'tn',
  'Bélgica': 'be', 'Egito': 'eg', 'Irã': 'ir', 'Nova Zelândia': 'nz',
  'Espanha': 'es', 'Cabo Verde': 'cv', 'Arábia Saudita': 'sa', 'Uruguai': 'uy',
  'França': 'fr', 'Senegal': 'sn', 'Iraque': 'iq', 'Noruega': 'no',
  'Argentina': 'ar', 'Argélia': 'dz', 'Áustria': 'at', 'Jordânia': 'jo',
  'Portugal': 'pt', 'RD Congo': 'cd', 'Uzbequistão': 'uz', 'Colômbia': 'co',
  'Inglaterra': 'gb-eng', 'Croácia': 'hr', 'Gana': 'gh', 'Panamá': 'pa',
  'ABERTURA': '', 'SEDES': '', 'LENDAS': '',
};

export function getFlagUrl(country: string): string | null {
  const iso = COUNTRY_ISO[country];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

// Estrutura por país (20 figurinhas):
//   01 = Logo / Escudo ✨
//   02–12 = Jogadores 1–11
//   13 = Foto da Equipe
//   14–20 = Jogadores 12–18
function makeTeam(
  group: string,
  base: number,
  teamIndex: number,
  country: string,
  players: string[],   // 18 jogadores
  starIndices: number[]
): Sticker[] {
  const code = COUNTRY_CODES[country] ?? country.slice(0, 3).toUpperCase();
  const off  = teamIndex * 20;
  const num  = (p: number) => `${code}${String(p).padStart(2, '0')}`;
  const sid  = (p: number) => base + off + p;
  const sec  = `GRUPO ${group}`;

  const first11  = players.slice(0, 11);
  const last7    = players.slice(11, 18);

  return [
    // 01 — Logo / Escudo ✨
    { id: sid(1),  number: num(1),  code, name: `${country} — Logo`,           country, section: sec, type: 'team',   is_shiny: true  },
    // 02–12 — Jogadores 1–11
    ...first11.map((name, i): Sticker => ({
      id: sid(2 + i), number: num(2 + i), code, name, country, section: sec,
      type: 'player', is_shiny: starIndices.includes(i),
    })),
    // 13 — Foto da Equipe
    { id: sid(13), number: num(13), code, name: `${country} — Foto da Equipe`, country, section: sec, type: 'team',   is_shiny: false },
    // 14–20 — Jogadores 12–18
    ...last7.map((name, i): Sticker => ({
      id: sid(14 + i), number: num(14 + i), code, name, country, section: sec,
      type: 'player', is_shiny: starIndices.includes(11 + i),
    })),
  ];
}

// ─── FWC — ABERTURA ──────────────────────────────────────────────────────────
const FWC: Sticker[] = [
  { id:  1, number: 'FWC01', code: 'FWC', name: 'Troféu FIFA Copa do Mundo',    country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: true  },
  { id:  2, number: 'FWC02', code: 'FWC', name: 'Copa do Mundo 2026 — Logo',    country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: true  },
  { id:  3, number: 'FWC03', code: 'FWC', name: 'Mascote Oficial',              country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: false },
  { id:  4, number: 'FWC04', code: 'FWC', name: 'Estadio MetLife — EUA',        country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id:  5, number: 'FWC05', code: 'FWC', name: 'Estadio AT&T — EUA',           country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id:  6, number: 'FWC06', code: 'FWC', name: 'Estadio SoFi — EUA',           country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id:  7, number: 'FWC07', code: 'FWC', name: 'Estadio Azteca — México',      country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id:  8, number: 'FWC08', code: 'FWC', name: 'Estadio BC Place — Canadá',    country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id:  9, number: 'FWC09', code: 'FWC', name: 'Estadio Allegiant — EUA',      country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id: 10, number: 'FWC10', code: 'FWC', name: 'Estadio Arrowhead — EUA',      country: 'SEDES',    section: 'FWC', type: 'stadium', is_shiny: false },
  { id: 11, number: 'FWC11', code: 'FWC', name: 'Lenda — Pelé',                 country: 'LENDAS',   section: 'FWC', type: 'legend',  is_shiny: true  },
  { id: 12, number: 'FWC12', code: 'FWC', name: 'Lenda — Maradona',             country: 'LENDAS',   section: 'FWC', type: 'legend',  is_shiny: true  },
  { id: 13, number: 'FWC13', code: 'FWC', name: 'Lenda — Ronaldo Fenômeno',     country: 'LENDAS',   section: 'FWC', type: 'legend',  is_shiny: true  },
  { id: 14, number: 'FWC14', code: 'FWC', name: 'Lenda — Zidane',               country: 'LENDAS',   section: 'FWC', type: 'legend',  is_shiny: true  },
  { id: 15, number: 'FWC15', code: 'FWC', name: 'Lenda — Ronaldinho',           country: 'LENDAS',   section: 'FWC', type: 'legend',  is_shiny: true  },
  { id: 16, number: 'FWC16', code: 'FWC', name: 'Lenda — Roberto Carlos',       country: 'LENDAS',   section: 'FWC', type: 'legend',  is_shiny: true  },
  { id: 17, number: 'FWC17', code: 'FWC', name: 'Seleções — Mapa Grupos',       country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: false },
  { id: 18, number: 'FWC18', code: 'FWC', name: 'Seleções — Linha do Tempo',    country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: false },
  { id: 19, number: 'FWC19', code: 'FWC', name: 'Copa 2026 — Abertura (1)',     country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: true  },
  { id: 20, number: 'FWC20', code: 'FWC', name: 'Copa 2026 — Abertura (2)',     country: 'ABERTURA', section: 'FWC', type: 'special', is_shiny: true  },
];

const GRUPO_A = [
  ...makeTeam('A', 100, 0, 'México',            ['Guillermo Ochoa','Rodolfo Cota','Kevin Álvarez','Jorge Sánchez','Edson Álvarez','César Montes','Johan Vásquez','Gerardo Arteaga','Carlos Rodríguez','Orbelín Pineda','Hirving Lozano','Jesús Manuel Corona','Alexis Vega','Roberto Alvarado','Raúl Jiménez','Henry Martín','Santiago Giménez','Uriel Antuna'], [4,10,14,16]),
  ...makeTeam('A', 100, 1, 'África do Sul',      ['Ronwen Williams','Veli Mothwa','Sifiso Hlatshwayo','Rushine de Reuck','Terrence Mashego','Bongani Zungu','Teboho Mokoena','Yusuf Maart','Themba Zwane','Sipho Mbule','Nkosinathi Sibisi','Percy Tau','Evidence Makgopa','Lyle Foster','Luther Singh','Bradley Grobler','Lebo Mothiba','Elias Mokwana'], [11,12]),
  ...makeTeam('A', 100, 2, 'Coreia do Sul',      ['Kim Seung-gyu','Jo Hyeon-woo','Kim Moon-hwan','Kim Jin-su','Kim Min-jae','Kim Young-gwon','Kwon Kyung-won','Lee Ki-je','Lee Kang-in','Son Heung-min','Hwang In-beom','Jung Woo-young','Lee Jae-sung','Kwon Chang-hoon','Hwang Hee-chan','Cho Gue-sung','Oh Hyeon-gyu','Na Sang-ho'], [4,8,9]),
  ...makeTeam('A', 100, 3, 'República Tcheca',   ['Jiří Pavlenka','Tomáš Vaclík','Vladimír Coufal','Lukáš Holeš','Tomáš Souček','Alex Král','Jakub Jankto','Pavel Kadeřábek','Ondřej Lingr','Ondřej Duda','Patrik Schick','Adam Hložek','Tomáš Chorý','Václav Jemelka','Jan Bořil','Michal Sadílek','Matěj Jurásek','Lukáš Provod'], [4,10,11]),
];

const GRUPO_B = [
  ...makeTeam('B', 200, 0, 'Canadá',              ['Milan Borjan','Maxime Crépeau','Alistair Johnston','Richie Laryea','Kamal Miller','Steven Vitória','Sam Adekugbe','Derek Cornelius','Jonathan Osorio','Mark-Anthony Kaye','Atiba Hutchinson','Samuel Piette','Alphonso Davies','Tajon Buchanan','Liam Millar','Jonathan David','Cyle Larin','Lucas Cavallini'], [12,15]),
  ...makeTeam('B', 200, 1, 'Bósnia e Herzegovina',['Nikola Vasilj','Ibrahim Šehić','Sead Kolašinac','Ermin Bičakčić','Ognjen Vranješ','Muhamed Bešić','Miralem Pjanić','Haris Duljević','Amer Gojak','Anel Ahmedhodžić','Dario Šimić','Edin Džeko','Denijal Pirić','Kenan Kodro','Ermedin Demirović','Luka Menalo','Stipe Biuk','Armin Hodžić'], [6,11]),
  ...makeTeam('B', 200, 2, 'Catar',               ['Meshaal Barsham','Saad Al-Sheeb','Pedro Miguel','Bassam Al-Rawi','Abdelkarim Hassan','Boualem Khoukhi','Tarek Salman','Karim Boudiaf','Akram Afif','Hassan Al-Haydos','Ismail Mohamed','Almoez Ali','Mohammed Muntari','Assim Madibo','Khalid Muneer','Yusuf Abdurisag','Ahmed Suhail','Sultan Al-Brake'], [8,11]),
  ...makeTeam('B', 200, 3, 'Suíça',               ['Yann Sommer','Gregor Kobel','Manuel Akanji','Nico Elvedi','Ricardo Rodríguez','Fabian Schär','Silvan Widmer','Granit Xhaka','Remo Freuler','Xherdan Shaqiri','Denis Zakaria','Ruben Vargas','Noah Okafor','Breel Embolo','Renato Steffen','Haris Seferović','Zeki Amdouni','Dan Ndoye'], [0,7]),
];

const GRUPO_C = [
  ...makeTeam('C', 300, 0, 'Brasil',   ['Alisson Becker','Ederson','Danilo','Éder Militão','Marquinhos','Gabriel Magalhães','Alex Telles','Casemiro','Lucas Paquetá','Bruno Guimarães','Rodrygo','Raphinha','Vinicius Jr.','Gabriel Jesus','Richarlison','Antony','Endrick','Gabriel Martinelli'], [0,8,10,11,12,16]),
  ...makeTeam('C', 300, 1, 'Marrocos', ['Yassine Bounou','Ahmed Reda Tagnaouti','Achraf Hakimi','Nayef Aguerd','Romain Saïss','Noussair Mazraoui','Badr Benoun','Sofyan Amrabat','Selim Amallah','Ilias Chair','Hakim Ziyech','Sofiane Boufal','Youssef En-Nesyri','Ayoub El Kaabi','Abde Ezzalzouli','Zakaria Aboukhlal','Tarik Tissoudali','Amine Harit'], [0,2,5,7,10,12]),
  ...makeTeam('C', 300, 2, 'Haiti',    ['Josué Duverger','Genson Célicourt','Kevin Lafrance','Andrew Emmanuel','Mechack Jérôme','Jems Geffrard','Wilde-Donald Guerrier','Frantzdy Pierrot','James Léandre','Derrick Etienne','Duckens Nazon','Steeven Saba','Kenson Roches','Benji Mathurin','Ronaldo Damus','Chrismy Geffrard','Samuel Camille','Pierre Guerrier'], [10]),
  ...makeTeam('C', 300, 3, 'Escócia',  ['Angus Gunn','Craig Gordon','Andrew Robertson','Kieran Tierney','Scott McTominay','John McGinn','Callum McGregor','Ryan Jack','Stuart Armstrong','Billy Gilmour','Ryan Christie','Kenny McLean','Lawrence Shankland','Lyndon Dykes','Kevin Nisbet','Che Adams','Oli McBurnie','Jack Hendry'], [2,4,5,9]),
];

const GRUPO_D = [
  ...makeTeam('D', 400, 0, 'Estados Unidos', ['Matt Turner','Ethan Horvath','Sergiño Dest','DeAndre Yedlin','Miles Robinson','Walker Zimmerman','Antonee Robinson','Tyler Adams','Weston McKennie','Yunus Musah','Christian Pulisic','Josh Sargent','Brenden Aaronson','Tim Weah','Giovanni Reyna','Ricardo Pepi','Folarin Balogun','Jordan Morris'], [0,7,8,10,15]),
  ...makeTeam('D', 400, 1, 'Paraguai',       ['Antony Silva','Gastón Olvedo','Gustavo Gómez','Fabián Balbuena','Óscar Romero','Mathías Villasanti','Andrés Cubas','Hernán Pérez','Miguel Almirón','Julio Enciso','Richard Sánchez','Gabriel Ávalos','Antonio Sanabria','Alejandro Gamarra','Sebastián Ferreira','Ramón Sosa','Adam Bareiro','Marcelo Palacio'], [8,9]),
  ...makeTeam('D', 400, 2, 'Austrália',      ['Mat Ryan','Andrew Redmayne','Harry Souttar','Milos Degenek','Bailey Wright','Nathaniel Atkinson','Aziz Behich','Jackson Irvine','Aaron Mooy','Riley McGree','Ajdin Hrustic','Mathew Leckie','Craig Goodwin','Mitchell Duke','Jamie Maclaren','Marco Tilio','Garang Kuol','Keanu Baccus'], [0,8]),
  ...makeTeam('D', 400, 3, 'Turquia',        ['Mert Günok','Altay Bayındır','Zeki Çelik','Merih Demiral','Samet Akaydın','Ferdi Kadıoğlu','Abdülkerim Bardakcı','Hakan Çalhanoğlu','Salih Özcan','İrfan Can Kahveci','Kaan Ayhan','Arda Güler','Kerem Aktürkoğlu','Orkun Kökçü','Cengiz Ünder','Barış Alper Yılmaz','Cenk Tosun','Baris Yilmaz'], [1,7,11,12]),
];

const GRUPO_E = [
  ...makeTeam('E', 500, 0, 'Alemanha',       ['Manuel Neuer','Marc-André ter Stegen','Antonio Rüdiger','Matthias Ginter','Niklas Süle','David Raum','Benjamin Henrichs','Ilkay Gündoğan','Leon Goretzka','Joshua Kimmich','Florian Wirtz','Jamal Musiala','Kai Havertz','Leroy Sané','Thomas Müller','Serge Gnabry','Niclas Füllkrug','Timo Werner'], [0,2,7,9,10,11,12,13]),
  ...makeTeam('E', 500, 1, 'Curaçao',        ['Eloy Room','Giliano Wijnaldum','Cuco Martina','Rangelo Janga','Leandro Bacuna','Juninho Bacuna','Chedric Bazoer','Daishawn Redan','Quentin Krul','Gleofilo Vlijter','Riechedly Bazoer','Jürgen Locadia','Genero Zeefuik','Ryan Koolwijk','Jafar Arias','Rubio Rubin','Gaston Celma','Myron Boadu'], [0,4]),
  ...makeTeam('E', 500, 2, 'Costa do Marfim',['Yahia Fofana','Badra Ali Sangaré','Serge Aurier','Odilon Kossounou','Simon Deli','Wilfried Singo','Ibrahim Sangaré','Franck Kessié','Jean Michaël Seri','Seko Fofana','Nicolas Pépé','Wilfried Zaha','Sébastien Haller','Max-Alain Gradel','Jonatan Bamba','Amad Diallo','Simon Adingra','Christian Kouamé'], [6,7,9,11,12]),
  ...makeTeam('E', 500, 3, 'Equador',        ['Hernán Galíndez','Alexander Domínguez','Piero Hincapié','Ángelo Preciado','Robert Arboleda','Pervis Estupiñán','Diego Palacios','Moisés Caicedo','Carlos Gruezo','Jhegson Méndez','Jeremy Sarmiento','Gonzalo Plata','Ángel Mena','Enner Valencia','Michael Estrada','Djorkaeff Reasco','Kevin Rodríguez','Kendry Páez'], [2,5,7,11,13]),
];

const GRUPO_F = [
  ...makeTeam('F', 600, 0, 'Holanda', ['Bart Verbruggen','Jasper Cillessen','Virgil van Dijk','Stefan de Vrij','Matthijs de Ligt','Daley Blind','Nathan Aké','Frenkie de Jong','Tijjani Reijnders','Xavi Simons','Teun Koopmeiners','Steven Bergwijn','Donyell Malen','Cody Gakpo','Memphis Depay','Wout Weghorst','Brian Brobbey','Jeremie Frimpong'], [2,4,7,9,13]),
  ...makeTeam('F', 600, 1, 'Japão',   ['Shuichi Gonda','Zion Suzuki','Maya Yoshida','Ko Itakura','Hiroki Sakai','Yuto Nagatomo','Wataru Endō','Hidemasa Morita','Junya Ito','Takefusa Kubo','Ritsu Doan','Kaoru Mitoma','Daichi Kamada','Ayase Ueda','Takumi Minamino','Genki Haraguchi','Ao Tanaka','Reo Hatate'], [6,9,10,11,13]),
  ...makeTeam('F', 600, 2, 'Suécia',  ['Robin Olsen','Karl-Johan Johnsson','Victor Lindelöf','Isak Hien','Emil Krafth','Filip Helander','Mikael Lustig','Albin Ekdal','Sebastian Larsson','Dejan Kulusevski','Emil Forsberg','Jesper Karlsson','Alexander Isak','Viktor Gyökeres','Marcus Berg','Jordan Larsson','Mattias Svanberg','Pontus Jansson'], [2,9,10,12,13]),
  ...makeTeam('F', 600, 3, 'Tunísia', ['Aymen Dahmen','Mouez Hassen','Ali Maâloul','Montassar Talbi','Dylan Bronn','Mohamed Dräger','Ellyes Skhiri','Wahbi Khazri','Hannibal Mejbri','Youssef Msakni','Naïm Sliti','Aïssa Laïdouni','Issam Jebali','Seifeddine Jaziri','Taha Yassine Khenissi','Bassem Srarfi','Ghaylen Chaalali','Hamza Ben Slimane'], [7,8,9,12]),
];

const GRUPO_G = [
  ...makeTeam('G', 700, 0, 'Bélgica',       ['Thibaut Courtois','Simon Mignolet','Toby Alderweireld','Jan Vertonghen','Timothy Castagne','Thomas Meunier','Leander Dendoncker','Kevin De Bruyne','Axel Witsel','Yannick Carrasco','Romelu Lukaku','Eden Hazard','Dries Mertens','Jeremy Doku','Charles De Ketelaere','Lois Openda','Arthur Theate','Amadou Onana'], [0,7,10,11,13,14]),
  ...makeTeam('G', 700, 1, 'Egito',         ['Mohamed El-Shenawy','Ahmed El-Shenawy','Ahmed Hegazi','Omar Kamal','Mohamed Abdel Shafy','Ahmed Fatouh','Tarek Hamed','Amr El-Sulaya','Hamdi Fathi','Ramadan Sobhi','Trézéguet','Mohamed Salah','Mostafa Mohamed','Omar Marmoush','Marwan Hamdy','Zizo','Emam Ashour','Kahraba'], [9,10,11,12,13]),
  ...makeTeam('G', 700, 2, 'Irã',           ['Alireza Beiranvand','Payam Niazmand','Shojae Khalilzadeh','Majid Hosseini','Milad Mohammadi','Ramin Rezaeian','Ali Gholizadeh','Saman Ghoddos','Ali Karimi','Vahid Amiri','Mehdi Taremi','Sardar Azmoun','Ehsan Hajsafi','Ahmad Nourollahi','Kaveh Rezaei','Karim Ansarifard','Allahyar Sayyadmanesh','Omid Ebrahimi'], [0,6,7,10,11]),
  ...makeTeam('G', 700, 3, 'Nova Zelândia', ['Stefan Marinović','Michael Woud','Tommy Smith','Winston Reid','Bill Tuiloma','Liberato Cacace','Clayton Lewis','Ryan Thomas','Elijah Just','Joe Bell','Kosta Barbarouses','Marko Stamenic','Chris Wood','Oli Sail','Hamish Watson','Matthew Garbett','Dane Ingham','André de Jong'], [5,12]),
];

const GRUPO_H = [
  ...makeTeam('H', 800, 0, 'Espanha',       ['David Raya','Unai Simón','Dani Carvajal','Alejandro Balde','Aymeric Laporte','Robin Le Normand','Pau Cubarsí','Pedri','Rodri','Fabián Ruiz','Dani Olmo','Mikel Merino','Lamine Yamal','Nico Williams','Álvaro Morata','Ferran Torres','Joselu','Martín Zubimendi'], [0,6,7,8,10,12,13]),
  ...makeTeam('H', 800, 1, 'Cabo Verde',    ['Vozinha','Léo Andrade','Steven Fortes','Stopira','Dylan Tavares','Roberto Lopes','Garry Rodrigues','Ryan Mendes','Jamiro Monteiro','Jeffrey Fortes','Diney Borges','Júlio Tavares','Kenny Rocha Santos','Patrick Andrade','Carlos Daniel','Vagner Borges','Jair Andrade','Heldon'], [0,6,7,8,11]),
  ...makeTeam('H', 800, 2, 'Arábia Saudita',['Mohammed Al-Owais','Yasser Al-Mosailem','Saud Abdulhamid','Ali Al-Bulayhi','Hassan Al-Tambakti','Abdullah Madu','Mohamed Kanno','Salman Al-Faraj','Ali Al-Hassan','Sami Al-Najei','Salem Al-Dawsari','Firas Al-Buraikan','Saleh Al-Shehri','Abdulrahman Ghareeb','Nasser Al-Dawsari','Mohammed Al-Burayk','Riyadh Sharahili','Yasser Al-Shahrani'], [0,2,10,11,12]),
  ...makeTeam('H', 800, 3, 'Uruguai',       ['Fernando Muslera','Sebastián Sosa','José María Giménez','Diego Godín','Martín Cáceres','Mathías Olivera','Nahitan Nández','Rodrigo Bentancur','Federico Valverde','Lucas Torreira','Matías Vecino','Darwin Núñez','Luis Suárez','Edinson Cavani','Facundo Pellistri','Maximiliano Gómez','Nicolás De La Cruz','Agustín Canobbio'], [2,7,8,11,12]),
];

const GRUPO_I = [
  ...makeTeam('I', 900, 0, 'França',   ['Hugo Lloris','Mike Maignan','Jules Koundé','William Saliba','Raphaël Varane','Théo Hernández','Lucas Hernández','Aurélien Tchouaméni','Adrien Rabiot','Eduardo Camavinga','Antoine Griezmann','Ousmane Dembélé','Kylian Mbappé','Kingsley Coman','Olivier Giroud','Marcus Thuram','Christopher Nkunku','Randal Kolo Muani'], [1,2,3,5,7,9,10,11,12,15]),
  ...makeTeam('I', 900, 1, 'Senegal',  ['Édouard Mendy','Seny Dieng','Kalidou Koulibaly','Abdou Diallo','Fodé Ballo-Touré','Formose Mendy','Idrissa Gueye','Pape Matar Sarr','Nampalys Mendy','Krepin Diatta','Sadio Mané','Ismaïla Sarr','Boulaye Dia','Famara Diédhiou','Nicolas Jackson','Lamine Camara','Pape Guèye','Habib Diallo'], [0,2,6,7,10,11,12,14,15]),
  ...makeTeam('I', 900, 2, 'Iraque',   ['Jalal Hassan','Fahad Talib','Ali Adnan','Amjad Attwan','Ahmed Ibrahim','Rebin Sulaka','Hussein Ali','Alaa Abbas','Mohanad Ali','Aymen Hussein','Bashar Resan','Saad Natiq','Mustafa Nadhim','Amir Al-Ammari','Karrar Mohamed','Yousif Amir','Humam Tariq','Ali Jasim'], [6,8]),
  ...makeTeam('I', 900, 3, 'Noruega',  ['Ørjan Nyland','Rune Jarstein','Stefan Strandberg','Leo Østigård','Andreas Hanche-Olsen','Birger Meling','Kristoffer Ajer','Sander Berge','Martin Ødegaard','Mathias Normann','Patrick Berg','Erling Haaland','Alexander Sørloth','Mohamed Elyounoussi','Marcus Pedersen','Jens Petter Hauge','Antonio Nusa','Ola Aina'], [7,8,11,12]),
];

const GRUPO_J = [
  ...makeTeam('J', 1000, 0, 'Argentina', ['Emiliano Martínez','Franco Armani','Cristian Romero','Nicolás Otamendi','Lisandro Martínez','Nicolás Tagliafico','Nahuel Molina','Rodrigo De Paul','Enzo Fernández','Alexis Mac Allister','Lionel Messi','Ángel Di María','Lautaro Martínez','Julián Álvarez','Paulo Dybala','Leandro Paredes','Thiago Almada','Giovani Lo Celso'], [0,2,4,7,8,9,10,11,12,13,14]),
  ...makeTeam('J', 1000, 1, 'Argélia',   ["Raïs M'Bolhi",'Alexandre Oukidja','Aïssa Mandi','Ramy Bensebaïni','Djamel Benlamri','Zinedine Ferhat','Ismaël Bennacer','Adlène Guedioura','Sofiane Feghouli','Riyad Mahrez','Islam Slimani','Yacine Brahimi','Baghdad Bounedjah','Andy Delort','Djalel Benali','Mohamed Amine Amoura','Houssem Aouar','Saïd Benrahma'], [0,3,6,9,10,11,15,16]),
  ...makeTeam('J', 1000, 2, 'Áustria',   ['Patrick Pentz','Alexander Schlager','David Alaba','Aleksandar Dragović','Philipp Lienhart','Stefan Posch','Andreas Weimann','Marcel Sabitzer','Florian Grillitsch','Nicolas Seiwald','Xaver Schlager','Christoph Baumgartner','Marko Arnautović','Michael Gregoritsch','Sasa Kalajdzic','Patrick Wimmer','Romano Schmid','Florian Kainz'], [2,7,10,11,12]),
  ...makeTeam('J', 1000, 3, 'Jordânia',  ['Amer Shafi','Mahmoud Eid','Ahmad Ibrahim','Ehsan Haddad','Abdallah Nasib','Yazan Naouri','Musa Al-Taamari',"Baha' Faisal",'Mohammad Qatawneh','Mahmoud Jaber','Mousa Suleiman','Hamza Al-Dardour','Zaid Qunbar','Yazan Al-Naimat','Khaled Al-Zoubi','Oday Al-Dabbagh','Nizar Al-Aseel','Fares Shafiei'], [0,6,11,13]),
];

const GRUPO_K = [
  ...makeTeam('K', 1100, 0, 'Portugal',     ['Diogo Costa','Rui Patrício','João Cancelo','Rúben Dias','Pepe','Nuno Mendes','Danilo Pereira','Vitinha','Bernardo Silva','Bruno Fernandes','João Félix','Rafael Leão','Cristiano Ronaldo','Pedro Gonçalves','Gonçalo Ramos','Diogo Jota','André Silva','Ricardo Horta'], [0,2,3,5,7,8,9,10,11,12,14]),
  ...makeTeam('K', 1100, 1, 'RD Congo',     ['Joël Kiassumbua','Ley Matampi','Chancel Mbemba','Marcel Tisserand','Silas Wissa','Arthur Masuaku','Yannick Bolasie','Cédric Bakambu','Jonathan Bolingi','Britt Assombalonga','Dieumerci Mbokani','Neeskens Kebano','Théo Bongonda','Yoane Wissa','Maxwel Cornet','Doumbia Fiston','Christian Luyindama','Merveille Boupendza'], [2,6,7,11,13,14]),
  ...makeTeam('K', 1100, 2, 'Uzbequistão', ['Eldor Shomurodov','Otabek Shukurov','Sanjar Kuvvatov','Dostonbek Khamdamov','Akbar Turobov','Sherzod Nishonov','Temur Juraev','Jaloliddin Masharipov','Abbosbek Fayzullaev','Islom Tukhtamurodov','Odil Ahmedov','Aziz Xoʻjayev','Jasur Yaxshiboyev','Oybek Ibragimov','Khojiakbar Alijonov','Shokhrukh Toshmatov','Otabek Nomonov','Husan Hasanov'], [0,7,8,10]),
  ...makeTeam('K', 1100, 3, 'Colômbia',    ['Camilo Vargas','David Ospina','Carlos Cuesta','Dávinson Sánchez','Yerry Mina','Jhon Lucumí','Johan Mojica','Wilmar Barrios','Richard Ríos','James Rodríguez','Juan Cuadrado','Luis Díaz','Luis Fernando Muriel','Jhon Córdoba','Rafael Santos Borré','Sebastián Villa','Daniel Muñoz','Jhon Arias'], [1,3,8,9,11,17]),
];

const GRUPO_L = [
  ...makeTeam('L', 1200, 0, 'Inglaterra', ['Jordan Pickford','Aaron Ramsdale','Kieran Trippier','Kyle Walker','John Stones','Harry Maguire','Luke Shaw','Declan Rice','Jude Bellingham','Phil Foden','Mason Mount','Bukayo Saka','Raheem Sterling','Harry Kane','Marcus Rashford','Jack Grealish','Trent Alexander-Arnold','Cole Palmer'], [0,2,4,7,8,9,11,13,14,16,17]),
  ...makeTeam('L', 1200, 1, 'Croácia',   ['Dominik Livaković','Ivo Grbić','Joško Gvardiol','Dejan Lovren','Duje Ćaleta-Car','Borna Sosa','Ivan Perišić','Luka Modrić','Mateo Kovačić','Marcelo Brozović','Mario Pašalić','Lovro Majer','Andrej Kramarić','Marko Livaja','Bruno Petković','Ivan Zucko','Mislav Oršić','Martin Erlić'], [0,2,6,7,8,9,11,12,16]),
  ...makeTeam('L', 1200, 2, 'Gana',      ['Lawrence Ati-Zigi','Joe Wollacott','Thomas Partey','Daniel Amartey','Andrew Ayew','Denis Odoi','Baba Rahman','Mubarak Wakaso','André Ayew','Jordan Ayew','Mohammed Kudus','Kamaldeen Sulemana','Inaki Williams','Tariq Lamptey','Alexander Djiku','Stephan Ambrosius','Osman Bukari','Elisha Owusu'], [0,2,8,9,10,11,12]),
  ...makeTeam('L', 1200, 3, 'Panamá',    ['Luis Mejía','José Calderón','Eric Davis','Fidel Escobar','Andrés Andrade','Harold Cummings','Óscar Linton','Aníbal Godoy','Adalberto Carrasquilla','Édgar Bárcenas','Armando Cooper','Rolando Blackburn','Cecilio Waterman','Gabriel Torres','Ismael Díaz','Abdiel Ayarza','Alberto Quintero','Michael Murillo'], [0,4,8,11,12]),
];

export const COPA_2026_STICKERS: Sticker[] = [
  ...FWC,
  ...GRUPO_A, ...GRUPO_B, ...GRUPO_C, ...GRUPO_D,
  ...GRUPO_E, ...GRUPO_F, ...GRUPO_G, ...GRUPO_H,
  ...GRUPO_I, ...GRUPO_J, ...GRUPO_K, ...GRUPO_L,
];

export const TOTAL_STICKERS = COPA_2026_STICKERS.length;
export const SECTIONS  = Array.from(new Set(COPA_2026_STICKERS.map(s => s.section)));
export const COUNTRIES = Array.from(new Set(COPA_2026_STICKERS.map(s => s.country)));

export const getStickersBySection = (section: string) =>
  COPA_2026_STICKERS.filter(s => s.section === section);

export const getStickerById = (id: number) =>
  COPA_2026_STICKERS.find(s => s.id === id);
