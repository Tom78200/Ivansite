import { useAutoTranslation } from '@/hooks/useAutoTranslation';

export default function TranslatedText({ text }: { text: string }) {
  const { translatedText } = useAutoTranslation(text || '');
  return translatedText as unknown as any;
}


