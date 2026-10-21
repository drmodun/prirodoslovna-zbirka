import { Language } from '@prisma/client';

// Croatian versions of the API's error messages. The messages are written in
// English in the code, so English needs no table.
const EXACT: Record<string, string> = {
  // Nest's defaults
  'Bad Request': 'Neispravan zahtjev',
  Unauthorized: 'Niste prijavljeni ili nemate ovlasti',
  Forbidden: 'Zabranjeno',
  'Not Found': 'Nije pronađeno',
  Conflict: 'Sukob s postojećim podacima',
  'Internal server error': 'Greška na poslužitelju',
  // Accounts
  'User not found': 'Korisnik nije pronađen',
  'Invalid credentials': 'Neispravni podaci za prijavu',
  'Email is required': 'E-mail adresa je obavezna',
  'Password is required': 'Lozinka je obavezna',
  'Reset link is invalid or has expired':
    'Poveznica za resetiranje nije ispravna ili je istekla',
  // Organisations and members
  'Already a member': 'Već ste član',
  'Member not found': 'Član nije pronađen',
  'You are not a member': 'Niste član',
  'User is not a member': 'Korisnik nije član',
  "You don't have admin rights for this organisation":
    'Nemate administratorska prava za ovu organizaciju',
  'Only platform moderators can approve organisations':
    'Samo moderatori platforme mogu odobravati organizacije',
  'Only organisation admins can delete an exponat':
    'Samo administratori organizacije mogu obrisati eksponat',
  // Posts and works
  "You cannot update this post because it is not yours and you don't have admin rights":
    'Ne možete uređivati ovu objavu jer nije vaša i nemate administratorska prava',
  "You cannot delete this post because it is not yours and you don't have admin rights":
    'Ne možete obrisati ovu objavu jer nije vaša i nemate administratorska prava',
  "You cannot approve or disapprove this post because you don't have admin rights":
    'Ne možete odobriti ili odbiti ovu objavu jer nemate administratorska prava',
  "You cannot see unapproved posts because you don't have admin rights":
    'Ne možete vidjeti neodobrene objave jer nemate administratorska prava',
  'Not enough rights to perform this action':
    'Nemate dovoljno prava za ovu radnju',
  'Work not found': 'Rad nije pronađen',
  'Work not approved': 'Rad nije odobren',
  'Work not created': 'Rad nije napravljen',
  'Work not updated': 'Rad nije ažuriran',
  'Work not removed': 'Rad nije uklonjen',
  'Toggling save status failed': 'Spremanje nije uspjelo',
  // Quizzes
  'Log in to take this quiz': 'Prijavite se da biste riješili ovaj kviz',
  'This quiz can only be taken once': 'Ovaj kviz se može riješiti samo jednom',
  'This attempt belongs to someone else':
    'Ovaj pokušaj pripada drugom korisniku',
  'This attempt was already submitted': 'Ovaj pokušaj je već predan',
  'The time limit was exceeded': 'Vrijeme je isteklo',
  // Files
  'File upload failed': 'Prijenos datoteke nije uspio',
  'Invalid file name': 'Neispravan naziv datoteke',
  'Invalid recording name': 'Neispravan naziv snimke',
  'Recording already exists': 'Snimka već postoji',
  // Notifications
  'You can only follow your own stream': 'Možete pratiti samo svoje obavijesti',
  'Unknown notification message': 'Nepoznata obavijest',
  // Queries
  'Invalid pagination params': 'Neispravni parametri stranica',
  'Invalid pagination params: Max size is 100':
    'Neispravni parametri stranica: najveća veličina je 100',
  'Invalid filter parameter': 'Neispravan parametar filtra',
  'Invalid sort parameter': 'Neispravan parametar sortiranja',
};

// Messages with a value in them, including class-validator's.
const PATTERNS: [RegExp, (...groups: string[]) => string][] = [
  [
    /^Sorry, you cannot post a work to(.*)$/,
    (id) => `Ne možete objaviti rad u organizaciji${id}`,
  ],
  [
    /^Question (.+) is not part of this quiz$/,
    (q) => `Pitanje ${q} nije dio ovog kviza`,
  ],
  [
    /^Question (.+) answered twice$/,
    (q) => `Pitanje ${q} je odgovoreno dvaput`,
  ],
  [
    /^Invalid sort property: (.+)$/,
    (p) => `Neispravno svojstvo sortiranja: ${p}`,
  ],
  [
    /^Invalid filter property: (.+)$/,
    (p) => `Neispravno svojstvo filtra: ${p}`,
  ],
  [/^Invalid filter rule: (.+)$/, (r) => `Neispravno pravilo filtra: ${r}`],
  [/^Validation failed \((.+)\)$/, (d) => `Provjera nije uspjela (${d})`],
  [/^(\S+) must be an email$/, (f) => `${f} mora biti ispravna e-mail adresa`],
  [/^(\S+) should not be empty$/, (f) => `${f} ne smije biti prazno`],
  [/^(\S+) must be a string$/, (f) => `${f} mora biti tekst`],
  [/^(\S+) must be a boolean value$/, (f) => `${f} mora biti da ili ne`],
  [/^(\S+) must be a number.*$/, (f) => `${f} mora biti broj`],
  [/^(\S+) must be a UUID$/, (f) => `${f} mora biti UUID`],
  [/^(\S+) must be an array$/, (f) => `${f} mora biti popis`],
  [
    /^(\S+) must be a valid enum value$/,
    (f) => `${f} nema dopuštenu vrijednost`,
  ],
  [
    /^(\S+) must be one of the following values: (.+)$/,
    (f, v) => `${f} mora biti jedna od vrijednosti: ${v}`,
  ],
  [/^(\S+) is not strong enough$/, (f) => `${f} nije dovoljno jaka`],
  [
    /^(\S+) must be longer than or equal to (\d+) characters$/,
    (f, n) => `${f} mora imati barem ${n} znakova`,
  ],
  [
    /^(\S+) must be shorter than or equal to (\d+) characters$/,
    (f, n) => `${f} može imati najviše ${n} znakova`,
  ],
];

export const translateErrorMessage = (message: string, language: Language) => {
  if (language !== 'HR') return message;
  if (message in EXACT) return EXACT[message];
  for (const [pattern, render] of PATTERNS) {
    const match = message.match(pattern);
    if (match) return render(...match.slice(1));
  }
  return message;
};
