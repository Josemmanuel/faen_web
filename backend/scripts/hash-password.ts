#!/usr/bin/env node
/**
 * Script para generar un hash bcrypt de una contraseña
 * Uso: npx ts-node scripts/hash-password.ts <contraseña>
 */

import * as bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Uso: npx ts-node scripts/hash-password.ts <contraseña>');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Hash de la contraseña:');
  console.log(hash);
  console.log('\nCopia esto en tu archivo .env:');
  console.log(`ADMIN_PASS_HASH=${hash}`);
});
