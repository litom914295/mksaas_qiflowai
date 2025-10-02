#!/usr/bin/env node

import fs from 'fs';
import iconv from 'iconv-lite';
import path from 'path';
import vm from 'vm';

const projectRoot = path.resolve(__dirname, '..');
const sourceThemesDir = path.join(projectRoot, 'FengShuiCompass', 'src', 'themes');
const outputFile = path.join(projectRoot, 'src', 'lib', 'compass', 'themes.generated.ts');

const themeFiles = [
  { key: 'compass', file: 'theme-compass.ts' },
  { key: 'dark', file: 'theme-dark.ts' },
  { key: 'simple', file: 'theme-simple.ts' },
  { key: 'polygon', file: 'theme-polygon.ts' },
  { key: 'crice', file: 'theme-crice.ts' },
];

function readThemeSource(fullPath) {
  const buffer = fs.readFileSync(fullPath);
  const utf8Text = buffer.toString('utf8');
  if (utf8Text.includes('\uFFFD')) {
    return iconv.decode(buffer, 'gbk');
  }
  return utf8Text;
}

function loadTheme(filePath) {
  const fullPath = path.join(sourceThemesDir, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Theme file not found: ${fullPath}`);
  }
  let content = readThemeSource(fullPath);
  content = content.replace(/import[^;]+;\s*/g, '');
  content = content.replace(/const\s+theme\s*:[^=]+=\s*/, 'module.exports = ');
  content = content.replace(/export\s+default\s+theme;?/g, '');

  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  try {
    const script = new vm.Script(content, { filename: fullPath });
    script.runInContext(context);
  } catch (error) {
    throw new Error(`Failed to evaluate theme file ${fullPath}: ${error.message}`);
  }

  return context.module.exports;
}

function convertTheme(raw, key) {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Invalid theme data for ${key}`);
  }

  const { scaclStyle, scaleStyle, data, ...rest } = raw;
  const resolvedScaleStyle = scaleStyle || scaclStyle;
  if (!resolvedScaleStyle) {
    throw new Error(`Missing scale style definition for theme ${key}`);
  }

  const layers = Array.isArray(data) ? data : [data];
  const normalizedLayers = layers.map((layer, index) => {
    if (!layer || typeof layer !== 'object') {
      throw new Error(`Invalid layer definition at index ${index} for theme ${key}`);
    }
    return { ...layer };
  });

  return {
    ...rest,
    scaleStyle: resolvedScaleStyle,
    data: normalizedLayers,
  };
}

function buildThemes() {
  const themes = {};
  for (const entry of themeFiles) {
    const rawTheme = loadTheme(entry.file);
    themes[entry.key] = convertTheme(rawTheme, entry.key);
  }
  return themes;
}

function generateFile() {
  const themes = buildThemes();
  const literal = JSON.stringify(themes, null, 2);
  const keysLiteral = JSON.stringify(themeFiles.map((item) => item.key));
  const header = `/**\n * THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.\n * Generated from FengShuiCompass theme definitions.\n */\n`;
  const content = `${header}\nimport type { CompassTheme } from './themes';\n\nexport const importedCompassThemes: Record<string, CompassTheme> = ${literal};\nexport const importedThemeKeys = ${keysLiteral} as const;\n\nexport default importedCompassThemes;\n`;
  fs.writeFileSync(outputFile, content, 'utf8');
  console.log(`Generated compass themes at ${outputFile}`);
}

generateFile();
