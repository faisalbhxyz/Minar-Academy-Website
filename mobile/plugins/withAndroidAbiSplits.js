const {
  createRunOncePlugin,
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');

// No dots in the property name — ORG_GRADLE_PROJECT_* env overrides are unreliable with dots.
const PROP_ENABLE_SPLITS = 'enableSeparateBuildPerCPUArchitecture';
const PROP_ARCHITECTURES = 'reactNativeArchitectures';

/**
 * Persist ABI splits across `expo prebuild` (EAS ignores /android because it's gitignored).
 *
 * Default OFF so `bundleRelease` / Play Store AAB works.
 * Enable only for APK profiles via ORG_GRADLE_PROJECT_enableSeparateBuildPerCPUArchitecture=true.
 */
function upsertGradleProperty(properties, key, value) {
  const index = properties.findIndex(
    (item) => item.type === 'property' && item.key === key
  );
  if (index >= 0) {
    properties[index].value = value;
  } else {
    properties.push({ type: 'property', key, value });
  }
}

function ensureAbiSplitsInAppBuildGradle(contents) {
  // Replace older dotted property name if present from a previous plugin version.
  contents = contents.replace(
    /android\.enableSeparateBuildPerCPUArchitecture/g,
    PROP_ENABLE_SPLITS
  );

  if (
    contents.includes(`findProperty('${PROP_ENABLE_SPLITS}')`) &&
    /splits\s*\{\s*abi\s*\{/.test(contents)
  ) {
    // Ensure AAB-safe default (false) even if an older template defaulted to true.
    contents = contents.replace(
      new RegExp(
        `findProperty\\('${PROP_ENABLE_SPLITS}'\\) \\?: '[^']+'`,
        'g'
      ),
      `findProperty('${PROP_ENABLE_SPLITS}') ?: 'false'`
    );
    return contents;
  }

  if (!contents.includes(`findProperty('${PROP_ENABLE_SPLITS}')`)) {
    contents = contents.replace(
      /\nandroid\s*\{/,
      `\n\ndef enableSeparateBuildPerCPUArchitecture = (findProperty('${PROP_ENABLE_SPLITS}') ?: 'false').toBoolean()\n\nandroid {`
    );
  }

  if (!/splits\s*\{\s*abi\s*\{/.test(contents)) {
    const splitsBlock = `
    splits {
        abi {
            reset()
            enable enableSeparateBuildPerCPUArchitecture
            universalApk false
            include "armeabi-v7a", "arm64-v8a"
        }
    }
`;
    const withDefaultConfig = contents.replace(
      /(defaultConfig\s*\{[\s\S]*?\n    \}\n)/,
      `$1${splitsBlock}`
    );
    contents = withDefaultConfig.includes('splits {')
      ? withDefaultConfig
      : contents.replace(/\nandroid\s*\{/, `\nandroid {${splitsBlock}`);
  }

  return contents;
}

const withAndroidAbiSplits = (config) => {
  config = withGradleProperties(config, (cfg) => {
    upsertGradleProperty(cfg.modResults, PROP_ARCHITECTURES, 'armeabi-v7a,arm64-v8a');
    // Default off for AAB; APK EAS profiles override via env.
    upsertGradleProperty(cfg.modResults, PROP_ENABLE_SPLITS, 'false');
    // Drop legacy dotted key if prebuild left it around.
    cfg.modResults = cfg.modResults.filter(
      (item) =>
        !(
          item.type === 'property' &&
          item.key === 'android.enableSeparateBuildPerCPUArchitecture'
        )
    );
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = ensureAbiSplitsInAppBuildGradle(cfg.modResults.contents);
    return cfg;
  });

  return config;
};

module.exports = createRunOncePlugin(
  withAndroidAbiSplits,
  'with-android-abi-splits',
  '1.1.0'
);
