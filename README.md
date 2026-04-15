# PC BUILDER AR — ImmaTech

Application de realite augmentee pour apprendre a assembler un PC, composant par composant.  
Developpee dans le cadre du projet PRISM — UE Realite Augmentee & Virtuelle, IPSSI 2026.

---

## Contexte

**ImmaTech**, startup specialisee dans la formation professionnelle, nous mandate pour developper une experience immersive destinee a guider des techniciens lors d'interventions complexes.  
Notre solution : une application AR qui permet d'identifier et d'assembler les composants d'un PC a travers un quiz interactif et des modeles 3D en realite augmentee.

## Equipe

| Membre   | Role                                      |
|----------|-------------------------------------------|
| **Marwan**  | HTML / CSS / UI / Design cyberpunk / Assets |
| **Matteo**  | JavaScript / Logique quiz / Modeles 3D / Effets |
| **Mounir**  | Ameliorations, optimisation, features bonus |

## Stack technique

- **A-Frame 1.6.0** — Framework WebXR pour la scene 3D
- **AR.js 3.4.7** — Detection de marqueur AR (Hiro)
- **JavaScript vanilla** — Logique applicative, quiz, effets sonores (Web Audio API)
- **CSS3** — Design cyberpunk, animations, responsive mobile
- **GLB/glTF** — Modeles 3D des composants PC

## Fonctionnalites

- 7 etapes d'assemblage PC (PSU, carte mere, CPU, watercooling, RAM, GPU, SSD)
- Quiz de diagnostic a chaque etape avec scoring (+100 / +50 / -20 pts)
- Affichage du modele 3D realiste du composant sur le marqueur AR
- Animation scale-in + rotation continue des modeles
- Effets visuels : particules, flash ecran, glitch, popups de score
- Effets sonores synthetises (Web Audio API)
- Musique de fond (toggle on/off)
- Systeme de rangs (S+ / A / B / C) en fin de partie
- Ecran final avec stats detaillees (score, temps, erreurs)
- Interface cyberpunk responsive (mobile-first)

## Utilisation

1. Ouvrir l'application dans un navigateur mobile (Chrome Android / Safari iOS)
2. Autoriser l'acces a la camera
3. Imprimer ou afficher le **marqueur Hiro** sur un ecran :

   ![Marqueur Hiro](https://upload.wikimedia.org/wikipedia/commons/4/48/Hiro_marker_ARjs.png)

4. Scanner le marqueur et repondre aux quiz pour assembler le PC

## Lancer en local

Serveur local necessaire (les fichiers GLB ne se chargent pas en `file://`) :

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

Puis ouvrir `http://localhost:8080` sur mobile (meme reseau Wi-Fi).

## Structure du projet

```
ImmaTech/
  index.html              # Structure HTML principale
  css/
    style.css             # Design cyberpunk complet
  js/
    app.js                # Logique : quiz, modeles 3D, effets, scoring
  assets/
    models/               # 8 fichiers GLB (composants PC + PC complet)
    audio/
      bgm.mp3             # Musique de fond
```

## Parcours

**Parcours AR+** (obligatoire) — Application AR complete avec marqueur Hiro, 7 interactions distinctes, scene multi-objets avec animations, systeme de score et progression.

## Deploiement

Deploye via **GitHub Pages** :  
`https://arwa-maw.github.io/ImmaTech/`

---

*Projet PRISM — BTC2 — IPSSI 2026 — Hugo LIEGEARD*
