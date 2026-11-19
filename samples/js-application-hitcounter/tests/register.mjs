// Tests only: lets Node load the compiled lib/ ES modules, whose relative
// imports have no ".js" extension (the SPFx bundler doesn't need one).
import { register } from 'node:module';

register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && !specifier.endsWith('.js')) {
      return next(specifier + '.js', context);
    }
    throw error;
  }
}`), import.meta.url);
