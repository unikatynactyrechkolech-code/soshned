# SOS HNED Partner

Mobilní aplikace pro **partnery** havarijního dispečinku [SOS HNED](https://github.com/unikatynactyrechkolech-code/soshned).

## 📱 Co to je?

Flutter aplikace pro zámečníky, odtahovky, servisy a instalatéry, kteří přijímají SOS výjezdy od zákazníků přes hlavní webovou aplikaci SOS HNED.

## 🔗 Propojení s hlavní aplikací

| Komponenta | Detail |
|---|---|
| **Backend** | Supabase (`ysyvbjzpoxpttoofjwfc.supabase.co`) |
| **DB tabulky** | `partners`, `sos_requests` |
| **Auth** | Google Sign-In přes Supabase OAuth |
| **Realtime** | Supabase Realtime (nové SOS požadavky) |
| **Web app** | Next.js 16 PWA v `../sos-hned/` |

## 🏗 Architektura

```
lib/
├── main.dart              # Entry point + Supabase init
├── app.dart               # MaterialApp s GoRouter + theme
├── config/
│   └── app_config.dart    # Supabase URL, API keys, konstanty
├── models/
│   ├── partner.dart       # Partner model (mapuje DB tabulku)
│   └── sos_request.dart   # SOS Request model + SosStatus enum
├── services/
│   └── supabase_service.dart  # CRUD + auth + realtime
├── providers/
│   ├── auth_provider.dart     # Riverpod providers (auth, partner, requests)
│   └── theme_provider.dart    # Light/dark mode (SharedPreferences)
├── router/
│   └── app_router.dart    # GoRouter s auth guard + bottom nav shell
├── screens/
│   ├── login_screen.dart          # Google Sign-In
│   ├── register_screen.dart       # Registrace partnera
│   ├── dashboard_screen.dart      # Dashboard s realtime SOS
│   ├── request_detail_screen.dart # Detail požadavku + akce
│   ├── profile_screen.dart        # Profil partnera
│   ├── settings_screen.dart       # Nastavení + theme toggle
│   └── history_screen.dart        # Historie výjezdů
├── widgets/
│   ├── status_badge.dart   # Barevný status indicator
│   └── request_card.dart   # Karta SOS požadavku
└── theme/
    └── app_theme.dart      # Light + Dark Material3 theme
```

## 🚀 Spuštění

### Předpoklady
- Flutter SDK >= 3.2.0
- Dart >= 3.2.0

### Instalace

```bash
cd sos-hned-partner
flutter pub get
```

### Konfigurace

1. Otevři `lib/config/app_config.dart`
2. Nahraď `YOUR_SUPABASE_ANON_KEY` svým Supabase anon key
3. Nahraď `YOUR_GOOGLE_WEB_CLIENT_ID` a `YOUR_GOOGLE_IOS_CLIENT_ID`

### Spuštění

```bash
# Android
flutter run -d android

# iOS
flutter run -d ios

# Web (pro testování)
flutter run -d chrome
```

## 📊 Supabase tabulky

### `partners`
| Sloupec | Typ | Popis |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK na auth.users |
| jmeno | TEXT | Jméno partnera |
| firma | TEXT | Název firmy |
| telefon | TEXT | Telefon |
| email | TEXT | E-mail |
| kategorie | TEXT | zamecnik/odtahovka/servis/instalater |
| lat, lng | FLOAT | GPS poloha |
| is_online | BOOL | Online/offline stav |
| hodnoceni | NUMERIC | Průměrné hodnocení |

### `sos_requests`
| Sloupec | Typ | Popis |
|---|---|---|
| id | UUID | PK |
| kategorie | TEXT | Typ služby |
| lat, lng | FLOAT | Poloha zákazníka |
| status | TEXT | pending→accepted→in_progress→completed |
| accepted_by | UUID | FK na partners |

## 🎨 Design

- **Light mode jako default** (stejně jako web app)
- Material 3 s custom theme
- SOS HNED branding (červená #EF4444)
- Barvy kategorií konzistentní s web app

## 📄 Licence

© 2026 SOS HNED s.r.o. Všechna práva vyhrazena.
