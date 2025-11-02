import React from 'react';

// FIX: Relaxed generic constraint from `object` to `any` to support primitive types (like strings for activeView).
// Also, added logic to only merge plain objects, preventing incorrect behavior with arrays and primitives.
export const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue !== null) {
        const parsedValue = JSON.parse(stickyValue);
        // For plain objects, merge stored value with default value to ensure new fields are added.
        // For primitives and arrays, just use the stored value, as merging would break them.
        if (
          typeof defaultValue === 'object' &&
          defaultValue !== null &&
          !Array.isArray(defaultValue) &&
          typeof parsedValue === 'object' &&
          parsedValue !== null &&
          !Array.isArray(parsedValue)
        ) {
          return { ...defaultValue, ...parsedValue };
        }
        return parsedValue;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
      alert(
        'Erro ao salvar dados!\n\n' +
        'O armazenamento local do seu navegador parece estar cheio ou indisponível. Isso pode acontecer ao cadastrar muitos itens com imagens grandes (logos).\n\n' +
        'Para evitar a perda de dados, é altamente recomendável que você faça um backup agora mesmo (Menu > Fazer Backup).\n\n' +
        'Se o problema persistir, pode ser necessário limpar os dados de navegação para este site e depois importar um backup.'
      );
    }
  }, [key, value]);

  return [value, setValue];
};
