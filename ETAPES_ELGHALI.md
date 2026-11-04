# Lab 7 SEG3502 · Partie de Hjiyej Andaloussi Elghali (à faire EN PREMIER)

Ta partie : la logique de l'exercice « Authors ».

- `client/src/app/authors/model/author-details.ts` : format HAL de l'API, conversion, vérification de l'id
- `client/src/app/books/service/books.service.ts` : `getAuthor(id)` et `getAuthorBio(auteur)`
- `client/src/app/app.routes.ts` : routes `/authors` et `/authors/:id`
- `client/src/app/authors/authors.component.ts` et `author/author.component.ts` : logique des deux pages
- Templates simples (Brayan les remplacera par la version finale) et 24 tests unitaires
- `scripts/seed-data.sh` : remplit la base vide avec des livres et des auteurs
- `.gitignore` à la racine

Le dossier `Lab-7/` de ce zip contient déjà le code de départ du prof avec ta partie.
Le serveur (`server/`) n'est pas modifié.

## 1. Créer le dépôt sur GitHub

Sur le compte `ralihji` (comme Lab-5) : **New repository**, nom **`Lab-7`**, même visibilité que Lab-5.
Ne coche **rien** (pas de README, pas de .gitignore, pas de licence) : le dépôt doit être vide.

> Garde bien le nom `Lab-7` : le README et le rapport de Brayan utilisent l'adresse
> `https://github.com/ralihji/Lab-7`. Si tu prends un autre nom, préviens Brayan.

## 2. Envoyer ta partie (un seul commit)

Décompresse le zip, ouvre un terminal **dans le dossier `Lab-7`**, puis :

```bash
git init
git add .
git update-index --chmod=+x server/gradlew scripts/seed-data.sh
git commit -m "Lab 7 : code de départ + partie Elghali (logique Authors, service, routes, tests, données)"
git branch -M main
git remote add origin https://github.com/ralihji/Lab-7.git
git push -u origin main
```

La 3e ligne garde `gradlew` et le script exécutables, même si tu es sous Windows.

## 3. Ajouter Brayan au dépôt

GitHub, dépôt `Lab-7` : **Settings > Collaborators > Add people**, entre le nom d'utilisateur
GitHub de Brayan. Il doit accepter l'invitation avant de pouvoir envoyer sa partie.

## 4. (Conseillé) Vérifier que tout marche

```bash
cd client
npm install
npx ng test --watch=false     # doit afficher : TOTAL: 38 SUCCESS
npm start                     # puis ouvrir http://localhost:4200/authors/1
```

Avec MySQL et le serveur démarrés (voir le README du dossier `Lab-7`) et après
`bash scripts/seed-data.sh`, la page `/authors/1` affiche Koredo Tablanga.
Il n'y a pas encore d'option « Authors » dans le menu : c'est la partie de Brayan.

**Ensuite, ne modifie plus les fichiers `app.component.*` ni ceux du dossier `authors/` qui finissent
par `.html`, `.css` ou `.spec.ts` : Brayan va les remplacer.** Si tu dois changer autre chose,
préviens-le avant qu'il fasse son commit.
