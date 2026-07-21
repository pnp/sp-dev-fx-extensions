import { resolveFeatureFlags, parseFeatureFlagsFromProperties, normalizeFeatureOverrides } from './IHeaderFeatures';
import { DEFAULT_FEATURE_FLAGS } from './IHeaderFeatures';

describe('resolveFeatureFlags', () => {
  it('returns defaults when both inputs are undefined', () => {
    const result = resolveFeatureFlags(undefined, undefined);
    expect(result.searchEnabled).toBe(DEFAULT_FEATURE_FLAGS.searchEnabled);
    expect(result.footerEnabled).toBe(DEFAULT_FEATURE_FLAGS.footerEnabled);
  });

  it('component properties override term set features', () => {
    const termSetFeatures = { searchEnabled: false, footerEnabled: true };
    const componentFeatures = { searchEnabled: true };
    const result = resolveFeatureFlags(termSetFeatures, componentFeatures);
    expect(result.searchEnabled).toBe(true);
    expect(result.footerEnabled).toBe(true);
  });

  it('term set features override defaults', () => {
    const termSetFeatures = { searchEnabled: false };
    const result = resolveFeatureFlags(termSetFeatures, undefined);
    expect(result.searchEnabled).toBe(false);
    expect(result.footerEnabled).toBe(DEFAULT_FEATURE_FLAGS.footerEnabled);
  });
});

describe('parseFeatureFlagsFromProperties', () => {
  it('parses boolean string values', () => {
    const result = parseFeatureFlagsFromProperties({
      searchEnabled: 'true',
      footerEnabled: 'false',
      bookmarksEnabled: 'yes',
      helpEnabled: 'on'
    });
    expect(result.searchEnabled).toBe(true);
    expect(result.footerEnabled).toBe(false);
    expect(result.bookmarksEnabled).toBe(true);
    expect(result.helpEnabled).toBe(true);
  });

  it('parses string properties', () => {
    const result = parseFeatureFlagsFromProperties({
      searchScope: 'guid-here',
      helpUrl: 'https://help.example.com'
    });
    expect(result.searchScope).toBe('guid-here');
    expect(result.helpUrl).toBe('https://help.example.com');
  });

  it('parses footerHeight as number', () => {
    const result = parseFeatureFlagsFromProperties({ footerHeight: '64' });
    expect(result.footerHeight).toBe(64);
  });
});

describe('normalizeFeatureOverrides', () => {
  it('returns empty object for undefined input', () => {
    expect(normalizeFeatureOverrides(undefined)).toEqual({});
  });

  it('parses JSON string input', () => {
    const result = normalizeFeatureOverrides('{"searchEnabled":false,"footerEnabled":true}');
    expect(result.searchEnabled).toBe(false);
    expect(result.footerEnabled).toBe(true);
  });

  it('ignores unknown keys', () => {
    const result = normalizeFeatureOverrides({ unknownFlag: true } as Record<string, unknown>);
    expect((result as Record<string, unknown>).unknownFlag).toBeUndefined();
  });
});