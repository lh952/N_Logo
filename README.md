# Logo Library — GitHub Pages + Supabase

यह project एक public logo gallery है। कोई भी visitor logos देख और download कर सकता है।
केवल आपका Supabase admin account login करके logo upload/delete कर सकता है।

## Architecture

- GitHub Pages: website files
- Supabase Auth: admin login
- Supabase Database: logo name/description/path
- Supabase Storage: actual image files

इससे नए logos जोड़ने के लिए GitHub code बदलना जरूरी नहीं है।

## 1. Supabase project बनाइए

Supabase पर नया project बनाइए।

Authentication > Users में अपना admin user बनाइए:
- आपका email
- strong password

फिर `supabase/schema.sql` में `YOUR_ADMIN_EMAIL` को अपने exact admin email से replace करके SQL Editor में पूरा SQL run करें।

### Important
Public sign-up की जरूरत नहीं है। Admin user manually बनाइए और public email/password sign-up बंद रखें।

## 2. Website configure करें

Supabase Project Settings > API से:
- Project URL
- Publishable/anon key

लेकर `config.js` में डालें:

```js
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_PUBLIC_ANON_KEY";
```

**कभी भी service_role/secret key को `config.js` में न डालें।**

## 3. GitHub पर डालें

इस folder की files अपनी GitHub repository में upload करें।

GitHub:
Settings → Pages → Deploy from branch → `main` → `/ (root)` → Save

कुछ समय बाद आपका public website URL मिल जाएगा।

## 4. Website का इस्तेमाल

Public:
- Gallery देखें
- Search करें
- Download करें

Admin:
- `admin.html` खोलें
- admin email/password से login करें
- logo name + description + image चुनें
- Upload करें
- dashboard से delete भी कर सकते हैं

## 5. Security

Frontend में admin button छिपाना security नहीं है। असली security Supabase Row Level Security (RLS) और Storage policies करती हैं।

Public users:
- logos पढ़ सकते हैं
- logo files देख/download कर सकते हैं
- database में insert/delete नहीं कर सकते
- storage में upload/delete नहीं कर सकते

Admin:
- authenticated admin email के साथ upload/delete कर सकता है

## 6. Recommended limits

Website code 5 MB तक image upload स्वीकार करता है। Production में जरूरत के अनुसार limit बदली जा सकती है।

## Files

- `index.html` — public gallery
- `admin.html` — admin login/upload panel
- `app.js` — public gallery logic
- `admin.js` — authentication/upload/delete logic
- `style.css` — responsive design
- `config.js` — Supabase public configuration
- `supabase/schema.sql` — database + security policies
