# SEG3502 — Laboratoire 7 — Code de départ

Ce fichier ZIP contient les deux parties nécessaires au laboratoire :

- `client/` : application Angular BookStore à étendre;
- `server/` : API REST Spring Boot/Kotlin et accès MySQL.

Le code applicatif correspond au code de départ du laboratoire. Aucun code de la solution de l'exercice
« Authors » n'est inclus.

## 1. Démarrer MySQL

Le serveur utilise MySQL sur le port 6033. Exemple avec Docker :

```bash
docker run -d -p 6033:3306 --name=docker-mysql   --env="MYSQL_ROOT_PASSWORD=root"   --env="MYSQL_PASSWORD=root"   --env="MYSQL_DATABASE=booksDb" mysql
```

## 2. Démarrer le serveur Spring Boot

```bash
cd server
./gradlew bootRun
```

Sous Windows :

```text
gradlew.bat bootRun
```

Le serveur utilise l'URL de base :

```text
http://localhost:8080/books-api
```

Swagger UI est disponible lorsque le serveur fonctionne :

```text
http://localhost:8080/swagger-ui.html
```

## 3. Démarrer le client Angular

Dans un deuxième terminal :

```bash
cd client
npm install
npm start
```

Puis ouvrir :

```text
http://localhost:4200
```

## Exercice évalué

Suivez les consignes du Laboratoire 7. Vous devez étendre l'application de départ afin d'ajouter
l'option **Authors**, permettre la recherche d'un auteur par son identifiant, puis afficher les
informations trouvées ou un message approprié lorsque l'auteur n'existe pas.

Aucun accès à GitHub Classroom n'est nécessaire pour utiliser ce code de départ.
