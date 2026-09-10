# MonCompte — version corrigée

Cette version corrige notamment :
- inscription `/api/auth/register`
- connexion `/api/auth/login`
- déconnexion `/api/auth/logout`
- lecture du compte `/api/me`
- initialisation de recharge `/api/payments/initiate`
- gestion d'erreurs plus explicite
- exigence d'un `JWT_SECRET` de 32 caractères minimum

## Variables Vercel
Production doit contenir :
- DATABASE_URL
- JWT_SECRET
- NEXT_PUBLIC_SITE_URL
- CINETPAY_APIKEY (quand le compte marchand CinetPay est prêt)
- CINETPAY_SITE_ID (quand le compte marchand CinetPay est prêt)

## Base Neon
Les tables `User` et `Payment` doivent exister. Elles ont déjà été créées manuellement dans Neon dans le cadre du dépannage.

## Important
Le code ne crédite jamais un solde simplement parce qu'un navigateur dit qu'un paiement est réussi. Le crédit doit être confirmé par la notification serveur du prestataire de paiement.
Mise à jour du projet
