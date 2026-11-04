/*
 * Modèle utilisé par la page « Authors ».
 *
 * L'API renvoie un auteur au format HAL (hal+json) :
 *   GET /books-api/authors/{id}
 *   {
 *     "id": 1, "firstName": "Koredo", "lastName": "Tablanga",
 *     "books": [ { "title": "...", "_links": { "self": { "href": ".../books-api/books/1" } } } ],
 *     "_links": { "self": { "href": ".../authors/1" }, "bio": { "href": ".../authors/1/bio" } }
 *   }
 * On le convertit en AuthorDetails, plus simple à afficher.
 */

/** Lien hypermédia HAL. */
export interface HalLink {
  href: string;
}

/** Livre d'un auteur, tel que renvoyé par l'API (BookTitleRepresentation). */
export interface AuthorBookResource {
  title: string;
  _links?: { self?: HalLink };
}

/** Auteur, tel que renvoyé par l'API (AuthorRepresentation). */
export interface AuthorResource {
  id: number;
  firstName: string;
  lastName: string;
  books?: AuthorBookResource[];
  _links?: { self?: HalLink; bio?: HalLink };
}

/** Biographie, telle que renvoyée par GET /books-api/authors/{id}/bio (BioRepresentation). */
export interface BioResource {
  id: number;
  biodata: string;
  _links?: { self?: HalLink };
}

/** Livre affiché dans la fiche d'un auteur. */
export interface AuthorBook {
  /** Id du livre, lu à la fin de son lien self (null si le lien manque). */
  id: number | null;
  title: string;
}

/** Informations d'un auteur affichées par la page Authors. */
export interface AuthorDetails {
  id: number;
  firstName: string;
  lastName: string;
  books: AuthorBook[];
  /** Lien HATEOAS vers la biographie (null si l'API ne le fournit pas). */
  bioUrl: string | null;
}

/**
 * Met en forme l'id saisi : espaces et zéros du début retirés (« 007 » donne « 7 »).
 * Renvoie null si ce n'est pas un entier supérieur à 0. On s'arrête à 18 chiffres,
 * car le serveur stocke l'id dans un Long (valeur maximale à 19 chiffres).
 * L'id reste du texte : Number() arrondirait les très grands nombres.
 */
export function normalizeAuthorId(value: string | null | undefined): string | null {
  const text = (value ?? '').trim();
  if (!/^\d{1,18}$/.test(text)) {
    return null;
  }
  const id = text.replace(/^0+/, '');
  return id === '' ? null : id;
}

/** Indique si le texte saisi est un id d'auteur valide. */
export function isValidAuthorId(value: string | null | undefined): boolean {
  return normalizeAuthorId(value) !== null;
}

/** Lit l'id à la fin d'un lien, par ex. « http://localhost:8080/books-api/books/7 » donne 7. */
export function idFromHref(href: string | null | undefined): number | null {
  if (!href) {
    return null;
  }
  const match = /\/(\d+)\/?$/.exec(href);
  return match ? Number(match[1]) : null;
}

/** Convertit la réponse HAL de l'API en AuthorDetails. */
export function toAuthorDetails(resource: AuthorResource): AuthorDetails {
  return {
    id: resource.id,
    firstName: resource.firstName,
    lastName: resource.lastName,
    books: (resource.books ?? []).map(book => ({
      id: idFromHref(book._links?.self?.href),
      title: book.title
    })),
    bioUrl: resource._links?.bio?.href ?? null
  };
}
