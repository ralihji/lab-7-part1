import { AuthorResource, idFromHref, isValidAuthorId, normalizeAuthorId, toAuthorDetails } from './author-details';

describe('author-details', () => {
  describe('idFromHref', () => {
    it('reads the id at the end of a link', () => {
      expect(idFromHref('http://localhost:8080/books-api/books/7')).toBe(7);
      expect(idFromHref('http://localhost:8080/books-api/books/12/')).toBe(12);
    });

    it('returns null when there is no id or no link', () => {
      expect(idFromHref('http://localhost:8080/books-api/books')).toBeNull();
      expect(idFromHref(undefined)).toBeNull();
      expect(idFromHref('')).toBeNull();
    });
  });

  describe('normalizeAuthorId / isValidAuthorId', () => {
    it('accepts whole numbers greater than 0 and removes spaces and leading zeros', () => {
      expect(normalizeAuthorId('1')).toBe('1');
      expect(normalizeAuthorId(' 42 ')).toBe('42');
      expect(normalizeAuthorId('007')).toBe('7');
      expect(isValidAuthorId('3')).toBeTrue();
    });

    it('rejects empty, zero, negative, decimal and non-numeric values', () => {
      for (const value of ['', '   ', '0', '000', '-3', '2.5', 'abc', '1e3', '4 5', null, undefined]) {
        expect(normalizeAuthorId(value)).withContext(String(value)).toBeNull();
        expect(isValidAuthorId(value)).withContext(String(value)).toBeFalse();
      }
    });

    it('keeps long ids exact and rejects ids too long for the server (Long)', () => {
      expect(normalizeAuthorId('123456789012345678')).toBe('123456789012345678');
      expect(normalizeAuthorId('1234567890123456789')).toBeNull();
    });
  });

  describe('toAuthorDetails', () => {
    it('converts the HAL resource returned by the API', () => {
      const resource: AuthorResource = {
        id: 1,
        firstName: 'Koredo',
        lastName: 'Tablanga',
        books: [
          { title: 'SpringBoot JPA and REST', _links: { self: { href: 'http://localhost:8080/books-api/books/1' } } },
          { title: 'No link' }
        ],
        _links: {
          self: { href: 'http://localhost:8080/books-api/authors/1' },
          bio: { href: 'http://localhost:8080/books-api/authors/1/bio' }
        }
      };

      expect(toAuthorDetails(resource)).toEqual({
        id: 1,
        firstName: 'Koredo',
        lastName: 'Tablanga',
        books: [
          { id: 1, title: 'SpringBoot JPA and REST' },
          { id: null, title: 'No link' }
        ],
        bioUrl: 'http://localhost:8080/books-api/authors/1/bio'
      });
    });

    it('handles an author without books or links', () => {
      const details = toAuthorDetails({ id: 3, firstName: 'Sofia', lastName: 'Rossi' });
      expect(details.books).toEqual([]);
      expect(details.bioUrl).toBeNull();
    });
  });
});
