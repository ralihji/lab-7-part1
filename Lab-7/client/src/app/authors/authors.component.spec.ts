import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthorsComponent } from './authors.component';
import { AuthorComponent } from './author/author.component';

const API = 'http://localhost:8080/books-api/';

describe('AuthorsComponent', () => {
  let harness: RouterTestingHarness;
  let component: AuthorsComponent;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorsComponent],
      providers: [
        provideRouter([
          {path: 'authors', component: AuthorsComponent, children: [{path: ':id', component: AuthorComponent}]}
        ]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/authors', AuthorsComponent);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // aucune requête inattendue
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not search when the field is empty and asks for an id', async () => {
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(component.showError).toBeTrue();
    expect(component.validationMessage).toBe('Please enter an author id.');
    expect(router.url).toBe('/authors');
  });

  it('rejects values that are not whole numbers greater than 0', async () => {
    for (const value of ['abc', '0', '-2', '2.5', '   ']) {
      component.authorId.setValue(value);
      component.onSubmit();
      await harness.fixture.whenStable();

      expect(component.showError).withContext(value).toBeTrue();
      expect(router.url).withContext(value).toBe('/authors');
    }
    expect(component.validationMessage).toBe('Please enter an author id.'); // dernier essai : espaces seulement
    component.authorId.setValue('abc');
    expect(component.validationMessage).toBe('The author id must be a whole number greater than 0.');
  });

  it('opens /authors/:id on a valid submit, which sends the request to the API', async () => {
    component.authorId.setValue(' 007 ');
    component.onSubmit();
    await harness.fixture.whenStable();
    harness.detectChanges(); // affiche AuthorComponent, qui lance sa requête

    expect(component.authorId.value).toBe('7');
    expect(router.url).toBe('/authors/7');
    httpMock.expectOne(API + 'authors/7').flush(null, {status: 404, statusText: 'Not Found'});
  });

  it('removes the previous result when an invalid id is submitted', async () => {
    await harness.navigateByUrl('/authors/3');
    httpMock.expectOne(API + 'authors/3').flush(null, {status: 404, statusText: 'Not Found'});

    component.authorId.setValue('abc');
    component.onSubmit();
    await harness.fixture.whenStable();

    expect(router.url).toBe('/authors');
    expect(component.authorId.value).toBe('abc');
    expect(component.showError).toBeTrue();
  });

  it('fills the field with the id found in the address', async () => {
    await harness.navigateByUrl('/authors/12');

    expect(component.authorId.value).toBe('12');
    httpMock.expectOne(API + 'authors/12').flush(null, {status: 404, statusText: 'Not Found'});
  });
});
