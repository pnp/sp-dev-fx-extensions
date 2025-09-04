# Alert Banner Multi-Language Support

The Alert Banner extension now supports multiple languages with automatic detection and user preference storage.

## Supported Languages

- **English (en-us)** - English (Default language)
- **French (fr-fr)** - Français
- **German (de-de)** - Deutsch
- **Spanish (es-es)** - Español
- **Swedish (sv-se)** - Svenska
- **Finnish (fi-fi)** - Suomi
- **Danish (da-dk)** - Dansk
- **Norwegian (nb-no)** - Norsk bokmål

## Features

- **Automatic Language Detection**: Detects user's language from SharePoint context or browser settings
- **Manual Language Selection**: Users can manually change language through the language selector
- **Persistent User Preferences**: Language choice is stored in browser local storage
- **Fallback Support**: Falls back to English if requested language is not available
- **RTL Support Ready**: Framework supports RTL languages (though none are currently implemented)
- **Date/Time Localization**: Automatically formats dates and times according to selected locale

## For Developers

### Using Localized Strings in Components

```typescript
import { useLocalization } from '../Hooks/useLocalization';

const MyComponent: React.FC = () => {
  const { getString, formatDate } = useLocalization();

  return (
    <div>
      <h1>{getString('MyTitle')}</h1>
      <p>{getString('WelcomeMessage', userName)}</p>
      <span>{formatDate(new Date())}</span>
    </div>
  );
};
```

### Using the Localization Service Directly

```typescript
import { LocalizationService } from '../Services/LocalizationService';

const locService = LocalizationService.getInstance();
const text = locService.getString('MyKey');
const formattedDate = locService.formatDate(new Date());
```

### Adding New Strings

1. Add the string key to `src/extensions/alertbanner/loc/myStrings.d.ts`
2. Add translations to all language files in `src/extensions/alertbanner/loc/`
   - `en-us.js` (English - required)
   - `fr-fr.js` (French)
   - `de-de.js` (German) 
   - `es-es.js` (Spanish)
   - `sv-se.js` (Swedish)
   - `fi-fi.js` (Finnish)
   - `da-dk.js` (Danish)
   - `nb-no.js` (Norwegian)

### String Interpolation

Use `{0}`, `{1}`, etc. for parameter placeholders:

```javascript
// In language file
"WelcomeMessage": "Welcome {0}! You have {1} new alerts."

// In component
getString('WelcomeMessage', 'John', 5) // "Welcome John! You have 5 new alerts."
```

### Language File Structure

```javascript
define([], function() {
  return {
    "KeyName": "Translated text",
    "ParameterExample": "Hello {0}, you have {1} items",
    // ... more translations
  }
});
```

## For Administrators

### Language Selection

Users can change their language preference through:
1. **Settings Dialog**: Available in Alert Settings when in edit mode
2. **Automatic Detection**: System automatically detects from SharePoint/browser settings

### Adding New Languages

To add support for a new language:

1. Create a new language file: `src/extensions/alertbanner/loc/[locale].js`
2. Translate all strings from `en-us.js`
3. Add the language to the `_supportedLanguages` array in `LocalizationService.ts`
4. Test the implementation

Example for Italian (it-it):

```javascript
// In LocalizationService.ts
{
  code: 'it-it',
  name: 'Italian',
  nativeName: 'Italiano',
  isRTL: false
}
```

### RTL Language Support

To add RTL language support:

1. Set `isRTL: true` in the language configuration
2. Add appropriate CSS for RTL layout
3. The localization service will automatically detect RTL and provide `isRTL()` method

## Component Integration

### Wrapping with LocalizationProvider

The main application automatically wraps all components with `LocalizationProvider`, making localization available throughout the component tree.

### Language Selector Component

Use the pre-built `LanguageSelector` component to add language switching:

```typescript
import LanguageSelector from '../UI/LanguageSelector';

// Compact mode (icon only)
<LanguageSelector compact={true} />

// Full dropdown
<LanguageSelector />
```

## Best Practices

1. **Always use string keys**: Never hardcode user-facing text
2. **Provide fallbacks**: All strings should exist in English (fallback language)
3. **Test all languages**: Verify UI layout works with longer/shorter text lengths
4. **Use semantic keys**: Choose descriptive key names like `CreateNewAlert` instead of `Button1`
5. **Group related strings**: Use prefixes to organize strings (`Alert_`, `Settings_`, etc.)

## Error Handling

- If a translation key is missing, the key name is returned with a console warning
- If a language file fails to load, English is used as fallback
- The system gracefully handles malformed language files

## Performance Notes

- Language files are loaded on-demand using dynamic imports
- Only the current language and English (fallback) are loaded
- User language preference is cached to avoid repeated detection