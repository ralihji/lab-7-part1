# SEG3502 · Laboratoire 7 · Services Web de données

Application **Book Store** : API REST Spring Boot (Kotlin, Spring Data JPA, Spring HATEOAS, MySQL) et
client Angular 18 qui la consomme.

**Exercice réalisé :** une option **Authors** a été ajoutée à la barre de navigation. Elle affiche un
formulaire où l'on entre l'id d'un auteur. À l'envoi, le client interroge l'API
(`GET /books-api/authors/{id}`) et affiche les informations de l'auteur (prénom, nom, livres,
biographie). Si aucun auteur n'a cet id, un message approprié est affiché.

| Équipe | Numéro | Partie |
| --- | --- | --- |
| Hjiyej Andaloussi Elghali | 300379897 | Logique : modèle, service HTTP, routes, logique des composants, tests, script de données |
| Brayan Adou | 300433616 | Interface : menu Authors, templates HTML et CSS, tests d'affichage, README et rapport |

![Page Authors](docs/captures/02-auteur-trouve.png)

## Fonctionnement

1. **Menu Authors** (`/authors`) : formulaire avec le champ *Author Id* et le bouton *Search*.
   Le champ est validé avant tout envoi : il doit contenir un entier supérieur à 0.
2. **Envoi** : l'application ouvre `/authors/:id` (comme `/books/:id` pour les livres).
   Le composant `AuthorComponent` envoie `GET /books-api/authors/{id}`.
3. **Auteur trouvé** : fiche avec prénom, nom, livres (chaque titre ouvre la page du livre) et
   biographie. La biographie est chargée en suivant le lien HATEOAS `_links.bio.href` de la réponse.
4. **Auteur introuvable** (réponse 404) : « Author not found. Sorry, no author was found with id … ».
   Un message est aussi prévu si l'id est invalide, si le serveur est arrêté ou s'il renvoie une erreur.

Le serveur Spring Boot est celui du code de départ : il n'a pas été modifié. La route
`GET /books-api/authors/{id}` existait déjà.

## Fichiers ajoutés ou modifiés

```
client/src/app/
├── app.routes.ts                       routes /authors et /authors/:id
├── app.component.html|ts|css|spec.ts   option « Authors » dans la barre de navigation
├── books/service/books.service.ts      getAuthor(id) et getAuthorBio(auteur)
├── books/service/books.service.spec.ts
└── authors/
    ├── model/author-details.ts         format HAL de l'API, conversion, validation de l'id
    ├── authors.component.*             formulaire de recherche (page /authors)
    └── author/author.component.*       requête et affichage de l'auteur (page /authors/:id)
scripts/seed-data.sh                    ajoute des livres, des auteurs et leurs biographies via l'API
docs/                                   rapport PDF et captures d'écran
```

## Installer et exécuter

### Prérequis

- **Docker** (pour MySQL).
- **Java 17** : le wrapper Gradle 8.0 du projet ne démarre pas avec Java 21 (vérifier avec `java -version`).
- **Node.js** 18.19+, 20.11+ ou 22+ (vérifier avec `node -v`) ; npm est fourni avec Node.js.
- **Git** (Git Bash sous Windows, pour le script de données).

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/ralihji/Lab-7.git
   cd Lab-7
   ```

2. **Démarrer MySQL** (port 6033, base `booksDb`, utilisateur `root` / `root`)

   ```bash
   docker run -d -p 6033:3306 --name=docker-mysql --env="MYSQL_ROOT_PASSWORD=root" --env="MYSQL_PASSWORD=root" --env="MYSQL_DATABASE=booksDb" mysql
   ```

   Les fois suivantes : `docker start docker-mysql`. Attendre une vingtaine de secondes au premier
   démarrage, le temps que MySQL crée la base.

3. **Démarrer le serveur Spring Boot** (premier terminal)

   ```bash
   cd server
   ./gradlew bootRun        # Windows : gradlew.bat bootRun
   ```

   L'API répond sur `http://localhost:8080/books-api` et Swagger UI sur
   `http://localhost:8080/swagger-ui.html`. Hibernate crée les tables au démarrage.

4. **Ajouter des données d'exemple** (deuxième terminal, à la racine du dépôt)

   ```bash
   bash scripts/seed-data.sh
   ```

   La base est vide au départ. Le script ajoute 5 livres et 4 auteurs puis affiche leurs ids
   (sur une base neuve : 1 Koredo Tablanga, 2 Amina Diallo, 3 Marc Tremblay, 4 Sofia Rossi sans biographie).
   Il ne fait rien si la base contient déjà des livres (option `--force` pour ajouter quand même).
   On peut aussi ajouter des livres et leurs auteurs avec la page **Admin** (login `admin` / `password`).

5. **Démarrer le client Angular** (troisième terminal)

   ```bash
   cd client
   npm install
   npm start
   ```

6. **Ouvrir** `http://localhost:4200`, cliquer sur **Authors**, entrer `1` puis **Search**.
   Un id inexistant (par exemple `99`) affiche le message « Author not found ».

7. **Arrêter** : `Ctrl + C` dans les terminaux du serveur et du client, puis `docker stop docker-mysql`.

### Tests et compilation du client

```bash
cd client
npx ng test --watch=false     # 46 tests (Karma + Chrome)
npx ng build                  # version de production dans dist/book-store/
```

Les avertissements de `ng build` (budget de 512 kB dépassé, 2 règles CSS de Bootstrap ignorées)
existent déjà dans le code de départ : ils viennent de la feuille de style Bootstrap.

### Problèmes fréquents

- **« Unable to reach the Books API »** dans la page Authors : le serveur n'est pas démarré, ou la page
  est ouverte avec `127.0.0.1` au lieu de `localhost` (le serveur n'autorise que
  `http://localhost:4200`, voir `@CrossOrigin` dans `ApiController`).
- **`Communications link failure`** au démarrage du serveur : MySQL n'est pas encore prêt ou le
  conteneur est arrêté (`docker start docker-mysql`).
- **Port 4200 occupé** : `npx ng serve --port 4300`, mais le serveur n'acceptera alors pas les requêtes
  (CORS) ; mieux vaut arrêter l'autre serveur.
