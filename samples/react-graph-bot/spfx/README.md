## graph-bot

### Graph/Intents ###

| Intent                                                | Graph Query
| ----------------------------------------------------- | -------------------------------------------------------------|
| Search for people                                     | https://graph.microsoft.com/beta/me/people/?$search="franck cornu"
| Search for people manager                             | https://graph.microsoft.com/v1.0/users/{id|userPrincipalName}/manager
| Give me my planing today                              | users/{Garth-id | Garth-userPrincipalName}/events


- Faire fonctionner la solution bout en bout avec une recherche de personnes simple
- Formatter les résultats sous forme de carte correctement pour les personnes
- Configurer les modèles LUIS avec des exemples + récupération d'entitiés sur le nom de la personne à rechercher
- (Option) Provisionnner automatiquement le modèle LUIS

- Plus compliqué: Céduler un meeting
- 