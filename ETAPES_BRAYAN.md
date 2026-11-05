# Lab 7 SEG3502 · Partie de Brayan Adou (à faire APRÈS le commit d'Elghali)

Ta partie : l'interface, le README et le rapport.

- Option **Authors** dans la barre de navigation (`app.component.*`), page active mise en évidence
- Templates HTML et CSS de la page de recherche et de la fiche d'un auteur
- 8 tests d'affichage (ajoutés à ceux d'Elghali, rien n'est retiré)
- `README.md` complet, captures (`docs/captures/`) et rapport PDF (`docs/`)

Le dossier `fichiers-a-copier/` a la même structure que le dépôt : on le copie par-dessus.

## 1. Récupérer le dépôt (après le push d'Elghali)

Accepte d'abord l'invitation d'Elghali (courriel ou notifications GitHub), puis :

```bash
git clone https://github.com/ralihji/Lab-7.git
cd Lab-7
```

(Si tu l'avais déjà cloné : `git pull`.)

## 2. Copier tes fichiers dans le dépôt

Copie **le contenu** de `fichiers-a-copier/` dans le dossier `Lab-7/`, en remplaçant les fichiers :

- **Explorateur Windows** : ouvre `fichiers-a-copier`, `Ctrl + A`, `Ctrl + C`, ouvre `Lab-7`,
  `Ctrl + V`, puis « Remplacer les fichiers dans la destination ».
- **Ou en ligne de commande** (le zip décompressé à côté de `Lab-7`) :
  - Windows : `robocopy fichiers-a-copier Lab-7 /E`
  - macOS / Linux : `cp -R fichiers-a-copier/. Lab-7/`

## 3. Vérifier puis envoyer (un seul commit)

Dans `Lab-7`, `git status` doit montrer exactement ceci : 11 fichiers modifiés et le dossier `docs/`.

```
 M README.md
 M client/src/app/app.component.css
 M client/src/app/app.component.html
 M client/src/app/app.component.spec.ts
 M client/src/app/app.component.ts
 M client/src/app/authors/author/author.component.css
 M client/src/app/authors/author/author.component.html
 M client/src/app/authors/author/author.component.spec.ts
 M client/src/app/authors/authors.component.css
 M client/src/app/authors/authors.component.html
 M client/src/app/authors/authors.component.spec.ts
?? docs/
```

```bash
git add .
git commit -m "Lab 7 : partie Brayan (menu Authors, templates et CSS, tests d'affichage, README, rapport)"
git push
```

## 4. Vérifier avant la remise (15 minutes, fortement conseillé)

Suis le README : MySQL avec Docker, `./gradlew bootRun` dans `server/`,
`bash scripts/seed-data.sh` à la racine, puis `npm install` et `npm start` dans `client/`.
Ouvre `http://localhost:4200`, clique sur **Authors** et essaie `1`, `4`, `99` et `abc` :
tu dois voir la même chose que dans les captures du rapport.
`npx ng test --watch=false` dans `client/` doit afficher `TOTAL: 46 SUCCESS`.

## 5. Remise sur Brightspace (avant le 4 novembre, 23 h 59)

- Le lien du dépôt : `https://github.com/ralihji/Lab-7`
- Le rapport : `Rapport_Lab7_SEG3502_Adou_Elghali.pdf` (aussi dans `docs/` du dépôt)
