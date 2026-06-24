# Les Montagnettes — WordPress Elementor

Le module utilise uniquement du HTML, du CSS et du JavaScript natif. Il ne
nécessite ni React, ni Sass, ni compilation.

## Prévisualisation

Ouvrir `index.html` avec Live Server. Il redirige automatiquement vers le vrai
module `elementor-module.html`.

Le CSS et le JavaScript sont séparés :

- `chatbot.css` : styles et variables de couleur
- `chatbot.js` : interactions du chatbot, QR code et multilingue
- `assets/logomontagnettes.svg` : logo utilisé dans le bouton d’assistance

## Installation directe dans Elementor

1. Ajouter un widget **HTML** à la page.
2. Ouvrir `elementor-module.html`.
3. Copier tout son contenu dans le widget HTML.
4. Configurer les URL au début du bloc :

```html
data-results-url="/hebergements/"
data-contact-url="/contact/"
data-booking-url="URL_DU_MOTEUR_DE_RESERVATION"
data-spa-url="/spa/"
data-restaurant-url="/restaurant/"
data-checkin-url="URL_DU_CHECK_IN"
data-privacy-url="/politique-de-confidentialite/"
```

Le module est maintenant séparé proprement :

- `elementor-module.html` : structure du widget
- `chatbot.css` : styles et variables de couleur
- `chatbot.js` : interactions

Pour WordPress, héberger `chatbot.css` et `chatbot.js`, puis remplacer les deux
chemins relatifs situés en bas de `elementor-module.html` par leurs URL absolues :

```html
<link rel="stylesheet" href="https://votre-site.fr/.../chatbot.css">
<script src="https://votre-site.fr/.../chatbot.js" defer></script>
```

Un chemin relatif comme `./chatbot.js` fonctionne avec Live Server, mais pas
forcément depuis une page Elementor située à une autre adresse.

Le widget apparaît sous forme d'un bouton flottant en bas à gauche. Le visiteur
clique sur le personnage pour ouvrir ou réduire la fenêtre de conversation.

## Activer le moteur intelligent côté serveur

1. Installer `wordpress-ai-endpoint.php` comme extension WordPress ou mu-plugin.
2. Ajouter la clé côté serveur dans `wp-config.php` :

```php
define('OPENAI_API_KEY', 'votre-cle-api');
```

3. Conserver dans le module :

```html
data-api-url="/wp-json/montagnettes/v1/analyze"
```

La clé n'est jamais placée dans Elementor ou envoyée au navigateur. Si l'API
est indisponible, le module repasse automatiquement sur son moteur local.

## Fonctions disponibles

- Interface française et anglaise
- FAQ et demandes libres
- Préparation d'une demande de disponibilité ou de pré-réservation
- Recommandations de séjour et conciergerie
- Mise en avant du spa et du restaurant
- Passage explicite à un membre de l'équipe
- Mention visible qu'il s'agit d'un assistant Les Montagnettes
- Rappel de ne pas transmettre de données sensibles

## Module interne pour l'équipe

La personnalisation des emails n'est pas affichée aux clients. Elle se trouve
dans un module interne séparé :

```text
conciergerie-equipe.html
```

Ce module permet au personnel de préparer des emails avant, pendant ou après le
séjour, avec propositions de spa, restaurant, activité ou transfert. Les
messages doivent être relus et validés humainement avant envoi.

## Conciergerie client par QR code

La conciergerie destinée au client est une page autonome :

```text
conciergerie-client.html
```

Elle est conçue pour mobile et tablette. Sur la page d'accueil, le module
affiche automatiquement un QR code qui pointe vers cette page, avec l'URL réelle
du site. En local, il pointe vers Live Server ; sur GitHub Pages, il pointera
vers l'adresse GitHub Pages. Le client peut consulter le spa, le
restaurant, les activités, ajouter ou retirer des souhaits et transmettre sa
demande à l'équipe.

Le QR code est généré côté navigateur via `chatbot.js`. Si vous souhaitez un QR
code 100 % hébergé en local, remplacez l'image générée par un fichier SVG/PNG
statique dans `assets/`.

Les disponibilités, tarifs et réservations réels nécessitent une connexion au
PMS ou au moteur de réservation de l'hôtel. Le module ne les invente pas.

`data-booking-url` doit pointer vers le moteur de réservation officiel. Si une
connexion API au PMS est souhaitée directement dans la conversation, elle doit
être ajoutée côté serveur WordPress avec les accès techniques du fournisseur.

La distribution via les moteurs de recherche conversationnels demande en complément des pages
d'hébergement à jour, des données structurées Schema.org, des tarifs
accessibles et un moteur de réservation techniquement interrogeable.

## Positionnement de la collection

- La Villa Caroline, depuis décembre 2023 : clientèles française et suisse
- Parc Victoria, Côte Ouest / Pays basque, juillet 2025 : clientèles française,
  espagnole et anglo-saxonne
- Hôtel Excelsior, nouvel établissement à Chamonix : clientèles française,
  anglaise et asiatique
- Activité privilégiée : loisirs en semaine, business le week-end
- Thématique : innovation du secteur hôtelier par l'intégration d’assistants intelligents
  marketing

Toutes les règles sont isolées sous `.montagnettes-ai-module` pour limiter les
conflits avec le thème et les styles Elementor.

## Publication GitHub Pages

Si le dossier n'est pas encore lié à GitHub :

```bash
gh auth login
git init -b main
git add .
git commit -m "Ajout du module Les Montagnettes et de la conciergerie"
gh repo create les-montagnettes --public --source=. --remote=origin --push
gh pages deploy . --branch gh-pages
```

Ensuite, l'accueil sera servi par `index.html` et la conciergerie par
`conciergerie-client.html`.
