import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {noop} from 'rxjs';
import {filter} from 'rxjs/operators';
import {normalizeAuthorId} from './model/author-details';

/** Validation du champ : obligatoire, et entier supérieur à 0. */
export function authorIdValidator(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  if (value === '') {
    return {required: true};
  }
  return normalizeAuthorId(value) === null ? {authorId: true} : null;
}

/**
 * Page « Authors » : formulaire pour saisir l'id d'un auteur.
 * À l'envoi, on ouvre /authors/:id ; le composant enfant AuthorComponent
 * fait la requête à l'API et affiche l'auteur ou un message.
 */
@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterOutlet]
})
export class AuthorsComponent implements OnInit {
  private builder: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private destroyRef: DestroyRef = inject(DestroyRef);

  searchForm = this.builder.nonNullable.group({
    authorId: ['', authorIdValidator]
  });
  submitted = false;

  get authorId(): AbstractControl<string> {
    return this.searchForm.controls.authorId;
  }

  /** Vrai quand le message de validation doit être affiché. */
  get showError(): boolean {
    return this.authorId.invalid && (this.authorId.touched || this.submitted);
  }

  /** Message de validation du champ. */
  get validationMessage(): string {
    if (this.authorId.hasError('required')) {
      return 'Please enter an author id.';
    }
    if (this.authorId.hasError('authorId')) {
      return 'The author id must be a whole number greater than 0.';
    }
    return '';
  }

  ngOnInit(): void {
    // Garde le champ synchronisé avec l'adresse (/authors/4, retour arrière du navigateur...).
    this.fillFromUrl();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.fillFromUrl());
  }

  onSubmit(): void {
    this.submitted = true;
    const id = normalizeAuthorId(this.authorId.value);
    if (id === null) {
      this.authorId.markAsTouched();
      // Retire le résultat d'une recherche précédente : retour sur /authors.
      if (this.route.firstChild) {
        this.router.navigate(['./'], {relativeTo: this.route}).then(noop);
      }
      return;
    }
    this.authorId.setValue(id);
    this.router.navigate(['./', id], {relativeTo: this.route}).then(noop);
  }

  private fillFromUrl(): void {
    const id = this.route.firstChild?.snapshot.paramMap.get('id');
    if (id != null && id !== this.authorId.value) {
      this.authorId.setValue(id);
    }
  }
}
