# Portfolio de Baptiste Laffond — Direction Artistique & Typographie Suisse

> **Étudiant en 2ᵉ année de BUT MMI (Le Puy-en-Velay) & Archer compétiteur Barebow (Millau).**  
> Spécialisé en design éditorial, identité de marque, direction artistique et interfaces web rigoureuses.

---

## 🎯 Aperçu du Projet

Portfolio personnel développé selon les principes de la **grille suisse (International Typographic Style)** inspirée de Josef Müller-Brockmann, alliée à une identité artisanale et cartoon d'atelier.

- **Stack 100% Native & Légère** : HTML5 sémantique, CSS3 moderne (variables CSS, flexbox/grid, animations légères), Vanilla JavaScript sans framework externe.
- **Accessibilité & Contraste** : Palette sombre carbone (`#1A1A1A`) avec accents rouges signature (`#B21231`), respect des standards WCAG AAA.
- **Responsive Design** : Multi-points de rupture (desktop, tablette, mobile) avec menu burger accessible et tiroir de navigation animé.
- **Dossiers de Projets Complets** :
  - *Carquois Magazine N°1* (Édition & PAO, 16 pages)
  - *Identité Visuelle UCPV* (Charte graphique officielle, logos HD & stratégie RSE)
  - *FlèchOptim* (Application d'archerie & outil technique barebow)
  - *Compagnie des Archers du Velay* (Identité historique & signalétique)
  - *Campagne Lacoste Goliath* (Direction artistique & motion)
  - *Tour de France & Mag Interface* (Presse & édition institutionnelle)
  - *Atelier Illustration & Cartoon* (Character design, mascotte d'effigie)

---

## 🚀 Déploiement en 1 Clic sur GitHub Pages

### Méthode 1 : Avec le script automatique Windows
Double-cliquez simplement sur **`publier_sur_github.bat`** à la racine :
1. Le script initialise le dépôt Git local si nécessaire.
2. Il applique le `.gitignore` pour exclure les fichiers bruts trop volumineux (>100 Mo).
3. Il prépare le commit et vous demande l'URL de votre dépôt GitHub (ex: `https://github.com/votre-pseudo/portfolio.git`).
4. Il pousse l'ensemble sur la branche `main`.

### Méthode 2 : En ligne de commande
```bash
git init
git add .
git commit -m "Portfolio Baptiste Laffond — Version finale"
git branch -M main
git remote add origin https://github.com/Baptiste-archerDev/Portfolio.git
git push -u origin main
```

### Méthode 3 : Activer GitHub Pages
1. Sur GitHub, rendez-vous dans **Settings** > **Pages**.
2. Dans **Build and deployment** > **Source**, choisissez **Deploy from a branch**.
3. Sélectionnez la branche **`main`** et le dossier **`/(root)`**, puis cliquez sur **Save**.
4. Votre site sera automatiquement en ligne à l'adresse :  
   `https://baptiste-archerdev.github.io/Portfolio/`

---

## 📁 Architecture des Fichiers

```text
portfolio/
├── index.html                 # Page d'accueil & sélection de projets
├── portfolio-style.css        # Système de design suisse complet & tokens CSS
├── portfolio.js               # Curseur dynamique, menu burger, micro-interactions
├── carquois_mag-1.html        # Dossier 01 : Carquois Mag N°1
├── ucpv.html                  # Dossier 02 : Charte UCPV & Identité
├── FlechOptim.html            # Dossier 03 : Application FlèchOptim
├── archers-du-velay.html      # Dossier 04 : Archers du Velay
├── lacoste_project.html       # Dossier 05 : Lacoste Goliath
├── cv-print.html              # CV A4 imprimable & parcours
├── projets.html               # Index complet des 11 réalisations
├── publier_sur_github.bat     # Script de déploiement en 1 clic
└── .github/workflows/         # Déploiement CI/CD GitHub Pages
```

---

## 👤 Contact

- **Auteur** : Baptiste Laffond
- **Formation** : BUT Métiers du Multimédia et de l'Internet (IUT du Puy-en-Velay)
- **Localisation** : Millau / Le Puy-en-Velay
- **Email** : `laffondbaptiste47@gmail.com`
