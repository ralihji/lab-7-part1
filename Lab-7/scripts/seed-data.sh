#!/usr/bin/env bash
#
# SEG3502 Lab 7 : remplit la base de données (vide au départ) en passant par l'API REST.
# Ajoute 5 livres et 4 auteurs (avec leur biographie) pour tester la page « Authors ».
#
# Prérequis : MySQL (Docker) et le serveur Spring Boot démarrés (./gradlew bootRun).
# Usage     : bash scripts/seed-data.sh            (API : http://localhost:8080/books-api)
#             bash scripts/seed-data.sh --force    (ajoute les données même si la base contient déjà des livres)
# Windows   : lancer la même commande dans Git Bash (installé avec Git).
#
set -euo pipefail

API="http://localhost:8080/books-api"
FORCE=false
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    http*)   API="${arg%/}" ;;
    *)       echo "Option inconnue : $arg" >&2; exit 1 ;;
  esac
done

# Le serveur répond-il ?
status=$(curl -s -o /dev/null -w '%{http_code}' "$API/books" || true)
if [ "$status" != "200" ]; then
  echo "Le serveur ne répond pas sur $API (code HTTP : $status)." >&2
  echo "Démarrez d'abord MySQL puis le serveur : cd server && ./gradlew bootRun" >&2
  exit 1
fi

# La base contient-elle déjà des livres ? (une collection vide n'a pas de « _embedded »)
if [ "$FORCE" = false ] && curl -s "$API/books" | grep -q '"_embedded"'; then
  echo "La base contient déjà des livres : rien n'a été ajouté."
  echo "Relancez avec --force pour ajouter les données quand même."
  exit 0
fi

# POST d'un objet JSON ; affiche l'id lu dans l'en-tête Location de la réponse 201 Created.
post() {
  local path="$1" json="$2" headers code location
  headers=$(curl -s -D - -o /dev/null -X POST "$API$path" \
    -H "Content-Type: application/json" -d "$json")
  code=$(printf '%s\n' "$headers" | head -n 1 | awk '{print $2}')
  if [ "$code" != "201" ]; then
    echo "Échec : POST $path (code HTTP : $code)" >&2
    exit 1
  fi
  location=$(printf '%s\n' "$headers" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
  echo "${location##*/}"
}

# Ajoute un livre ; affiche son id.
add_book() { # titre catégorie isbn prix année description
  post "/books" "{\"title\":\"$1\",\"category\":\"$2\",\"isbn\":\"$3\",\"cost\":$4,\"year\":$5,\"description\":\"$6\"}"
}

# Crée un nouvel auteur (et sa biographie) pour un livre ; affiche l'id de l'auteur.
add_new_author() { # idLivre prénom nom biographie
  post "/books/$1/authors" "{\"firstName\":\"$2\",\"lastName\":\"$3\",\"bio\":{\"biodata\":\"$4\"}}"
}

# Ajoute un auteur existant à un livre (PATCH, réponse 204 No Content).
link_author() { # idLivre idAuteur
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$API/books/$1/authors/$2")
  if [ "$code" != "204" ]; then
    echo "Échec : PATCH /books/$1/authors/$2 (code HTTP : $code)" >&2
    exit 1
  fi
}

b1=$(add_book "SpringBoot JPA and REST" "Tech" "4444-777-3423" 25.45 2017 \
  "This is by far the best resource for SpringBoot, JPA and REST")
b2=$(add_book "Angular for Beginners" "Tech" "4444-777-3424" 39.99 2022 \
  "Build single-page applications with components, routing and HTTP.")
b3=$(add_book "Kotlin in Practice" "Tech" "4444-777-3425" 42.50 2021 \
  "Practical Kotlin for the JVM, from the basics to Spring Boot.")
b4=$(add_book "Easy Weeknight Recipes" "Cook" "4444-777-3426" 19.99 2020 \
  "Fifty simple dinners ready in thirty minutes.")
b5=$(add_book "Bedtime Stories for Little Readers" "Kids" "4444-777-3427" 12.75 2019 \
  "Short illustrated stories to read aloud.")

koredo=$(add_new_author "$b1" "Koredo" "Tablanga" \
  "Software architect and trainer. Koredo writes about Spring Boot, JPA and REST APIs.")
link_author "$b2" "$koredo"
amina=$(add_new_author "$b2" "Amina" "Diallo" \
  "Front-end developer and home cook who teaches Angular in Ottawa.")
link_author "$b4" "$amina"
marc=$(add_new_author "$b3" "Marc" "Tremblay" \
  "Kotlin developer who has built JVM back ends for ten years.")
sofia=$(add_new_author "$b5" "Sofia" "Rossi" "")

echo "Livres ajoutés  : ids $b1, $b2, $b3, $b4, $b5"
echo "Auteurs ajoutés : Koredo Tablanga ($koredo), Amina Diallo ($amina), Marc Tremblay ($marc), Sofia Rossi ($sofia, sans biographie)"
echo "Essayez la page Authors : http://localhost:4200/authors/$koredo"
